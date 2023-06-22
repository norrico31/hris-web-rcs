import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import { routes } from './routes'
import { useDarkMode } from './shared/contexts/DarkMode'

export default function App() {
    const { isDarkMode } = useDarkMode()
    return (
        <ConfigProvider theme={{
            token: {
                colorText: isDarkMode ? '#fff' : '#747474',
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
