export default ({ use, storeMap }) => {
  let extension;
  try {
    extension =
      window.__REDUX_DEVTOOLS_EXTENSION__ ||
      window.top.__REDUX_DEVTOOLS_EXTENSION__;
  } catch {}

  if (!extension) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Please install/enable Redux devtools extension");
    }
    return;
  }
  const newStore = {};
  const devtools = extension.connect();
  use({
    afterReducer({ storeName, reducerName, payload }) {
      Object.keys(storeMap).forEach(k => {
        newStore[k] = storeMap[k].getState();
      });
      devtools.send(
        { type: `[${storeName}] > ${reducerName}`, payload },
        newStore
      );
    }
  });
  devtools.init(storeMap);
};
