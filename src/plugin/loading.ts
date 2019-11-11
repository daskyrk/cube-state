import cubeState from '../index';


const loadingStore = cubeState.createStore({
  name: 'loading',
  state: {
  },
  reducers: {
    setLoading(state, storeName: string, effectName, status: boolean) {
      state[storeName] = state[storeName] || {};
      state[storeName][effectName] = status;
    },
  },
});

function useSpace<T>(store: T & { name: string }): EffectKeys<ValueOf<T, 'effects'>> {
  const loadingMap = loadingStore.useStore(s => s);
  return loadingMap[store.name] || {};
}
type EffectKeys<T> = {
  [K in keyof T]: boolean
}

cubeState.use({
  beforeEffect({ storeName, effectName }) {
    loadingStore.reducers.setLoading(storeName, effectName, true);
  },
  afterEffect({ storeName, effectName }) {
    loadingStore.reducers.setLoading(storeName, effectName, false);
  },
});

export default {
  ...loadingStore,
  useSpace,
};
