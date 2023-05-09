import { createContext, ReactNode, useContext, useState } from 'react'
import { IAuthContext, IUser } from '../interfaces'

const AuthContext = createContext<IAuthContext>({
    setUser: () => { },
    setLoading: () => { },
    setToken: () => { },
})

export const useAuthContext = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | undefined>(() => {
        let token = localStorage.getItem('t')!
        if (token != null || token != 'undefined' || token != undefined) {
            return JSON.parse(token)
        } else return undefined
    })
    const [user, setUser] = useState<IUser | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    return <AuthContext.Provider value={{ token, user, loading, setLoading, setUser, setToken }}>{children}</AuthContext.Provider>
}