// src/main.jsx
import { MathfieldElement } from 'mathlive';

// Asegúrate de que corre en cliente
if (typeof window !== 'undefined') {
  MathfieldElement.locale = 'es';
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
