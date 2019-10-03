import { createStore } from '../cube'
import headerStore from './header';
import * as friendServices from '../services/friend';

type Friend = {
  id: number,
  name: string,
  online: boolean,
}

type Message = {
  id: number,
  from: string,
  content: string,
}

export interface FriendState {
  friendList: Friend[]
  messageList: Message[]
}

const initialState: FriendState = {
  friendList: [],
  messageList: []
}

const friendStore = createStore({
  name: 'friend',
  state: initialState,
  reducers: {
    friendStatusChange(state) {
      if (state.friendList) {
        const index = Math.floor(Math.random() * state.friendList.length);
        state.friendList[index].online = !state.friendList[index].online;
      }
      const onlineCount = state.friendList.filter(f => f.online).length;
      headerStore.reducers.setOnlineCount(onlineCount);
    },
    addMessage(state, newMsg: Message) {
      state.messageList.push(newMsg);
    },
  },
  effects: {
    async getFriendList({ call, update }, userId: number) {
      const result = await call(friendServices.getFriendList, userId);
      if (result.success) {
        update({ friendList: result.data });
      }
    },
    async getMessageList({ call, update }) {
      const result = await call(friendServices.getMessageList);
      if (result.success) {
        update({ messageList: result.data });
      }
    }
  },
})

export default friendStore;
