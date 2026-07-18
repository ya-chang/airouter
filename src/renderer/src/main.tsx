import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { mockElectronAPI } from './mock-api'

// Inject mock API if Electron API is not available
if (!window.electronAPI) {
  ;(window as any).electronAPI = mockElectronAPI
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
