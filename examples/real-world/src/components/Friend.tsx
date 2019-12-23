import * as React from 'react'
import { friend, user, loading } from '../stores';
import Spin from './Spin';

interface Props {
  loginUser: typeof user.stateType.me
  friendList: typeof friend.stateType.friendList
  getFriendList: typeof friend.effects.getFriendList
  loading: boolean
}

class Friend extends React.Component<Props> {
  // state = {
  //   text: this.props.text || '',
  // }

  componentDidMount() {
    const { loginUser, getFriendList } = this.props;
    loginUser && getFriendList(loginUser.id);
  }

  componentWillReceiveProps({ loginUser }: Props) {
    if (loginUser !== this.props.loginUser) {
      loginUser && this.props.getFriendList(loginUser.id);
    }
  }

  render() {
    const { friendList, loading } = this.props;
    console.log('render friend:');
    return (
      <div>
        <div className="friend comp-block">
          <h3 >Friend list <Spin loading={loading}></Spin></h3>
          <ul>
            {
              friendList.map(f => {
                return <li key={f.id}>{f.name} ----- <span className='status-point' style={{ background: f.online ? 'green' : 'red' }}></span></li>
              })
            }
          </ul>
        </div>
      </div>
    )
  }
}

const Wrap = () => {
  const userStore = user.useStore(s => s);
  const friendStore = friend.useStore(s => s);
  const { friendList } = friendStore;
  const { getFriendList } = friend.effects;
  const friendLoading = loading.use(friend) || {};

  return <Friend loading={friendLoading.getFriendList} loginUser={userStore.me} friendList={friendList} getFriendList={getFriendList} />
}
export default Wrap
