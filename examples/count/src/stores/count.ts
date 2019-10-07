import { createStore } from "cube-state";

function sleep<R>(time: number, data?: R) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), time);
  }) as Promise<R>;
}

function fakeApi<R>(data: R) {
  return sleep(2000, data);
}

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
  effects: {
    async addLater({ call, select, update }, num: number) {
      // get current state
      const countBeforeCall = select(s => s.count);
      console.log('countBeforeCall:', countBeforeCall);

      // 1. await some async function directly
      // const res = await sleep(2000, {
      //   success: true,
      //   data: num + 1
      // })

      // 2. or use call and pass some config as third parameter, for custom logic
      const res = await call(fakeApi, { success: true, data: num }, { someConfig: { successMsg: 'nice~' } })


      const countAfterCall = select(s => s.count);
      console.log('countAfterCall:', countAfterCall);

      // update current state, or update other store by: otherStore.reducer.updateSomething()
      update({
        count: countAfterCall + res.data,
      })

      return {
        returnType: 'fin',
      }
    }
  }
})

export default countStore;
