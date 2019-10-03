import { sleep } from "../util"


export const getFriendList = (userId: number) => {
  return sleep(200, {
    success: true,
    data: [
      {
        id: 1,
        name: 'Mike',
        online: true,
      },
      {
        id: 2,
        name: 'LiLy',
        online: true,
      },
      {
        id: 3,
        name: 'Tom',
        online: false,
      },
      {
        id: 4,
        name: 'Jack Ma',
        online: true,
      },
    ]
  })
}

export const getMessageList = () => {
  return sleep(500, {
    success: true,
    data: [
      {
        id: 1000,
        from: 'Mike',
        content: 'chicken?',
      },
      {
        id: 1001,
        from: 'LiLy',
        content: 'Morning~',
      },
      {
        id: 1002,
        from: 'Jack Ma',
        content: '当你成功的时候，你说的所有话都是真理。',
      },
    ]
  })
}
