import React from "react";
import { act } from "react-dom/test-utils";
import {
  cleanup,
  fireEvent,
  render,
  waitFor
} from "@testing-library/react";
import init from "../src/index";

const consoleError = console.error;
afterEach(() => {
  cleanup();
  console.error = consoleError;
});

describe("init and create", () => {
  const cube = init();

  const stateStore = cube.createStore({
    name: "state",
    state: {
      a: 1,
      b: "string",
      c: [0, { k: "second" }],
      d: {
        obj: true
      }
    },
    extra: {
      test: true
    }
  });

  it("shape of return by init and createStore", () => {
    expect(typeof cube.createStore).toBe("function");
    expect(typeof cube.createFlatStore).toBe("function");
    expect(typeof cube.storeMap).toBe("object");
    expect(typeof cube.use).toBe("function");

    expect(stateStore).toMatchInlineSnapshot(`
      Object {
        "_opt": Object {
          "extra": Object {
            "test": true,
          },
          "name": "state",
          "state": Object {
            "a": 1,
            "b": "string",
            "c": Array [
              0,
              Object {
                "k": "second",
              },
            ],
            "d": Object {
              "obj": true,
            },
          },
        },
        "effects": Object {},
        "extend": [Function],
        "extra": Object {
          "test": true,
        },
        "getState": [Function],
        "name": "state",
        "reducers": Object {},
        "useStore": [Function],
      }
    `);
  });

  it("return same state with selector or not", () => {
    function Counter() {
      const fullState = stateStore.useStore(s => s);
      const sameFullState = stateStore.useStore(s => s);
      expect(fullState).toEqual(sameFullState);
      expect(fullState).toEqual({
        a: 1,
        b: "string",
        c: [0, { k: "second" }],
        d: {
          obj: true
        }
      });

      return null;
    }

    render(<Counter />);
  });

  it("create store without effects", () => {
    const reducerStore = cube.createStore({
      name: "reducer",
      state: {
        a: 1
      },
      reducers: {
        addA(state) {
          state.a += 1;
        }
      }
    });
    expect(typeof reducerStore.reducers.addA).toBe("function");
    expect(reducerStore.effects).toEqual({});
  });

  it("create store without reducers", () => {
    const effectStore = cube.createStore({
      name: "effect",
      state: {
        a: 1
      },
      effects: {
        async updateLater({ update }) {
          const newData = await Promise.resolve(2);
          update({ a: newData });
        }
      }
    });

    expect(typeof effectStore.effects.updateLater).toBe("function");
    expect(effectStore.reducers).toEqual({});
  });

  it("throw error when create store with duplicate name", () => {
    try {
      cube.createStore({
        name: "state",
        state: {
          a: 1
        },
        effects: {
          async updateLater({ update }) {
            const newData = await Promise.resolve(2);
            update({ a: newData });
          }
        }
      });
    } catch (e) {
      expect(e.message).toEqual("[cube-state] Store name：state duplicated!");
    }
  });

  it("throw error when extend store with duplicate name", () => {
    try {
      stateStore.extend({
        name: "state",
        state: {
          a: 1
        }
      });
    } catch (e) {
      expect(e.message).toEqual("[cube-state] Store name：state duplicated!");
    }
  });

  it("can extend store without init state", () => {
    const inheritedStore = stateStore.extend({
      name: "inherited",
    });

    expect(inheritedStore.getState(s => s)).toMatchObject({
      a: 1,
      b: "string",
      c: [0, { k: "second" }],
      d: {
        obj: true
      }
    });
  });

  // it("throw error when change state directly", () => {
  //   function Counter() {
  //     const fullState = stateStore.useStore(s => s);
  //     try {
  //       fullState.b = "changed";
  //     } catch (e) {
  //       expect(e.message).toEqual(
  //         "Cannot assign to read only property 'b' of object '#<Object>'"
  //       );
  //     }
  //     // TODO: should throw error
  //     fullState.d.obj = false;
  //     try {
  //       delete fullState.d.obj;
  //     } catch (e) {
  //       expect(e.message).toEqual("store name：effect duplicated!");
  //     }

  //     return null;
  //   }

  //   render(<Counter />);
  // });
});

describe("init and create in singleton mode", () => {
  const cube = init({ singleton: true });

  const stateStore = cube.createStore({
    name: "state",
    state: {
      a: 1,
    },
    extra: {
      test: true
    }
  });

  it("return exist store when create store with duplicate name", () => {
    const newStateStore = cube.createStore({
      name: "state",
      state: {
        b: 1
      },
      effects: {
        async updateLater({ update }) {
          const newData = await Promise.resolve(2);
          update({ b: newData });
        }
      }
    });

    expect(newStateStore).toBe(stateStore);
  });

  it("return exist store when extend store with duplicate name", () => {
    const newStateStore = stateStore.extend({
      name: "state",
      state: {
        b: 1
      }
    });

    expect(newStateStore).toBe(stateStore);
    expect(newStateStore.getState(s => s)).toEqual({ a: 1 });
    expect(stateStore.getState(s => s)).toEqual({ a: 1 });
  });

  it("return new store when extend store with new name", () => {
    const newStateStore = stateStore.extend({
      name: "state1",
      state: {
        b: 1
      }
    });

    expect(newStateStore).not.toBe(stateStore);
    expect(newStateStore.getState(s => s)).toEqual({ a: 1, b: 1 });
    expect(stateStore.getState(s => s)).toEqual({ a: 1 });
  });

});

describe("init with onCreate option", () => {
  const storeList = [];
  const cube = init({
    onCreate(newStore) {
      storeList.push(newStore);
    }
  });

  it("can create store", () => {
    const stateStore = cube.createStore({
      name: "state",
      state: {
        a: 1,
      },
      extra: {
        test: true
      }
    });

    expect(storeList[0]).toBe(stateStore);
    expect(storeList.length).toBe(1);
  });

});

describe("get & set state out of component", () => {
  const { createStore, storeMap } = init();

  createStore({
    name: "first",
    state: {
      count: 0
    },
    reducers: {
      addCount(state) {
        state.count += 1;
      }
    }
  });

  createStore({
    name: "second",
    state: {
      count: 0
    },
    reducers: {
      addCount(state) {
        state.count += 1;
      }
    }
  });

  it("can get the store", () => {
    expect(Object.keys(storeMap)).toEqual(["first", "second"]);
  });

  it("can set the store", () => {
    const { first, second } = storeMap;
    first.reducers.addCount();
    expect(first.getState(s => s.count)).toBe(1);
    expect(second.getState(s => s.count)).toBe(0);
    second.reducers.addCount();
    expect(first.getState(s => s.count)).toBe(1);
    expect(second.getState(s => s.count)).toBe(1);
  });
});
