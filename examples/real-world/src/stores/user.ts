import { createStore } from '../cube'
import { sleep } from '../util'
import headerStore from './header';
import friendStore from './friend';
import * as userServices from '../services/user';

type Message = {
  id: number,
  from: string,
  content: string,
}

interface State {
  me: {
    id: number,
    name: string,
    auth: string[],
  } | null
  isLogin: boolean
}

const initialState: State = {
  me: null,
  isLogin: false,
}

let socketTimer: any;
let msgTimer: any;
const fakeSocket = () => {
  socketTimer = setInterval(() => {
    friendStore.reducers.friendStatusChange();
  }, 4000);
  msgTimer = setInterval(() => {
    friendStore.reducers.addMessage({
      id: 20,
      from: 'Ted',
      content: 'nice to meet u'
    });
  }, 8000);
}


const user = createStore({
  name: 'user',
  state: initialState,
  reducers: {
    loginOut(state) {
      state.isLogin = false;
      friendStore.updateState({
        messageList: [],
        friendList: [],
      });
      headerStore.reducers.setTitle('Wait for you!')
      clearInterval(socketTimer);
      clearInterval(msgTimer);
    },
  },
  effects: {
    // effect有1个参数
    async login({ select, call, update }, loginForm: userServices.LoginForm) {
      if (select(s => s.isLogin)) {
        console.log('has login!')
        return;
      }
      const result = await call(userServices.login, loginForm);
      if (result.success) {
        update({ isLogin: true, me: result.data })
        headerStore.reducers.setTitle('Welcome!')
        await friendStore.effects.getMessageList();
        fakeSocket();
      }
    },
    // effect有2个参数
    async twoArg({ select, call, update }, arg1: number, arg2: string) {
      // 使用call时始终合并为1个参数
      return await call(userServices.twoArgs, { arg1, arg2 });
    },
  },
})


export default user;
