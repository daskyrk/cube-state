export default ({ use, storeMap }) => {
  let extension;
  try {
    extension =
      (window as any).__REDUX_DEVTOOLS_EXTENSION__ ||
      (window as any).top.__REDUX_DEVTOOLS_EXTENSION__;
  } catch {}

  if (!extension) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Please install/enable Redux devtools extension");
    }
    return;
  }
  const devtools = extension.connect();
  // devtools.prefix = `${cube} > `;
  // devtools.subscribe((message: any) => {
  //   if (message.type === 'DISPATCH' && message.state) {
  //     const ignoreState =
  //       message.payload.type === 'JUMP_TO_ACTION' ||
  //       message.payload.type === 'JUMP_TO_STATE'
  //   }
  // })
  use({
    beforeReducer({ storeName, reducerName, payload }) {
      devtools.send(`[cube] ${storeName} > ${reducerName}`, payload);
    }
  });
  devtools.init(storeMap);
};
