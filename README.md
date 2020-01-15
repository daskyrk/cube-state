
## Intro

A React state management library Based on Hooks
>  inspired by [stamen](https://github.com/forsigner/stamen)


## Feature

* fully Typescript support
* dva likely API
* small


## Example
CodeSandbox: [counter](https://codesandbox.io/s/count-4ng8l)

Counter:
```javascript
import React from 'react';
import cube from "cube-state";

const { createStore } = cube(initOptions);

const countStore = createStore({
  name: 'count',
  state: {
    count: 0,
  },
  reducers: {
    addNum(state, num: number) {
      state.count += num;
    }
  },
  effects: {}
})


function App() {
  const countState = countStore.useStore();

  return (
    <div>
      <h3>count: {countState.count}</h3>
      <button onClick={() => countStore.reducers.addNum(1)}>+</button>
      <button onClick={() => countStore.reducers.addNum(-1)}>-</button>
    </div>
  );
}
```


## Question
1. How to trigger state update externally, such as websocket?

Create a store to save the state, update the state in onmessage function, and use store normally in the component.
you can see example [counter](https://codesandbox.io/s/count-cfwuy) for detail.

