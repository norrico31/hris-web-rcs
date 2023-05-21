import './index.scss'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { routes } from './routes'
import Auth from './shared/contexts/Auth'
import { ConfigProvider } from 'antd'
import DarkMode from './shared/contexts/DarkMode'

createRoot(document.getElementById('root') as HTMLElement).render(
  <Auth>
    <DarkMode>
      <ConfigProvider theme={{
        token: {
          colorText: '#9B3423',
          colorPrimaryTextActive: '#fff',
          colorPrimary: '#9B3423',
          controlOutline: '#9B3423',
          colorLink: '#9B3423',
          colorLinkHover: '#e2998e'
        },
      }}>
        <RouterProvider router={routes} />
      </ConfigProvider>
    </DarkMode>
  </Auth>
)