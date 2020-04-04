
export default ({ use, createStore }) => {
  const loadingStore = createStore({
    name: "loading",
    state: {},
    reducers: {
      setLoading(state, storeName, effectName, status) {
        state[storeName] = state[storeName] || {};
        state[storeName][effectName] = status;
      }
    }
  });

  function useSpace(store) {
    const loadingSpace = loadingStore.useStore(s => s[store.name]) || {};
    // add proxy to avoid return undefined in isLoading
    const loadingSpaceProxy = new Proxy(loadingSpace, {
      get: (target, propKey) => {
        return !!Reflect.get(target, propKey);
      }
    });
    return loadingSpaceProxy;
  }

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
