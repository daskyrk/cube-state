import { sleep } from "../util"

export interface LoginForm {
  name: string
  password: string
}

export const login = (loginForm: LoginForm) => {
  return sleep(100, {
    success: true,
    data: {
      id: 999,
      name: loginForm.name,
      auth: ['addFriend'],
    }
  })
}

export const twoArgs = (data: { arg1: number, arg2: string }) => {
  return sleep(200, {
    success: true,
    ...data,
  })
}

