import './index.scss'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { routes } from './routes'
import AuthProvider from './shared/contexts/Auth'

createRoot(document.getElementById('root') as HTMLElement).render(
  <AuthProvider>
    <RouterProvider router={routes} />
  </AuthProvider>
)