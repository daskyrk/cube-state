import { CubeAPI } from "..";

// 获得对象上某个属性的类型，比如 ValueOf<{ a: object }, 'a'> 得到object
type ValueOf<T extends Record<string, any>, K> = K extends keyof T
  ? T[K]
  : never;

export default ({ use, createStore }: Pick<CubeAPI, "use" | "createStore">) => {
  const loadingStore = createStore({
    name: "loading",
    state: {} as Record<string, any>,
    reducers: {
      setLoading(state, storeName: string, effectName, status: boolean) {
        state[storeName] = state[storeName] || {};
        state[storeName][effectName] = status;
      }
    }
  });

  function useSpace<T>(
    store: T & { name: string }
  ): EffectKeys<ValueOf<T, "effects" | "_effects">> {
    const loadingSpace = loadingStore.useStore(s => s[store.name]) || {};
    // add proxy to avoid return undefined in isLoading
    const loadingSpaceProxy = new Proxy(loadingSpace, {
      get: (target, propKey) => {
        return !!Reflect.get(target, propKey);
      }
    });
    return loadingSpaceProxy;
  }
  type EffectKeys<T> = {
    [K in keyof T]: boolean;
  };

  use({
    beforeEffect({ storeName, effectName }) {
      loadingStore.reducers.setLoading(storeName, effectName, true);
    },
    afterEffect({ storeName, effectName }) {
      loadingStore.reducers.setLoading(storeName, effectName, false);
    }
  });

  return {
    ...loadingStore,
    useSpace
  };
};
