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

  function useLoading(store, effectNames) {
    return loadingStore.useStore((s) => effectNames.map((n) => (s[store.name] && s[store.name][n]) || false));
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
    useLoading
  };
};
