import './index.scss'
import { createRoot } from 'react-dom/client'
import Auth from './shared/contexts/Auth'
import DarkMode from './shared/contexts/DarkMode'
import App from './App'

createRoot(document.getElementById('root') as HTMLElement).render(
  <Auth>
    <DarkMode>
      <App />
    </DarkMode>
  </Auth>
)