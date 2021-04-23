import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import {
  cleanup,
  fireEvent,
  render,
  waitFor
} from "@testing-library/react";
import init from "../src/index";

function sleep<T>(time: number, data?: T, flag = true): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const fn = flag ? resolve : reject;
      fn(data);
    }, time);
  });
}

const consoleError = console.error;
afterEach(() => {
  cleanup();
  console.error = consoleError;
});

describe("update and render", () => {
  const { createStore, createFlatStore } = init();

  const countStore = createStore({
    name: "count",
    state: {
      count: 0,
      extra: 0
    },
    reducers: {
      addCount(state) {
        state.count += 1;
      },
      setCount(state, num: number) {
        state.count = num;
      },
      setExtra(state, num: number) {
        state.extra = num;
      },
      batchUpdate(state, num: number) {
        state.count = num;
        state.extra = num;
      },
      reset() {
        return { count: 0, extra: 0 };
      }
    }
  });

  afterEach(() => {
    act(() => {
      countStore.reducers.reset();
    });
  });

  it("reducer update right in one component", async () => {
    let renderCount = 0;

    function Counter() {
      const count = countStore.useStore(s => s.count);
      renderCount++;
      return <div>count: {count}</div>;
    }

    const { getByText } = render(<Counter />);
    await waitFor(() => getByText("count: 0"));
    expect(renderCount).toBe(1);

    act(() => { countStore.reducers.addCount(); });
    await waitFor(() => getByText("count: 1"));
    expect(renderCount).toBe(2);

    act(() => { countStore.reducers.setCount(6); });
    await waitFor(() => getByText("count: 6"));
    expect(renderCount).toBe(3);
  });

  it("only re-renders if selected state has changed", async () => {
    let counterRenderCount = 0;
    let controlRenderCount = 0;

    function Counter() {
      const count = countStore.useStore(s => s.count);
      counterRenderCount++;
      return <div>count: {count}</div>;
    }

    function Control() {
      const add = countStore.reducers.addCount;
      controlRenderCount++;
      return <button onClick={add}>button</button>;
    }

    const { getByText } = render(
      <>
        <Counter />
        <Control />
      </>
    );

    fireEvent.click(getByText("button"));

    await waitFor(() => getByText("count: 1"));

    expect(counterRenderCount).toBe(2);
    expect(controlRenderCount).toBe(1);
  });

  it("re-renders if any state has changed when use full store", async () => {
    let counterRenderCount = 0;
    let controlRenderCount = 0;

    function Counter() {
      const state = countStore.useStore(s => s);
      counterRenderCount++;
      return (
        <div>
          count: {state.count}-extra: {state.extra}
        </div>
      );
    }

    function Control() {
      const { addCount, setExtra, batchUpdate } = countStore.reducers;
      controlRenderCount++;
      return (
        <div>
          <button data-testid="addCount" onClick={addCount}>
            button
          </button>
          <button data-testid="setExtra" onClick={() => setExtra(2)}>
            button
          </button>
          <button data-testid="batchUpdate" onClick={() => batchUpdate(3)}>
            button
          </button>
        </div>
      );
    }

    const { getByText, getByTestId } = render(
      <>
        <Counter />
        <Control />
      </>
    );

    fireEvent.click(getByTestId("addCount"));
    await waitFor(() => getByText("count: 1-extra: 0"));
    expect(counterRenderCount).toBe(2);
    expect(controlRenderCount).toBe(1);

    fireEvent.click(getByTestId("setExtra"));
    await waitFor(() => getByText("count: 1-extra: 2"));
    expect(counterRenderCount).toBe(3);
    expect(controlRenderCount).toBe(1);

    fireEvent.click(getByTestId("batchUpdate"));
    await waitFor(() => getByText("count: 3-extra: 3"));
    expect(counterRenderCount).toBe(4);
    expect(controlRenderCount).toBe(1);
  });

  it("re-renders right times in nested component", async () => {
    let childRenderCount = 0;
    let parentRenderCount = 0;

    function Child({ extra }) {
      const state = countStore.useStore(s => s);
      childRenderCount++;
      return (
        <div>
          count: {state.count}-extra: {extra}
        </div>
      );
    }

    function Parent() {
      const extra = countStore.useStore(s => s.extra);
      const { addCount, setExtra, batchUpdate } = countStore.reducers;
      parentRenderCount++;
      return (
        <div>
          <button data-testid="addCount" onClick={addCount}>
            button
          </button>
          <button data-testid="setExtra" onClick={() => setExtra(2)}>
            button
          </button>
          <button data-testid="batchUpdate" onClick={() => batchUpdate(3)}>
            button
          </button>
          <Child extra={extra} />
        </div>
      );
    }

    const { getByText, getByTestId } = render(<Parent />);

    fireEvent.click(getByTestId("addCount"));
    await waitFor(() => getByText("count: 1-extra: 0"));
    expect(childRenderCount).toBe(2);
    expect(parentRenderCount).toBe(1);

    fireEvent.click(getByTestId("setExtra"));
    await waitFor(() => getByText("count: 1-extra: 2"));
    expect(childRenderCount).toBe(3);
    expect(parentRenderCount).toBe(2);

    fireEvent.click(getByTestId("batchUpdate"));
    await waitFor(() => getByText("count: 3-extra: 3"));
    expect(childRenderCount).toBe(4);
    expect(parentRenderCount).toBe(3);
  });

  it('render right when call reducer in child component before parent mount', async () => {

    const renderValue = [];
    function Child() {
      React.useEffect(() => {
        countStore.reducers.addCount();
      }, []);
      return null;
    }

    function Parent() {
      const count = countStore.useStore(s => s.count);
      renderValue.push(count);
      return <div>count: {count}<Child /></div>;
    }

    expect(countStore.getState(s => s.count)).toBe(0);
    expect(renderValue).toEqual([])

    const { getByText } = render(<Parent />);

    expect(countStore.getState(s => s.count)).toBe(1);
    await waitFor(() => getByText("count: 1"));
    expect(renderValue).toEqual([0, 1])
  })

  it("can batch updates", async () => {
    function Counter() {
      const count = countStore.useStore(s => s.count);
      const { addCount } = countStore.reducers;
      React.useEffect(() => {
        ReactDOM.unstable_batchedUpdates(() => {
          addCount();
          addCount();
        });
      }, []);
      return <div>count: {count}</div>;
    }

    const { getByText } = render(<Counter />);

    await waitFor(() => getByText("count: 2"));
  });

  it("can update the selector", async () => {
    const batchStore = createStore({
      name: "batch",
      state: {
        one: "one",
        two: "two"
      }
    });
    function Component({ selector }) {
      return <div>{batchStore.useStore(selector)}</div>;
    }

    const { getByText, rerender } = render(<Component selector={s => s.one} />);
    await waitFor(() => getByText("one"));

    rerender(<Component selector={s => s.two} />);
    await waitFor(() => getByText("two"));
  });

  it("can update with async effect", async () => {
    const effectStore = createStore({
      name: "effect",
      state: {
        value: "one"
      },
      effects: {
        async setLater({ call, update }, newValue: string) {
          const result = await call(() => sleep(100, newValue));
          update({ value: result });
        },
        async setLaterWithoutCall({ call, update }, newValue: string) {
          const result = await sleep(100, newValue);
          update({ value: result });
        }
      }
    });

    function Component() {
      return (
        <div>
          <button onClick={() => effectStore.effects.setLater("two")}>
            update
          </button>
          <button onClick={() => effectStore.effects.setLater("three")}>
            update2
          </button>
          <div>{effectStore.useStore(s => s.value)}</div>
        </div>
      );
    }

    const { getByText } = render(<Component />);
    await waitFor(() => getByText("one"));

    fireEvent.click(getByText("update"));
    await waitFor(() => getByText("two"));

    fireEvent.click(getByText("update2"));
    await waitFor(() => getByText("three"));
  });

  it("not re-render when new state is deep equal to old state", async () => {
    const complexStore = createStore({
      name: "complex",
      state: {
        value: 0,
        obj: { a: { b: 2 } } as any,
        list: [{ a: 1 }, { b: 2 }] as any[]
      },
      reducers: {
        setValue(state, v: number) {
          state.value = v;
        },
        setObj(state, pay: object) {
          state.obj = pay;
        },
        setList(state, list: any[]) {
          state.list = list;
        }
      }
    });

    let renderCount = 0;
    function Comp() {
      renderCount++;
      const [v, obj, list] = complexStore.useStore(s => [
        s.value,
        s.obj,
        s.list
      ]);
      return (
        <div>
          <div>value: {v}</div>
          <div>obj: {JSON.stringify(obj)}</div>
          <div>list: {JSON.stringify(list)}</div>
        </div>
      );
    }

    const { getByText } = render(<Comp />);
    await waitFor(() => getByText("value: 0"));
    expect(renderCount).toBe(1);

    act(() => { complexStore.reducers.setValue(1); });
    await waitFor(() => getByText("value: 1"));
    expect(renderCount).toBe(2);

    act(() => { complexStore.reducers.setValue(1); });
    await waitFor(() => getByText("value: 1"));
    expect(renderCount).toBe(2);

    act(() => { complexStore.reducers.setObj({ a: { b: 2 } }); });
    await waitFor(() => getByText(`obj: {"a":{"b":2}}`));
    expect(renderCount).toBe(2);

    act(() => { complexStore.reducers.setObj({ a: { c: 3 } }); });
    await waitFor(() => getByText(`obj: {"a":{"c":3}}`));
    expect(renderCount).toBe(3);

    act(() => { complexStore.reducers.setList([{ a: 1 }, { b: 2 }]); });
    await waitFor(() => getByText(`list: [{"a":1},{"b":2}]`));
    expect(renderCount).toBe(3);

    act(() => { complexStore.reducers.setList([{ c: 3 }]); });
    await waitFor(() => getByText(`list: [{"c":3}]`));
    expect(renderCount).toBe(4);
  });

  it("not re-render when use getState", async () => {
    let notWatchRenderCount = 0;
    let watchRenderCount = 0;

    function NotWatch() {
      const count = countStore.getState(s => s.count);
      notWatchRenderCount++;
      return <div>notWatch: {count}</div>;
    }

    function Watch() {
      const count = countStore.useStore(s => s.count);
      watchRenderCount++;
      return <div>watch: {count}</div>;
    }

    function Container() {
      return (
        <div>
          <button onClick={() => countStore.reducers.addCount()}>change</button>
          <NotWatch />
          <Watch />
        </div>
      );
    }

    const { getByText, rerender } = render(<Container />);
    await waitFor(() => getByText("notWatch: 0"));
    await waitFor(() => getByText("watch: 0"));
    expect(notWatchRenderCount).toBe(1);
    expect(watchRenderCount).toBe(1);

    fireEvent.click(getByText("change"));

    await waitFor(() => getByText("notWatch: 0"));
    await waitFor(() => getByText("watch: 1"));
    expect(notWatchRenderCount).toBe(1);
    expect(watchRenderCount).toBe(2);

    rerender(<Container />);
    await waitFor(() => getByText("notWatch: 1"));
    await waitFor(() => getByText("watch: 1"));
    expect(notWatchRenderCount).toBe(2);
    expect(watchRenderCount).toBe(3);
  });

  // fast-deep-equal v3 not support compare object property create by Object.create(null)
  // it("support Object.create(null) with fast-deep-equal", async () => {
  //   function genNoProto() {
  //     this.value = Object.create(null);
  //   }

  //   const compareStore = createStore({
  //     name: "compare",
  //     state: new genNoProto(),
  //     reducers: {
  //       setValue(state, v: object) {
  //         return v;
  //       }
  //     }
  //   });

  //   function Comp() {
  //     const v = compareStore.useStore(s => s.value);
  //     return <div>value: {JSON.stringify(v)}</div>;
  //   }

  //   const { getByText } = render(<Comp />);
  //   await waitFor(() => getByText("value: {}"));

  //   act(() => { compareStore.reducers.setValue(new genNoProto()); });
  //   await waitFor(() => getByText("value: {}"));
  // });

  it("re-renders with extend store", async () => {
    let counterRenderCount = 0;
    let extendRenderCount = 0;
    let controlRenderCount = 0;
    const extendCountStore = countStore.extend({
      state: {
        extendCount: 0
      },
      reducers: {
        addExtend(state, num: number) {
          state.extendCount += num;
        },
        addOriginal(state, num: number) {
          state.count += num;
        }
      }
    });

    function Counter() {
      const count = countStore.useStore(s => s.count);
      const baseCountCopy = extendCountStore.useStore(s => s.count);
      counterRenderCount++;
      return (
        <div>
          baseCount: {count}, baseCountCopy: {baseCountCopy}
        </div>
      );
    }

    function ExtendCounter() {
      const extendCount = extendCountStore.useStore(s => s.extendCount);
      extendRenderCount++;
      return <div>extendCount: {extendCount}</div>;
    }

    function Control() {
      const baseAdd = countStore.reducers.addCount;
      const extendAdd = extendCountStore.reducers.addCount;
      const addOriginal = extendCountStore.reducers.addOriginal;
      const addExtend = extendCountStore.reducers.addExtend;
      controlRenderCount++;
      return (
        <div>
          <button onClick={baseAdd}>baseAdd</button>
          <button onClick={extendAdd}>extendAdd</button>
          <button onClick={() => addOriginal(1)}>addOriginal</button>
          <button onClick={() => addExtend(1)}>addExtend</button>
        </div>
      );
    }

    const { getByText } = render(
      <>
        <Counter />
        <ExtendCounter />
        <Control />
      </>
    );

    expect(counterRenderCount).toBe(1);
    expect(extendRenderCount).toBe(1);
    expect(controlRenderCount).toBe(1);

    fireEvent.click(getByText("baseAdd"));
    await waitFor(() => getByText("baseCount: 1, baseCountCopy: 0"));
    expect(counterRenderCount).toBe(2);
    expect(extendRenderCount).toBe(1);
    expect(controlRenderCount).toBe(1);

    fireEvent.click(getByText("extendAdd"));
    await waitFor(() => getByText("baseCount: 1, baseCountCopy: 1"));
    expect(counterRenderCount).toBe(3);
    expect(extendRenderCount).toBe(1);
    expect(controlRenderCount).toBe(1);

    fireEvent.click(getByText("addOriginal"));
    await waitFor(() => getByText("baseCount: 1, baseCountCopy: 2"));
    expect(counterRenderCount).toBe(4);
    expect(extendRenderCount).toBe(1);
    expect(controlRenderCount).toBe(1);

    fireEvent.click(getByText("addExtend"));
    await waitFor(() => getByText("extendCount: 1"));
    expect(counterRenderCount).toBe(4);
    expect(extendRenderCount).toBe(2);
    expect(controlRenderCount).toBe(1);
  });

  it("create new by extend store", async () => {
    const baseStore = createStore({
      name: "base",
      state: {
        count: 0
      },
      reducers: {
        addCount(state) {
          state.count += 1;
        }
      }
    });

    const baseExtendStore = baseStore.extend({
      name: "baseExtend",
      state: {
        count: 0
      },
      reducers: {
        addCount(state) {
          state.count += 1;
        }
      }
    });

    const baseExtendStore2 = baseStore.extend({
      name: "baseExtend2",
      state: {
        count: 0,
        other: 0
      },
      reducers: {
        addCount(state) {
          state.count += 1;
        },
        addOther(state) {
          state.other += 1;
        }
      }
    });

    function Control() {
      const count = baseStore.useStore(s => s.count);
      const extendCount = baseExtendStore.useStore(s => s.count);
      const [extendCount2, other] = baseExtendStore2.useStore(s => [
        s.count,
        s.other
      ]);

      const baseAdd = baseStore.reducers.addCount;
      const extendAdd = baseExtendStore.reducers.addCount;
      const extendAdd2 = baseExtendStore2.reducers.addCount;
      const addOther = baseExtendStore2.reducers.addOther;
      return (
        <div>
          <button onClick={baseAdd}>baseAdd</button>
          <button onClick={extendAdd}>extendAdd</button>
          <button onClick={extendAdd2}>extendAdd2</button>
          <button onClick={addOther}>addOther</button>
          <div>
            base: {count}, extend: {extendCount}, extend2: {extendCount2},
            other: {other}
          </div>
        </div>
      );
    }

    const { getByText } = render(
      <>
        <Control />
      </>
    );

    await waitFor(() =>
      getByText("base: 0, extend: 0, extend2: 0, other: 0")
    );
    expect(baseStore.getState(s => s)).not.toBe(
      baseExtendStore.getState(s => s)
    );
    expect(baseStore.getState(s => s)).toEqual(
      baseExtendStore.getState(s => s)
    );

    fireEvent.click(getByText("baseAdd"));
    await waitFor(() =>
      getByText("base: 1, extend: 0, extend2: 0, other: 0")
    );

    fireEvent.click(getByText("extendAdd"));
    await waitFor(() =>
      getByText("base: 1, extend: 1, extend2: 0, other: 0")
    );

    fireEvent.click(getByText("extendAdd2"));
    await waitFor(() =>
      getByText("base: 1, extend: 1, extend2: 1, other: 0")
    );

    fireEvent.click(getByText("addOther"));
    await waitFor(() =>
      getByText("base: 1, extend: 1, extend2: 1, other: 1")
    );
  });

  it("create new by createFlatStore", async () => {
    const flatStore = createFlatStore({
      name: "flat",
      state: {
        count: 1,
      },
      effects: {
        async setLater({ call, update }, newNum: number) {
          const result = await call(() => sleep(100, newNum));
          update({ count: result });
        },
      },
      reducers: {
        setCount(state, num: number) {
          state.count = num;
        },
      }
    });

    expect(flatStore.getState(s => s.count)).toBe(1);
    expect(typeof flatStore.setLater).toBe("function");
    expect(typeof flatStore.setCount).toBe("function");
    expect(typeof flatStore._effects).toBe("object");
    expect(typeof flatStore._reducers).toBe("object");
  });

  it("execute pure reducer with circular object", async () => {
    const obj = {} as any;
    obj.obj = obj;

    const circularStore = createStore({
      name: "circular",
      state: {
        obj,
      },
      reducers: {
        $_setState(state, extra: string) {
          obj.extra = extra;
          return {
            obj,
          }
        },
        setState(state, extra: string) {
          obj.extra = extra;
          return {
            obj,
          }
        },
      }
    });

    const objCopy = circularStore.getState(s => s.obj);
    expect(objCopy.extra).toBeUndefined();
    expect(objCopy).toBe(obj);

    circularStore.reducers.$_setState('extra');
    const objCopy2 = circularStore.getState(s => s.obj);
    expect(objCopy2.extra).toBe('extra');
    expect(objCopy2).toBe(obj);

    try {
      circularStore.reducers.setState('extra2');
    } catch (error) {
      expect(error.message).toBe('[Immer] Immer forbids circular references')
    }

  });

  // it('can throw an error in reducer and effect', async () => {
  //   console.error = jest.fn()

  //   const errorStore = createStore({
  //     name: 'error',
  //     state: {
  //       msg: undefined,
  //     },
  //     reducers: {
  //       setMsg(state, newMsg: string) {
  //         // state.msg = newMsg.toLowerCase();
  //         throw new Error('oops');
  //       }
  //     },
  //     effects: {
  //       async setLater({ call }) {
  //         // const result = await call(() => sleep(1000, 'haha'));
  //         throw new Error('oops');
  //       }
  //     }
  //   })

  //   class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  //     constructor(props) {
  //       super(props)
  //       this.state = { hasError: false }
  //     }
  //     static getDerivedStateFromError() {
  //       return { hasError: true }
  //     }
  //     render() {
  //       return this.state.hasError ? <div>oops</div> : this.props.children
  //     }
  //   }

  //   function Component() {
  //     errorStore.useStore(s => s.msg)
  //     return (
  //       <div>
  //         <button onClick={() => errorStore.reducers.setMsg('good')}>trigger</button>
  //         <div>no error</div>
  //       </div>
  //     )
  //   }

  //   const { getByText } = render(
  //     <ErrorBoundary>
  //       <Component />
  //     </ErrorBoundary>
  //   )
  //   await waitFor(() => getByText('no error'))

  //   fireEvent.click(getByText('trigger'));
  //   // act(() => {
  //   //   errorStore.reducers.setMsg('try')
  //   // })
  //   await waitFor(() => getByText('oops'))
  // })
});
