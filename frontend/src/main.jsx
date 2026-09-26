import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode><AuthProvider><CartProvider><App /></CartProvider></AuthProvider></React.StrictMode>,
)
