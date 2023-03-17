import './index.scss'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { routes } from './routes'

createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={routes} />
)