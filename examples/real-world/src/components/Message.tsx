import * as React from 'react'
import { loading, friend } from '../stores'
import Spin from './Spin';


const Msg = () => {
  const friendStore = friend.useStore(s => s);
  const { getMessageList } = loading.use(friend);
  console.log('render msg:');
  return (
    <div className="comp-block msg">
      <h3>Message List <Spin loading={getMessageList}></Spin></h3>
      <ul className="msg-list">
        {
          friendStore.messageList.map((msg, i) => {
            return <li key={i}><b>From: {msg.from}</b> ----- {msg.content}</li>
          })
        }
      </ul>
    </div>
  )
}
export default Msg
