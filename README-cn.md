
[English](./README.md) | 简体中文

# cube-state
hello
> 一个基于 Hooks 的React状态管理库，灵感来自于 [stamen](https://github.com/forsigner/stamen)

[![npm version](https://img.shields.io/npm/v/cube-state.svg?logo=npm)](https://www.npmjs.com/package/cube-state)
![Bundle Size](https://badgen.net/bundlephobia/minzip/cube-state)
![React](https://img.shields.io/npm/dependency-version/cube-state/peer/react?logo=react)

## 特性

- 完美支持Typescript
- 类似dva的API和组织结构
- 很小

## 线上试一把

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/count-4ng8l)

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

const { createStore, createFlatStore, storeMap, use } = init();

export { createStore, createFlatStore, storeMap, use };
```

### 创建 store

### 创建 store

传一个配置对象给 `createStore` 方法，获得一个包装后的 store 对象。
或者使用 `createFlatStore` 获得解构了 reducers 和 effects 的 store 对象。

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

调用 `useStore` 来观察选择的数据变化并重渲染。

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

## 插件

### loading

使用 loading 插件切换加载状态

```tsx
import loadingStore from 'cube-state/dist/plugin/loading';
import userStore from 'stores/user';

function MsgList() {
  const { getMsgList } = userStore.effects;
  const loading = loadingStore.useSpace(userStore);

  React.useEffect(() => {
    getMsgList();
  }, []);

  return <Spin loading={loading.getMsgList}><div>msg list</div><Spin>
}
```

## devtools

使用 redux 扩展工具观察数据变化详情

```js
import devtools from 'cube-state/dist/plugin/dev-tool';

devtools({ storeMap, use });
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
