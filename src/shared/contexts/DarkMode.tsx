import { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import { useAuthContext } from './Auth';

interface DarkMode {
    isDarkMode: boolean;
    toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkMode>({
    isDarkMode: false,
    toggleDarkMode: () => { },
})

export const useDarkMode = () => useContext(DarkModeContext)

export default function DarkMode({ children }: { children: ReactNode }) {
    const { user } = useAuthContext()
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        let darkmode = localStorage.getItem('darkmode')
        if (darkmode == null) {
            return false
        } else return JSON.parse(darkmode)
    })

    function toggleDarkMode() {
        const darkMode = !isDarkMode
        setIsDarkMode(darkMode)
        // TODO: Hit api to toggle dark mode
        localStorage.setItem('darkmode', JSON.stringify(darkMode))
    }

    useEffect(() => {
        if (user) {
            if (user?.is_dark) {
                setIsDarkMode(user?.is_dark)
            }
        }
    }, [user])

    return <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>{children}</DarkModeContext.Provider>
}