import { createStore, use as cubeUse } from '../cube';
import { sleep } from '../util';


// 获得对象上某个属性的类型，比如 ValueOf<{ a: object }, 'a'> 得到object
type ValueOf<T extends Record<string, any>, K> = K extends keyof T ? T[K] : never;
// 把对象的属性类型拉平，比如 FlattenValues<{ a: string, b: number }>, 得到 string | number
type FlattenValues<T extends Record<string, any>> = T extends T ? T[keyof T] : never;

interface loadingState {
  [k: string]: any
}

const loadingStore = createStore({
  name: 'loading',
  state: {
  } as loadingState,
  reducers: {
    setLoading(state, storeName: string, effectName, status: boolean) {
      state[storeName] = state[storeName] || {};
      state[storeName][effectName] = status;
    },
  },
});

function use<T>(store: T & { name: string }): EffectKeys<ValueOf<T, 'effects'>> {
  const loadingMap = loadingStore.useStore(s => s);
  return loadingMap[store.name] || {};
}
type EffectKeys<T> = {
  [K in keyof T]: boolean
}

cubeUse({
  beforeEffect({ storeName, effectName }) {
    loadingStore.reducers.setLoading(storeName, effectName, true);
    console.log('before effect: loading', effectName);
    return sleep(2000);
  },
  afterEffect({ storeName, effectName }) {
    console.log('after effect: loading', effectName);
    loadingStore.reducers.setLoading(storeName, effectName, false);
    return 666;
  },
});

export default {
  ...loadingStore,
  use,
};
