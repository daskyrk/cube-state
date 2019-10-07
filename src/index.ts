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

let initFlag = false;
let customEffectMeta = {};
function init(initOpt: CubeState.InitOpt = {}) {
  if (initFlag) {
    return;
  }
  initFlag = true;
  const { effectMeta } = initOpt;
  if (typeof effectMeta === "function") {
    customEffectMeta = effectMeta({ storeMap });
  }
}

// function defaultSelector<S, P>(state: S) {
//   return state as P extends S ? S : P;
// }
function createStore<
  S,
  R extends CubeState.EnhanceReducers<S>,
  E extends CubeState.EnhanceEffects<S>
>(opt: CubeState.Opt<S, R, E>) {
  const storeName = opt.name;
  let storeState: S = opt.state;
  const storeReducers = opt.reducers;
  const storeEffects = opt.effects;
  const updaters: Array<CubeState.Updater<S>> = [];

  function useStore<P>(selector: CubeState.StateSelector<S, P>) {
    const [state, setState] = useState(() => selector(storeState));

    const updater: any = (oldState: S, nextState: S) => {
      const shouldUpdate = !equal(selector(oldState), selector(nextState));
      if (shouldUpdate) {
        setState(() => selector(nextState));
      }
    };

    useMount(() => {
      updaters.push(updater);
      return () => {
        updaters.splice(updaters.indexOf(updater), 1);
      };
    });

    return Object.freeze(state);
  }

  const effects = {} as CubeState.Effects<E>;
  if (typeof storeEffects === "object") {
    const effectMeta = {
      async call<A, R>(fn: CubeState.CalledFn<A, R>, payload: A) {
        const res = await fn(payload);
        return res;
      },
      select: getState,
      update: updateState,
      ...customEffectMeta,
      storeMap
    };
    Object.keys(storeEffects).forEach(fnName => {
      const originalEffect = storeEffects[fnName];
      // @ts-ignore
      effects[fnName] = async function<A, B>(payload: A, extra?: B) {
        let ps: Array<Promise<any>> = [];
        produce<any, any>(payload, (pay: any) => {
          for (const beforeEffect of hookMap.beforeEffect as Function[]) {
            const p = beforeEffect({
              storeName,
              effectName: fnName,
              payload: pay,
              extra,
              ...effectMeta
            });
            isPromise(p) && ps.push(p);
          }
        });
        await Promise.all(ps);
        const result = await originalEffect(effectMeta, payload, extra);
        ps = [];
        produce<any, any>(result, (res: any) => {
          for (const afterEffect of hookMap.afterEffect as Function[]) {
            const p = afterEffect({
              storeName,
              effectName: fnName,
              payload,
              result: res,
              ...effectMeta
            });
            isPromise(p) && ps.push(p);
          }
        });
        await Promise.all(ps);
        return result;
      };
    });
  }

  const reducers = {} as CubeState.Reducers<R>;
  if (typeof storeReducers === "object") {
    Object.keys(storeReducers).forEach(fnName => {
      // @ts-ignore
      reducers[fnName] = function(...payload: any) {
        let result: any;
        const originalReducer = storeReducers[fnName];
        const nextState: S = produce<S, S>(storeState, (draft: S) => {
          (hookMap.beforeReducer || []).forEach(beforeReducer =>
            beforeReducer({ storeName, reducerName: fnName, payload })
          );
          result = originalReducer(draft, ...payload);
          (hookMap.afterReducer || []).forEach(afterReducer =>
            afterReducer({ storeName, reducerName: fnName, payload })
          );
          return result;
        });
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

  function getState<P>(selector: CubeState.StateSelector<S, P>) {
    return selector(storeState);
  }

  function updateState(newState: Partial<S>) {
    const oldState = storeState;
    storeState = { ...oldState, ...newState };
    updaters.forEach(updater => {
      updater(oldState, storeState);
    });
  }

  const newStore = {
    name: storeName,
    state: storeState,
    reducers,
    effects,
    useStore,
    getState
  };

  if (storeMap[storeName]) {
    console.error(`store name${storeName} duplicated!`);
  } else {
    storeMap[storeName] = newStore;
  }

  return newStore;
}

function getStoreMap() {
  return storeMap;
}

export * from "./index";
export { init, createStore, getStoreMap, use };
export default { init, createStore, getStoreMap, use };
