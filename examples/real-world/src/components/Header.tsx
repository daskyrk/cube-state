import * as React from 'react'
import { header } from '../stores'

const Header = () => {
  const headStore = header.useStore(s => s);
  return (
    <header className="header comp-block">
      <h1>{headStore.title}</h1>
      <h3>当前在线人数：{headStore.friendOnlineCount}</h3>
    </header>
  )
}

export default Header

