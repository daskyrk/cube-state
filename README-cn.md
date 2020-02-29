
[English](./README.md) | 简体中文

# cube-state

> 一个基于 Hooks 的React状态管理库，灵感来自于 [stamen](https://github.com/forsigner/stamen)

[![npm version](https://img.shields.io/npm/v/cube-state.svg?logo=npm)](https://www.npmjs.com/package/cube-state)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/cube-state.svg?logo=javascript)](https://www.npmjs.com/package/cube-state)
![React](https://img.shields.io/npm/dependency-version/cube-state/peer/react?logo=react)

## 特性

- Perfect Typescript support.
- dva likely API
- small

## 线上试一把

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/count-cfwuy)

## 安装

```bash
npm install --save cube-state
# 或者
yarn add cube-state
```

## 快速开始

### 初始化配置

首先，做一些初始化的操作，比如扩展effect的第一个参数，或者对每个新建的store做一些操作。高级用法请见 [高级用法](#高级用法).

**init-cube.ts**

```tsx
import init from "cube-state";

const { createStore, getStoreMap, use } = init();

export { createStore, getStoreMap, use };
```

### 创建 store

**stores/counter.ts**

```tsx
import { createStore } from "init-cube";

export default createStore({
  name: "count",
  state: {
    count: 0
  },
  reducers: {
    add(state) {
      state.count += 1;
    }
  },
  effects: {}
});
```

## 使用 store

In order to retrieve the data of counter model, you need to import and call `useCounterModel` in your components.

```tsx
import counterStore from "stores/counter";

function App(props) {
  const value = counterStore.useStore(s => s.count);
  return (
    <div>
      <p>{value}</p>
      <button onClick={() => counterStore.reducers.add()}>Increment</button>
    </div>
  );
}
```

## 高级用法

### 传递初始配置参数

```tsx
import init from "cube-state";

const cube = init({
  extendEffect({ storeMap, update }) {
    // 扩展effect的第一个参数
  },
  onCreate(store) {
    // store创建后做一些操作
  }
});
```

### 使用数据而不观察变化

当store变化时，如果不想重渲染组件，使用 `getState` 而不是 `useStore`

> `getState` 不是 Hook，所以可以在任何地方使用

```tsx
import counterStore from "stores/counter";

export function doubleCount() {
  return 2 * counterStore.getState(s => s.count);
}
```

### 在类组件中使用

现在只能使用函数式组件包裹一下类组件并传递prop。后面会提供工具方法优化。

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
        <button onClick={() => add}>Increment</button>
      </div>
    );
  }
}

export default () => {
  const value = counterStore.useStore(s => s.count);
  return <Counter value={value} add={counterStore.reducers.add} />;
};
```

### 性能优化

使用`selector`来选择你想精确观察的数据。

```jsx
const [count, deepValue] = someStore.useStore(s => [s.count, s.a.deepValue]);
```
