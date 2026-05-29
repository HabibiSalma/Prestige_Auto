/**
 * Vite entry-point. Mounts the React tree into <div id="root"> and pulls
 * in all the global stylesheets in the right order (vendors -> ours).
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

// -- Vendor styles -----------------------------------------------------------
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'react-datepicker/dist/react-datepicker.css'
import 'leaflet/dist/leaflet.css'

// -- Our own theme (loaded LAST so its rules win) ----------------------------
import './styles/app.css'

// Bootstrap JS bundle — needed for the navbar toggler, dropdowns, modals.
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter wraps everything so any component can use react-router */}
    <BrowserRouter>
      {/* AuthProvider exposes the current user/token to every child via hooks */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
