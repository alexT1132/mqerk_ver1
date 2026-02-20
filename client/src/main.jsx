import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'mathlive/fonts.css'
import App from './App.jsx'

// Evitar que el navegador restaure scroll al navegar (p. ej. /online → /mqerk/online/eeau23)
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
