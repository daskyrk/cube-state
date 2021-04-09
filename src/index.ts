import equal from "fast-deep-equal";
import produce from "immer";
import { useEffect, useState } from "react";
import { CubeState } from "./typings";

type Merge<A, B> = ({ [K in keyof A]: K extends keyof B ? B[K] : A[K] } &
  B) extends infer O
  ? { [K in keyof O]: O[K] }
  : never;
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
      name: originName,
      state: originState,
      effects: originEffect,
      reducers: originReducers,
      ...rest
    } = opt;
    function extend<
      ES,
      ER extends CubeState.EnhanceReducers<Merge<S, ES>>,
      EE extends CubeState.EnhanceEffects<Merge<S, ES>>
    >(extOpt: CubeState.ExtOpt<ES, ER, EE>) {
      const { name, state, reducers, effects, ...extRest } = extOpt;
      // if provide name, generate a new store
      if (name && storeMap[name]) {
        if(initOption.allowDuplicatedStore)return storeMap[name];
        if(!isProd)throw new Error(`[cube-state] Store name：${name} duplicated!`);
      }

      type MergedState = Merge<S, ES>;
      // have name and this -> baseStore.extend({ name: new }): create new base on baseStore
      // have name without this -> extend({ name: new }): create new by createStore
      // no name have this -> baseStore.extend({}): extend baseStore
      // no name and this -> extend({}): not exist

      // create new store
      let newName = name as string; // if no name, will set later
      let _state = (state as unknown) as MergedState;
      const _effects = {} as CubeState.Effects<Merge<E, EE>>;
      const _reducers = {} as CubeState.Reducers<Merge<R, ER>>;
      let mergedEffects = effects || ({} as any);
      let mergedReducers = reducers || ({} as any);
      // @ts-ignore
      if (this) {
        // @ts-ignore
        const baseStore: CubeState.StoreItem = this;
        newName = baseStore.name;
        const baseState = baseStore.getState((s: any) => s);
        const baseOpt = storeMap[baseStore.name]._opt;
        _state = state ? { ...baseState, ...state } : { ...baseState };
        // 扩展旧的时，使用原始的opt重新构建effects和reducers，直接合并会和baseStore有联系
        mergedEffects = { ...baseOpt.effects, ...effects };
        mergedReducers = { ...baseOpt.reducers, ...reducers };
      }

      const updaters: Array<CubeState.Updater<MergedState>> = [];

      function useStore<P>(selector: CubeState.StateSelector<MergedState, P>) {
        const forceUpdate = useState(0)[1];

        const updater: any = (
          oldState: MergedState,
          nextState: MergedState
        ) => {
          const shouldUpdate = !equal(selector(oldState), selector(nextState));
          shouldUpdate && forceUpdate(n => n + 1);
          updater.dirty = false;
        };
        updaters.push(updater);

        useEffect(() => {
          updater.ready = true;
          // maybe state changed before mount
          updater.dirty && forceUpdate(n => n + 1);
          return () => {
            updaters.splice(updaters.indexOf(updater), 1);
          };
        }, []);

        return selector(_state) as Readonly<P>; // mark as readonly but not really freeze it
      }

      let customEffect = {};
      if (typeof initOption.extendEffect === "function") {
        customEffect = initOption.extendEffect({
          select: getState,
          update: (s: Partial<MergedState>) =>
            wrapHook(() => setState(s), "setState")
        });
      }

      if (typeof mergedEffects === "object") {
        Object.keys(mergedEffects).forEach(fnName => {
          const originalEffect = mergedEffects[fnName];
          // @ts-ignore
          _effects[fnName] = async function<A, B>(payload: A, ...extra: B[]) {
            const effectFn = {
              async call<A, ER>(fn: CubeState.CalledFn<A, ER>, payload: A) {
                const res = await fn(payload);
                return res;
              },
              select: getState,
              update: (s: Partial<MergedState>) =>
                wrapHook(() => setState(s), fnName + " update"),
              ...customEffect,
              storeMap
            };
            let ps: Array<Promise<any>> = [];
            produce<any, any>(payload, (pay: any) => {
              for (const beforeEffect of hookMap.beforeEffect as Array<
                CubeState.BeforeEffectHook<MergedState>
              >) {
                const p = beforeEffect({
                  storeName: newName,
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
              result = await originalEffect(
                effectFn,
                payload,
                ...(extra || [])
              );
            } catch (e) {
              error = e;
            }
            ps = [];
            produce<any, any>(result, (res: any) => {
              for (const afterEffect of hookMap.afterEffect as Array<
                CubeState.AfterEffectHook<MergedState>
              >) {
                const p = afterEffect({
                  storeName: newName,
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

      if (typeof mergedReducers === "object") {
        Object.keys(mergedReducers).forEach(fnName => {
          const isPure = initOption.pureChecker(fnName);
          // @ts-ignore
          _reducers[fnName] = function(...payload: any) {
            const originalReducer = mergedReducers[fnName];
            const reducer = (s: MergedState) =>
              wrapHook(() => originalReducer(s, ...payload), fnName, payload);
            // immer don't support circular object
            const nextState: MergedState = isPure
              ? reducer(_state)
              : produce<MergedState, MergedState>(_state, reducer);
            setState(nextState);
            return nextState;
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
              storeName: newName,
              reducerName: fnName,
              payload: payload || _state
            })
        );
        result = execute();
        (hookMap.afterReducer || []).forEach(
          (afterReducer: CubeState.ReducerHook) =>
            afterReducer({
              storeName: newName,
              reducerName: fnName,
              payload: payload || result
            })
        );
        return result;
      }

      function getState<P>(selector: CubeState.StateSelector<MergedState, P>) {
        return selector(_state);
      }

      function setState(newState: Partial<MergedState>) {
        const oldState = _state;
        _state = { ...oldState, ...newState };
        updaters.forEach(updater => {
          updater.dirty = true;
          updater.ready && updater(oldState, _state);
        });
      }

      const storeItem = {
        ...rest,
        ...extRest,
        name: newName,
        stateType: _state,
        reducers: _reducers,
        effects: _effects,
        getState,
        useStore,
        extend
      };

      (storeItem as any)._opt = { ...opt, ...extOpt };
      // only used for typing
      // @ts-ignore
      delete storeItem.stateType;

      storeMap[newName] = storeItem as CubeState.StoreItem;

      return storeItem;
    }

    const newStore = extend(opt as any);
    // overwrite type
    type newStoreType = Merge<
      typeof newStore,
      {
        stateType: S;
        reducers: CubeState.Reducers<R>;
        effects: CubeState.Effects<E>;
      }
    >;

    if (typeof initOption.onCreate === "function") {
      initOption.onCreate(newStore as CubeState.StoreItem);
    }

    return (newStore as unknown) as newStoreType;
  }

  function createFlatStore<
    S,
    R extends CubeState.EnhanceReducers<S>,
    E extends CubeState.EnhanceEffects<S>
  >(opt: CubeState.Opt<S, R, E>) {
    const { reducers, effects, useStore, getState, ...rest } = createStore(opt);
    return {
      ...rest,
      ...effects,
      ...reducers,
      _effects: effects,
      _reducers: reducers,
      useStore,
      getState
    };
  }

  return {
    use,
    storeMap,
    createStore,
    createFlatStore
  };
}

type CubeAPI = ReturnType<typeof init>;
export { init, CubeAPI };
