import cube from "cube-state";

export const { createStore, use, getStoreMap } = cube({
  onCreate(store) {
    console.log(`store ${store.name} created`);
  }
});
