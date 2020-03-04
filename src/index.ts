import equal from "fast-deep-equal";
import produce from "immer";
import { useEffect, useState } from "react";
import { CubeState } from "./typings";

const isProd = process.env.NODE_ENV === "production";
const isPromise = (obj: PromiseLike<any>) => {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
};

export default function init(initOpt: CubeState.InitOpt = {}) {
  const storeMap: CubeState.StoreMap = {};
  const initOption = {
    pureChecker: (fnName: string) => fnName.startsWith("$_"),
    ...initOpt
  };

  const hookMap: CubeState.HookMap = {
    onError: [],
    beforeReducer: [],
    afterReducer: [],
    beforeEffect: [],
    afterEffect: []
  };

  function use(plugin: CubeState.Plugin) {
    Object.keys(hookMap).forEach(hookKey => {
      const key = hookKey as keyof CubeState.Plugin;
      if (typeof plugin[key] === "function") {
        // @ts-ignore
        hookMap[key].push(plugin[key]);
      }
    });
  }

  function createStore<
    S,
    R extends CubeState.EnhanceReducers<S>,
    E extends CubeState.EnhanceEffects<S>
  >(opt: CubeState.Opt<S, R, E>) {
    const {
      name: storeName,
      state: _storeState,
      reducers: storeReducers,
      effects: storeEffects,
      ...rest
    } = opt;
    let storeState: S = _storeState;
    const updaters: Array<CubeState.Updater<S>> = [];

    function useStore<P = CubeState.Holder>(
      selector?: CubeState.StateSelector<S, P>
    ) {
      const forceUpdate = useState(0)[1];

      const updater: any = (oldState: S, nextState: S) => {
        const shouldUpdate = !equal(
          selector ? selector(oldState) : oldState,
          selector ? selector(nextState) : nextState
        );
        if (shouldUpdate) {
          forceUpdate(c => c + 1);
        }
      };

      useEffect(() => {
        updaters.push(updater);
        return () => {
          updaters.splice(updaters.indexOf(updater), 1);
        };
      }, []);

      return (selector
        ? selector(storeState)
        : storeState) as P extends CubeState.Holder ? S : P;
    }

    let customEffect = {};
    if (typeof initOption.extendEffect === "function") {
      customEffect = initOption.extendEffect({
        select: getState,
        update: (s: Partial<S>) => wrapHook(() => setState(s), "setState")
      });
    }
    const effects = {} as CubeState.Effects<E>;
    if (typeof storeEffects === "object") {
      Object.keys(storeEffects).forEach(fnName => {
        const originalEffect = storeEffects[fnName];
        // @ts-ignore
        effects[fnName] = async function<A, B>(payload: A, ...extra: B[]) {
          const effectFn = {
            async call<A, R>(fn: CubeState.CalledFn<A, R>, payload: A) {
              const res = await fn(payload);
              return res;
            },
            select: getState,
            update: (s: Partial<S>) =>
              wrapHook(() => setState(s), fnName + " update"),
            ...customEffect,
            storeMap
          };
          let ps: Array<Promise<any>> = [];
          produce<any, any>(payload, (pay: any) => {
            for (const beforeEffect of hookMap.beforeEffect as Array<
              CubeState.BeforeEffectHook<S>
            >) {
              const p = beforeEffect({
                storeName,
                effectName: fnName,
                payload: pay,
                extra,
                ...effectFn
              });
              isPromise(p) && ps.push(p);
            }
          });
          await Promise.all(ps);
          let result = null;
          let error = null;
          try {
            result = await originalEffect(effectFn, payload, ...(extra || []));
          } catch (e) {
            error = e;
          }
          ps = [];
          produce<any, any>(result, (res: any) => {
            for (const afterEffect of hookMap.afterEffect as Array<
              CubeState.AfterEffectHook<S>
            >) {
              const p = afterEffect({
                storeName,
                effectName: fnName,
                payload,
                result: res,
                ...effectFn
              });
              isPromise(p) && ps.push(p);
            }
          });
          await Promise.all(ps);
          if (error) {
            throw error;
          }
          return result;
        };
      });
    }

    const reducers = {} as CubeState.Reducers<R>;
    if (typeof storeReducers === "object") {
      Object.keys(storeReducers).forEach(fnName => {
        const isPure = initOption.pureChecker(fnName);
        // @ts-ignore
        reducers[fnName] = function(...payload: any) {
          let result: any;
          const originalReducer = storeReducers[fnName];
          const reducer = (s: S) =>
            wrapHook(() => originalReducer(s, ...payload), fnName, payload);
          // immer don't support circular object
          const nextState: S = isPure
            ? reducer(storeState)
            : produce<S, S>(storeState, reducer);
          setState(nextState);
          return result;
        } as CubeState.EnhanceReducerFn<
          R[Extract<keyof (R extends undefined ? undefined : R), string>]
        >;
      });
    }

    function wrapHook(execute: Function, fnName: string, payload?: any) {
      let result: any;
      (hookMap.beforeReducer || []).forEach(
        (beforeReducer: CubeState.ReducerHook) =>
          beforeReducer({
            storeName,
            reducerName: fnName,
            payload: payload || storeState
          })
      );
      result = execute();
      (hookMap.afterReducer || []).forEach(
        (afterReducer: CubeState.ReducerHook) =>
          afterReducer({
            storeName,
            reducerName: fnName,
            payload: payload || result
          })
      );
      return result;
    }

    function getState<P = CubeState.Holder>(
      selector?: CubeState.StateSelector<S, P>
    ) {
      return selector
        ? selector(storeState)
        : (storeState as P extends CubeState.Holder ? S : P);
    }

    function setState(newState: Partial<S>) {
      const oldState = storeState;
      storeState = { ...oldState, ...newState };
      updaters.forEach(updater => {
        updater(oldState, storeState);
      });
    }

    const newStore = {
      ...rest,
      name: storeName,
      stateType: storeState,
      reducers,
      effects,
      useStore,
      getState
    };

    // only used for typing
    delete newStore.stateType;

    if (typeof initOption.onCreate === "function") {
      initOption.onCreate(newStore);
    }

    if (storeMap[storeName] && !isProd) {
      throw new Error(`store name：${storeName} duplicated!`);
    } else {
      storeMap[storeName] = newStore;
    }

    return newStore;
  }

  return {
    use,
    createStore,
    storeMap
  };
}

type CubeAPI = ReturnType<typeof init>;
export { init, CubeAPI };
