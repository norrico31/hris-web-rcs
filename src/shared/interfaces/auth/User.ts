import { IUser } from "../admin-settings/Users"

export interface IAuthContext {
    token?: string
    user?: IUser
    setUser: React.Dispatch<React.SetStateAction<IUser | undefined>>
    setToken: React.Dispatch<React.SetStateAction<string | undefined>>
}

export interface AuthUserRes {
    message: string
    data: IUser
    status: number
    statusText: "OK"
}