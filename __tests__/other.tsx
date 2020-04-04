import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import {
  cleanup,
  fireEvent,
  render,
  waitForElement
} from "@testing-library/react";
import init from "../src";
import initLoading from "../src/plugin/loading";
import { sleep } from "./render";

const consoleError = console.error;
afterEach(() => {
  cleanup();
  console.error = consoleError;
});

describe("plugin", () => {
  const { createStore, storeMap, use } = init();
  const loadingStore = initLoading({ use, createStore });

  const countStore = createStore({
    name: "count",
    state: {
      value: 0
    },
    effects: {
      async setLater({ call, update }, newValue: number) {
        const result = await call(() => sleep(100, newValue));
        update({ value: result });
      }
    }
  });

  it("loadingPlugin can auto toggle loading", async () => {
    const snapshot = [];
    function Counter() {
      const count = countStore.useStore(s => s.value);
      const loading = loadingStore.useSpace(countStore);
      snapshot.push([count, loading.setLater]);
      return <div>count: {count}</div>;
    }

    const { getByText } = render(<Counter />);
    await waitForElement(() => getByText("count: 0"));
    expect(snapshot).toEqual([[0, false]]);

    await act(() => countStore.effects.setLater(1));
    expect(snapshot).toEqual([[0, false], [0, true], [1, true], [1, false]]);
    await waitForElement(() => getByText("count: 1"));
  });
});
