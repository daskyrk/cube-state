import cube from "../index";

enum STATUS {
  OPEN = "open",
  CLOSE = "close",
  PENDING = "pending"
}
interface IState {
  instance?: WebSocket;
  timer?: number;
  status: STATUS;
  messages: MessageEvent[];
  latestMsg: MessageEvent;
}

const { createStore } = cube();
const socketStore = createStore({
  name: "socket",
  state: {
    instance: undefined,
    timer: undefined,
    status: "close",
    messages: [] as MessageEvent[],
    latestMsg: {}
  } as IState,
  effects: {
    async open({ update, select }, url: string) {
      const [ins, status] = select(s => [s.instance, s.status]);

      if (!ins && status !== STATUS.OPEN) {
        const websocket = new WebSocket(url);
        websocket.onopen = function(evt) {
          const timer = setInterval(() => {
            websocket.send("time: " + Date.now());
          }, 2000);
          update({ timer, status: STATUS.OPEN });
        };
        // websocket.onclose = function(evt) {
        //   update({ status: STATUS.CLOSE, instance: undefined });
        // };
        websocket.onmessage = function(evt) {
          socketStore.reducers.onMessage(evt);
        };
        websocket.onerror = function(evt) {
          console.log(evt);
        };
        update({ instance: websocket, status: STATUS.PENDING });
      }
    }
  },
  reducers: {
    close(state) {
      if (state.instance) {
        state.instance.close();
        state.instance = undefined;
        state.status = STATUS.CLOSE;
        clearInterval(state.timer);
      }
    },
    onMessage(state, payload) {
      state.latestMsg = payload;
      state.messages.push(payload);
    }
  }
});

export default socketStore;
