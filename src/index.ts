import equal from "fast-deep-equal";
import produce from "immer";
import { useState } from "react";
import {
  calledFn,
  Effects,
  EnhanceEffects,
  EnhanceReducerFn,
  EnhanceReducers,
  HookMap,
  InitOpt,
  Opt,
  Plugin,
  Reducers,
  StateSelector,
  StoreMap,
  Updater
} from "./index.d";
import { isPromise, useMount } from "./util";

const storeMap: StoreMap = {};

const hookMap: HookMap = {
  onError: [],
  beforeReducer: [],
  afterReducer: [],
  beforeEffect: [],
  afterEffect: []
};

function use(plugin: Plugin) {
  Object.keys(hookMap).forEach(hookKey => {
    const key = hookKey as keyof Plugin;
    if (typeof plugin[key] === "function") {
      // @ts-ignore
      hookMap[key].push(plugin[key]);
    }
  });
}

let initFlag = false;
let customEffectMeta = {};
function init(initOpt: InitOpt = {}) {
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
  R extends EnhanceReducers<S>,
  E extends EnhanceEffects<S>
>(opt: Opt<S, R, E>) {
  const storeName = opt.name;
  let storeState: S = opt.state;
  const updaters: Array<Updater<S>> = [];

  function useStore<P>(selector: StateSelector<S, P>) {
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

    return state;
  }

  const effects = {} as Effects<E>;
  if (typeof opt.effects === "object") {
    const effectMeta = {
      async call<A, R>(fn: calledFn<A, R>, payload: A, extra?: any) {
        const res = await fn(payload);
        return res;
      },
      select: getState,
      update: updateState,
      ...customEffectMeta,
      storeMap
    };
    Object.keys(opt.effects).forEach(fnName => {
      // @ts-ignore
      const originalEffect = opt.effects[fnName];
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

  const reducers = {} as Reducers<R>;
  if (typeof opt.reducers === "object") {
    Object.keys(opt.reducers).forEach(fnName => {
      // @ts-ignore
      reducers[fnName] = function(...payload: any) {
        let result: any;
        // @ts-ignore
        const originalReducer = opt.reducers[fnName];
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
      } as EnhanceReducerFn<
        R[Extract<keyof (R extends undefined ? undefined : R), string>]
      >;
    });
  }

  function getState<P>(selector: StateSelector<S, P>) {
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
    name: opt.name,
    state: opt.state,
    useStore,
    effects,
    reducers,
    getState,
    updateState
  };

  if (storeMap[opt.name]) {
    console.error(`store name${opt.name} duplicated!`);
  } else {
    storeMap[opt.name] = newStore;
  }

  return newStore;
}

function getStoreMap() {
  return storeMap;
}

export * from "./index";
export { init, createStore, getStoreMap, use };
export default { init, createStore, getStoreMap, use };
