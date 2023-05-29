import { ConfigProvider } from 'antd'
import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { routes } from './routes'
import { useDarkMode } from './shared/contexts/DarkMode'

export default function App() {
    const { isDarkMode } = useDarkMode()
    return (
        <ConfigProvider theme={{
            token: {
                colorText: isDarkMode ? '#fff' : '#9B3423',
                colorPrimaryTextActive: '#fff',
                colorPrimary: isDarkMode ? '#fff' : '#9B3423',
                controlOutline: isDarkMode ? '#ccc' : '#9B3423',
                colorLink: isDarkMode ? '#fff' : '#9B3423',
                colorLinkHover: '#e2998e'
            },
        }}>
            <RouterProvider router={routes} />
        </ConfigProvider>
    )
}
