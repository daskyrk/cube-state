import { createStore } from '../cube'
import { sleep } from '../util'


interface State {
  title: string
  friendOnlineCount: number,
}

const initialState: State = {
  title: '',
  friendOnlineCount: 0,
}

const headerStore = createStore({
  name: 'header',
  state: initialState,
  reducers: {
    setTitle(state, title: string) {
      state.title = title;
    },
    setOnlineCount(state, count: number) {
      state.friendOnlineCount = count;
    },
  },
  effects: {
  },
})


export default headerStore
