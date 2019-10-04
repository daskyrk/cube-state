import React from 'react';
import countStore from "./stores/count";

function App() {
  const countState = countStore.useStore(s => s);

  // can't change state directly, should use reducer or effect
  // countStore.state.count = 2;
  // countState.count = 3;

  const addLater = (num: number) => {
    countStore.effects.addLater(1).then(res => {
      // return also has type
      console.log('return from effect:', res.returnType);
    })
  }

  return (
    <div className="App">
      <h3>count: {countState.count}</h3>
      <button onClick={() => countStore.reducers.addNum(1)}>+</button>
      <button onClick={() => countStore.reducers.addNum(-1)}>-</button>
      <button onClick={() => addLater(1)}>add 1 after 2 seconds</button>
      <br />
      <Child count={countState.count} />
    </div>
  );
}


interface IProps {
  count: typeof countStore.state.count // use store for typing
  addNum?: typeof countStore.reducers.addNum
  addLater?: typeof countStore.effects.addLater
}
class Child extends React.Component<IProps> {
  render() {
    const { count } = this.props
    return <h4>in child class Component: {count}</h4>
  }
}

export default App;
