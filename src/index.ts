import equal from "fast-deep-equal";
import produce from "immer";
import { useState } from "react";
import { isPromise, useMount } from "./util";
import { CubeState } from "./typings";

const storeMap: CubeState.StoreMap = {};

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
    const [state, setState] = useState(() =>
      selector ? selector(storeState) : storeState
    );

    const updater: any = (oldState: S, nextState: S) => {
      const shouldUpdate = !equal(
        selector ? selector(oldState) : oldState,
        selector ? selector(nextState) : nextState
      );
      if (shouldUpdate) {
        setState(() => (selector ? selector(nextState) : nextState));
      }
    };

    useMount(() => {
      updaters.push(updater);
      return () => {
        updaters.splice(updaters.indexOf(updater), 1);
      };
    });

    return Object.freeze(state) as P extends CubeState.Holder ? S : P;
  }

  let customEffect = {};
  if (typeof initOption.extendEffect === "function") {
    customEffect = initOption.extendEffect({
      storeMap,
      select: getState,
      update: updateState
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
          update: updateState,
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
      const isPure = !!initOption.pureChecker(fnName);
      // @ts-ignore
      reducers[fnName] = function(...payload: any) {
        let result: any;
        const originalReducer = storeReducers[fnName];
        const reducerFn = (s: S) => {
          (hookMap.beforeReducer || []).forEach(
            (beforeReducer: CubeState.ReducerHook) =>
              beforeReducer({ storeName, reducerName: fnName, payload })
          );
          result = originalReducer(s, ...payload);
          (hookMap.afterReducer || []).forEach(
            (afterReducer: CubeState.ReducerHook) =>
              afterReducer({ storeName, reducerName: fnName, payload })
          );
          return result;
        };
        const nextState: S = isPure
          ? reducerFn(storeState)
          : produce<S, S>(storeState, reducerFn);
        const oldState = storeState;
        storeState = nextState;
        updaters.forEach(updater => {
          updater(oldState, nextState);
        });
        return result;
      } as CubeState.EnhanceReducerFn<
        R[Extract<keyof (R extends undefined ? undefined : R), string>]
      >;
    });
  }

  function getState<P = CubeState.Holder>(
    selector?: CubeState.StateSelector<S, P>
  ) {
    return selector
      ? selector(storeState)
      : (storeState as P extends CubeState.Holder ? S : P);
  }

  function updateState(newState: Partial<S>) {
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

  if (storeMap[storeName]) {
    console.error(`store name：${storeName} duplicated!`);
  } else {
    storeMap[storeName] = newStore;
  }

  return newStore;
}

function getStoreMap() {
  return storeMap;
}

const api = {
  use,
  createStore,
  getStoreMap
};
let initFlag = false;
let initOption: CubeState.InitOpt = {
  pureChecker(fnName: string) {
    return fnName.startsWith("$_");
  }
};
function init(initOpt?: Partial<CubeState.InitOpt>) {
  if (initFlag) {
    return api;
  }
  initFlag = true;
  initOption = { ...initOpt, ...initOption };
  return api;
}

export default init;
