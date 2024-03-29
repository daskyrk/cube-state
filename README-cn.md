
[English](./README.md) | 简体中文

# cube-state

> 一个基于 Hooks 的 React 状态管理库，灵感来自于 [stamen](https://github.com/forsigner/stamen)

[![npm version](https://img.shields.io/npm/v/cube-state.svg?logo=npm)](https://www.npmjs.com/package/cube-state)
![React](https://img.shields.io/npm/dependency-version/cube-state/peer/react?logo=react)
![Types Include](https://badgen.net/npm/types/tslib)
![Bundle Size](https://badgen.net/badgesize/gzip/daskyrk/cube-state/master/src/index.ts)
[![codecov](https://codecov.io/gh/daskyrk/cube-state/branch/codecov/graph/badge.svg)](https://codecov.io/gh/daskyrk/cube-state)


<div align="left">
	<img src="./architecture.svg" alt="architecture">
</div>

## 特性

- 完美支持 Typescript
- 类似 dva 的 API 和组织结构
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

首先，做一些初始化的操作，比如扩展 effect 的第一个参数，或者对每个新建的 store 做一些操作。高级用法请见 [高级用法](#高级用法).

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
    add(state, num: number) {
      state.count += number;
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
      <button onClick={() => counterStore.reducers.add(1)}>Increment</button>
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
  const [effectALoading] = loadingStore.useLoading(userStore, ['effectA']);

  React.useEffect(() => {
    getMsgList();
  }, []);

  return <Spin loading={effectALoading}><div>msg list</div><Spin>
}
```

## ~~devtools~~(deprecated)

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

当 store 变化时，如果不想重渲染组件，使用 `getState` 而不是 `useStore`

> `getState` 不是 Hook，所以可以在任何地方使用

```tsx
import counterStore from "stores/counter";

export function doubleCount() {
  return 2 * counterStore.getState(s => s.count);
}
```

### 单例模式

将 `singleton：true` 传递给 init 初始化选项将启用单例模式，该模式将返回上次创建的相同名称的 store 实例。
如果 store 文件会被多次执行，例如在模块联邦中，这将很有用。

### 在类组件中使用
两种方式：
1. 使用函数式组件包裹一下类组件并传递prop。
2. 如需复用 connect 逻辑，可使用 connectCube 方法，传入纯组件以及提供所需 props 的 Mapper 组件

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
        <button onClick={() => add(1)}>Increment</button>
      </div>
    );
  }
}

// 方式一
export default () => {
  const value = counterStore.useStore(s => s.count);
  return <Counter value={value} add={counterStore.reducers.add} />;
};

// 方式二
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

### 性能优化

使用`selector`来选择你想精确观察的数据。

```jsx
const [count, deepValue] = someStore.useStore(s => [s.count, s.a.deepValue]);
```
