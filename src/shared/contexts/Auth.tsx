import { createContext, ReactNode, useContext, useState } from 'react'

export interface IUser {
    account_status: string
    created_at: string
    deleted_at?: string
    email: string
    email_verified_at?: string
    firstname: string
    fullname: string
    id: string
    lastname: string
    middlename?: string
    mobile_number?: string
    telephone_number?: string
    updated_at: string
}

interface IAuthContext {
    token?: string
    user?: IUser;
    setUser: React.Dispatch<React.SetStateAction<IUser | undefined>>
    setToken: React.Dispatch<React.SetStateAction<string | undefined>>
}

const initialState = {
    name: 'Unknown',
    email: 'Unknown',
    imageUrl: '',
    created_at: '',
    email_verified_at: '',
    id: 0,
    updated_at: ''
}

const AuthContext = createContext<IAuthContext>({
    token: undefined,
    user: undefined,
    setUser: () => { },
    setToken: () => { },
})

export const useAuthContext = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | undefined>(() => {
        let token = localStorage.getItem('t')
        if (token != null) {
            return JSON.parse(token)
        } else return undefined
    })
    const [user, setUser] = useState<IUser | undefined>(undefined)
    return <AuthContext.Provider value={{ token, user, setUser, setToken }}>{children}</AuthContext.Provider>
}