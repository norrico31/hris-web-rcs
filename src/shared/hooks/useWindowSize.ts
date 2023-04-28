import { useState, useEffect } from "react"

export default function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    useEffect(() => {
        const handleWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
        window.addEventListener('resize', handleWindowSize)
        return () => window.removeEventListener('resize', handleWindowSize)
    }, [])

    return windowSize
}
