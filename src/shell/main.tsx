import React from 'react'
import ReactDOM from 'react-dom/client'
import Shell from './Shell'
import './shell.css'

ReactDOM.createRoot(document.getElementById('shell')!).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>,
)
