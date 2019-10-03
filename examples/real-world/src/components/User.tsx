import * as React from 'react'
import { user, loading } from '../stores'
import Spin from './Spin';

const User = () => {
  const [name, setName] = React.useState('');
  const { login } = loading.use(user);
  // const [password, setPassword] = React.useState('');
  const userStore = user.useStore(s => s);
  const formData = { name, password: '' };

  React.useEffect(() => {
    user.effects.twoArg(2, '3').then(res => {
      console.log('--------- two args result:', res);
    });
  }, [])

  if (!userStore.isLogin) {
    return (
      <div className="login comp-block">
        <h1>Please Login <Spin loading={login}></Spin></h1>
        <label htmlFor="name">name:</label>
        <input type="text" name='name' required onChange={e => setName(e.target.value)} />
        {/* <label htmlFor="password">password:</label>
        <input type="text" name='password' onChange={e => setPassword(e.target.value)} /> */}
        <button onClick={() => name ? user.effects.login(formData) : alert('name?')}>Login</button>
      </div>
    )
  }


  return (
    <div className="user comp-block">
      <h3>Hi~ {userStore.me && userStore.me.name}</h3>
      <button onClick={() => user.reducers.loginOut()}>Exit</button>
    </div>
  )
}


export default User
