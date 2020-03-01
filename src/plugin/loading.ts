import cube from "../index";

// 获得对象上某个属性的类型，比如 ValueOf<{ a: object }, 'a'> 得到object
type ValueOf<T extends Record<string, any>, K> = K extends keyof T
  ? T[K]
  : never;

const { createStore, use } = cube();
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
): EffectKeys<ValueOf<T, "effects">> {
  const loadingMap = loadingStore.useStore(s => s);
  return loadingMap[store.name] || {};
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

export default {
  ...loadingStore,
  useSpace
};
