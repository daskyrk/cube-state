import React from "react";
import { act } from "react-dom/test-utils";
import {
  cleanup,
  fireEvent,
  render,
  waitForElement
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
