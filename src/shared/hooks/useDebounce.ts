import { useState, useEffect } from 'react'

export const useSearchDebounce = (search: string, delay: number = 500): string => {
    const [searchDebounce, setSearchDebounce] = useState(search)
    useEffect(() => {
        const debounceSearch = setTimeout(() => {
            setSearchDebounce(search)
        }, delay)
        return () => clearTimeout(debounceSearch)
    }, [search, delay])
    return searchDebounce
}