## cube-state plugin
Here are some examples of plugins, please modify them according to your needs.


### loading
```javascript
import userStore from 'app/stores/user';
import loadingStore from 'app/stores/loading';


const App = () => {
  const loading = loadingStore.useSpace(userStore);
  return <Spin spinning={loading.loadingUserList}>user list</Spin>
}
```


### socket
```javascript
import socketStore from "app/stores/socket";

const closeSocket = socketStore.connect('wss://echo.websocket.org/', (socket: WebSocket) => {
  setInterval(() => {
    socket.send('time: ' + Date.now());
  }, 2000);
  setTimeout(() => {
    closeSocket();
  }, 9000);
});

const App = () => {
  const socketState = socketStore.useStore(s => s);
  return (
    <div>
      <h3>WebSocket status: {socketState.status}</h3>
      <p>latest msg: {socketState.latestMsg.data}</p>
      <ul className="socket-msg">
        {
          socketState.messages.map((msg, i) => {
            return <li key={i}>{msg.data}</li>;
          })
        }
      </ul>
    </div>
  )
}
```
