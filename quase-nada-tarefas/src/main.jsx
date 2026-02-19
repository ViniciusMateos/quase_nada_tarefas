import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'  // <-- Ele importa o App
import './index.css'        // <-- Ele importa o CSS

// Ele "injeta" o App.jsx dentro da <div id="root"> do seu index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)