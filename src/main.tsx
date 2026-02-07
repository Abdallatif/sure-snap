import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SettingsProvider } from './context/SettingsContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
)
