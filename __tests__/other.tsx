/**
 * @jest-environment jsdom
 */

import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import init from "../src";
import initLoading from "../src/plugin/loading";

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

describe("plugin", () => {
  const { createStore, storeMap, use } = init();
  const loadingStore = initLoading({ use, createStore });

  it("loadingPlugin can auto toggle loading", async () => {
    const countStore = createStore({
      name: "count",
      state: {
        value: 0
      },
      effects: {
        async setLater({ call, update }, newValue: number) {
          const result = await call(() => sleep(100, newValue));
          update({ value: result });
        },
        async setLaterWithoutPayload({ call, update }) {
          const result = await call(() => sleep(100, 6));
          update({ value: result });
        },
      }
    });

    const snapshot = [];
    function Counter() {
      const count = countStore.useStore(s => s.value);
      const [setLaterLoading, setLaterWithoutPayload] = loadingStore.useLoading(countStore, ['setLater', 'setLaterWithoutPayload']);
      snapshot.push([count, setLaterLoading, setLaterWithoutPayload]);
      return <div>count: {count}</div>;
    }

    const { getByText } = render(<Counter />);
    await waitFor(() => getByText("count: 0"));
    expect(snapshot).toEqual([
      [0, false, false]
    ]);

    await act(() => countStore.effects.setLater(1));
    expect(snapshot).toEqual([
      [0, false, false],
      [0, true, false],
      [1, true, false],
      [1, false, false]
    ]);
    await waitFor(() => getByText("count: 1"));

    await act(() => countStore.effects.setLaterWithoutPayload());
    expect(snapshot).toEqual([
      [0, false, false],
      [0, true, false],
      [1, true, false],
      [1, false, false],
      [1, false, true],
      [6, false, true],
      [6, false, false]
    ]);
    await waitFor(() => getByText("count: 6"));
  });

  it("loadingPlugin can auto toggle loading when effect throw error", async () => {
    const countStore = createStore({
      name: "error-count",
      state: {
        value: 0
      },
      effects: {
        async setLaterWithError({ call, update }, newValue: number) {
          await call(() => sleep(100, newValue));
          throw Error('oops');
        },
      }
    });

    const snapshot = [];
    function Counter() {
      const count = countStore.useStore(s => s.value);
      const [setLaterLoading] = loadingStore.useLoading(countStore, ['setLaterWithError']);
      snapshot.push([count, setLaterLoading]);
      return <div>count: {count}</div>;
    }

    const { getByText } = render(<Counter />);
    await waitFor(() => getByText("count: 0"));
    expect(snapshot).toEqual([[0, false]]);

    try {
      await act(() => countStore.effects.setLaterWithError(1));
    } catch (error) {
      // do nothing
    }
    expect(snapshot).toEqual([[0, false], [0, true], [0, false]]);
    await waitFor(() => getByText("count: 0"));
  });

  it("run afterEffect after promise which returned by beforeEffect finish", async () => {
    const { createStore, storeMap, use } = init();

    const snapshot = [];
    const effectStore = createStore({
      name: "effect",
      state: {
        value: 0
      },
      effects: {
        async setLater({ call, update }, newValue: number) {
          const result = await call(() => sleep(100, newValue));
          snapshot.push('effect')
          update({ value: result });
        }
      }
    });

    use({
      beforeEffect({ storeName, effectName }) {
        return new Promise(resolve => {
          setTimeout(() => {
            snapshot.push('beforeEffect')
            resolve('');
          }, 100);
        });
      },
      afterEffect({ storeName, effectName }) {
        return new Promise(resolve => {
          setTimeout(() => {
            snapshot.push('afterEffect')
            resolve('');
          }, 100);
        });
      },
    });

    expect(snapshot).toEqual([]);
    await act(() => effectStore.effects.setLater(1));
    expect(snapshot).toEqual(['beforeEffect', 'effect', 'afterEffect']);
  });

  it("run afterReducer after all beforeReducer", async () => {
    const { createStore, storeMap, use } = init();

    const snapshot = [];
    const addStore = createStore({
      name: "addStore",
      state: {
        value: 0
      },
      reducers: {
        add(state, num: number) {
          state.value += num;
        }
      }
    });

    use({
      beforeReducer({ storeName, reducerName, payload }) {
        snapshot.push(`1-before-${storeName}-${reducerName}-${payload}`);
      },
      afterReducer({ storeName, reducerName, payload }) {
        snapshot.push(`1-after-${storeName}-${reducerName}-${payload}`);
      },
    });

    use({
      beforeReducer({ storeName, reducerName, payload }) {
        snapshot.push(`2-before-${storeName}-${reducerName}-${payload}`);
      },
      afterReducer({ storeName, reducerName, payload }) {
        snapshot.push(`2-after-${storeName}-${reducerName}-${payload}`);
      },
    });

    expect(snapshot).toEqual([]);
    expect(addStore.getState(s => s.value)).toBe(0);
    addStore.reducers.add(3);

    expect(snapshot).toEqual([
      '1-before-addStore-add-3',
      '2-before-addStore-add-3',
      '1-after-addStore-add-3',
      '2-after-addStore-add-3',
    ]);
    expect(addStore.getState(s => s.value)).toBe(3);
  });

  it("pass partial afterReducer and beforeReducer", async () => {
    const { createStore, storeMap, use } = init();

    const snapshot = [];
    const addStore = createStore({
      name: "addStore",
      state: {
        value: 0
      },
      reducers: {
        add(state, num: number) {
          state.value += num;
        }
      }
    });

    use({
      beforeReducer({ storeName, reducerName, payload }) {
        snapshot.push(`1-before-${storeName}-${reducerName}-${payload}`);
      },
    });

    use({
      afterReducer({ storeName, reducerName, payload }) {
        snapshot.push(`1-after-${storeName}-${reducerName}-${payload}`);
      },
    });

    expect(snapshot).toEqual([]);
    expect(addStore.getState(s => s.value)).toBe(0);
    addStore.reducers.add(3);

    expect(snapshot).toEqual([
      '1-before-addStore-add-3',
      '1-after-addStore-add-3',
    ]);
    expect(addStore.getState(s => s.value)).toBe(3);
  });

  it("can extend effect", async () => {
    const snapshot = [];

    const { createStore, storeMap } = init({
      extendEffect({ update, select }) {
        return {
          async call(fn: Function, payload: any = {}, config = {} as any) {
            const result = await fn(payload);
            if (config.successMsg) {
              update({ success: true });
              snapshot.push(`successMsg-${config.successMsg}`);
            }
            return result;
          },
          getQuery() {
            if (storeMap.routeInfo) {
              return storeMap.routeInfo.getState((s: any) => s.query);
            }
          },
        };
      },
    });

    const routeInfoStore = createStore({
      name: "routeInfo",
      state: {
        value: 0,
        q: undefined,
        query: {},
        success: undefined
      },
      effects: {
        async setLater({ call, update, getQuery }, newValue: number) {
          const q = getQuery();
          const result = await call(
            () => sleep(100, newValue),
            newValue,
            { successMsg: 'setLater success' }
          );
          update({ value: result, q });
        }
      },
      reducers: {
        updateQuery(state, query: Record<string, string>) {
          state.query = query;
        }
      }
    });


    expect(snapshot).toEqual([]);
    expect(routeInfoStore.getState(s => s)).toEqual({
      value: 0,
      q: undefined,
      query: {},
      success: undefined
    });

    routeInfoStore.reducers.updateQuery({ a: 'b' });
    expect(routeInfoStore.getState(s => s)).toEqual({
      value: 0,
      q: undefined,
      query: { a: 'b' },
      success: undefined
    });

    await act(() => routeInfoStore.effects.setLater(6));

    expect(routeInfoStore.getState(s => s)).toEqual({
      value: 6,
      q: { a: 'b' },
      query: { a: 'b' },
      success: true
    });

    expect(snapshot).toEqual([
      'successMsg-setLater success',
    ]);
  });


});
