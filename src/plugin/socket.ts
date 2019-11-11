import cubeState from "../index";

const socketStore = cubeState.createStore({
  name: "socket",
  state: {
    status: 'close',
    messages: [] as MessageEvent[],
    latestMsg: {}
  },
  reducers: {
    updateStatus(state, payload) {
      state.status = payload;
    },
    onMessage(state, payload) {
      state.latestMsg = payload;
      state.messages.push(payload);
    }
  }
});

let connect = (url: string, onOpen: Function) => {
  // var wsUri = "wss://echo.websocket.org/";
  socketStore.reducers.updateStatus('pending');
  var websocket = new WebSocket(url);
  websocket.onopen = function(evt) {
    socketStore.reducers.updateStatus('open');
    onOpen(websocket);
  };
  websocket.onclose = function(evt) {
    socketStore.reducers.updateStatus('close');
  };
  websocket.onmessage = function(evt) {
    socketStore.reducers.onMessage(evt);
  };
  websocket.onerror = function(evt) {
    console.log(evt)
  };

  return websocket.close;
};

export default { ...socketStore, connect };
