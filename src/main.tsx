import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// 1. Import BrowserRouter
import { BrowserRouter, HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Bao bọc App bên trong BrowserRouter */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)