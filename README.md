
English | [简体中文](./README-cn.md)

# cube-state

> A React state management library Based on Hooks which inspired by [stamen](https://github.com/forsigner/stamen)

[![npm version](https://img.shields.io/npm/v/cube-state.svg?logo=npm)](https://www.npmjs.com/package/cube-state)
![Bundle Size](https://badgen.net/bundlephobia/minzip/cube-state)
[![codecov](https://codecov.io/gh/daskyrk/cube-state/branch/codecov/graph/badge.svg)](https://codecov.io/gh/daskyrk/cube-state)
![React](https://img.shields.io/npm/dependency-version/cube-state/peer/react?logo=react)


<div align="left">
	<img src="./architecture.svg" alt="architecture">
</div>

## Features

- Perfect Typescript support
- API and structure similar to dva
- Tiny

## Try It Online

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/count-4ng8l)

## Install

```bash
npm install --save cube-state
# Or
yarn add cube-state
```

## Quick Start

### Init

first of all, do some init job, like extend effect or patch every store when created. you can see the [Advanced Usages](#Advanced-Usages).

**init-cube.ts**

```tsx
import init from "cube-state";

const { createStore, createFlatStore, storeMap, use } = init();

export { createStore, createFlatStore, storeMap, use };
```

### Create store

Pass a plain config to `createStore` and get a wrapped store object.
or use `createFlatStore` to flatten reducers and effects to store object.

**stores/counter.ts**

```tsx
import { createStore } from "init-cube";

export default createStore({
  name: "count",
  state: {
    count: 0
  },
  reducers: {
    add(state, num: number) {
      state.count += num;
    }
  },
  effects: {}
});
```

## Use store

Call `useStore` to watch selected data change and re-render.

```tsx
import counterStore from "stores/counter";

function App(props) {
  const value = counterStore.useStore(s => s.count);
  return (
    <div>
      <p>{value}</p>
      <button onClick={() => counterStore.reducers.add(1)}>Increment</button>
    </div>
  );
}
```

## Plugin

### loading

use loading plugin to toggle loading status

```tsx
import loadingStore from 'cube-state/dist/plugin/loading';
import userStore from 'stores/user';

function MsgList() {
  const { getMsgList } = userStore.effects;
  const [effectALoading] = loadingStore.useLoading(userStore, ['effectA']);

  React.useEffect(() => {
    getMsgList();
  }, []);

  return <Spin loading={effectALoading}><div>msg list</div><Spin>
}
```

### ~~devtools~~(deprecated)

use redux devtools to watch data change detail

```js
import devtools from 'cube-state/dist/plugin/dev-tool';

devtools({ storeMap, use });
```

## Advanced Usages

### Pass initial config

```tsx
import init from "cube-state";

const cube = init({
  extendEffect({ storeMap, update }) {
    // extend effect first argument
  },
  onCreate(store) {
    // do some job after store is created
  }
});
```

### Use data without subscribe change

use `getState` instead of `useStore` if you don't want to rerender component when store changed;

> `getState` is not Hook, you can use it anywhere.

```tsx
import counterStore from "stores/counter";

export function doubleCount() {
  return 2 * counterStore.getState(s => s.count);
}
```

### Singleton mode

Pass `singleton: true` to init options will enable singleton mode, which will return the last created store instance with the same name.
If the store file will be execute multiple times, eg. in module federation, it would be useful.

### Use in class components

Two ways:
1. wrap class component by functional component.
2. if you want to reuse connect logic, please use connectCube.

```tsx
import counterStore from "stores/counter";

interface IProps {
  value: typeof counterStore.stateType.value;
  add: typeof counterStore.reducers.add;
}
class Counter extends Component<IProps> {
  render() {
    const { value, add } = this.props;

    return (
      <div>
        <p>{value}</p>
        <button onClick={() => add()}>Increment</button>
      </div>
    );
  }
}

// first way
export default () => {
  const value = counterStore.useStore(s => s.count);
  return <Counter value={value} add={counterStore.reducers.add} />;
};

// second way
type IMapper<P, M> = {
  (props: Omit<P, keyof M>): M
};

interface IConnectComp<P> {
  (p: P): JSX.Element
}

export function connectCube<P, M>(Comp: IConnectComp<P> | React.ComponentType<P>, mapper: IMapper<P, M>) {
  return (props: Omit<P, keyof M>) => {
    const storeProps = mapper(props);
    const combinedProps = { ...props, ...storeProps } as any;
    return <Comp {...combinedProps} />;
  };
}

const Mapper = () => {
  const value = counterStore.useStore(s => s.count);
  const { add } = counterStore.reducers;
  return {
    value,
    add,
  };
};

connectCube(Counter, Mapper)
```

### Performance optimization

use selector to pick the data you want to subscribe precisely.

```jsx
const [count, deepValue] = someStore.useStore(s => [s.count, s.a.deepValue]);
```
