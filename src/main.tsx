import './index.scss'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { routes } from './routes'
import AuthProvider from './shared/contexts/Auth'
import { ConfigProvider } from 'antd'

createRoot(document.getElementById('root') as HTMLElement).render(
  <AuthProvider>
    <ConfigProvider theme={{
      token: {
        colorText: '#9B3423',
        colorPrimaryTextActive: '#fff',
        colorPrimary: '#9B3423',
        // colorBgContainer: '#9B3423',
        // colorBgBase: '#fff',
        // colorBorder: '#fff',
        controlOutline: '#9B3423',
      },
    }}>
      <RouterProvider router={routes} />
    </ConfigProvider>
  </AuthProvider>
)