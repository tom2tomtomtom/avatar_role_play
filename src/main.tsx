import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Note: StrictMode disabled to prevent double-mounting issues with HeyGen avatar sessions
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
