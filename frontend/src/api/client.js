/**
 * Central axios instance used by every API module.
 *
 * What it does:
 *  1. Sets the base URL of the Laravel backend.
 *  2. Sends JSON and asks for JSON in return.
 *  3. Reads the Sanctum bearer token from localStorage on every
 *     request via an interceptor — that way new tokens issued after
 *     login are picked up automatically.
 *  4. Centralised 401 handling: if the server says "token invalid",
 *     we wipe localStorage and force a redirect to /login.
 */
import axios from 'axios'

// The dev backend serves the API on port 8000 by default (php artisan serve).
// In production replace this with VITE_API_URL or your real domain.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// withCredentials is false because we use pure bearer-token auth (Sanctum
// token in localStorage, sent as Authorization header). Setting it to true
// would push axios into cookie/SPA mode, which forces a CSRF round-trip and
// produces "CSRF token mismatch" errors on /auth/login and /auth/register.
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
  },
})

// ---- Request interceptor ---------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('prestige_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---- Response interceptor --------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 means the token is missing / expired / revoked.
    if (error.response?.status === 401) {
      localStorage.removeItem('prestige_token')
      localStorage.removeItem('prestige_user')
      // Avoid redirect loops if we're already on the login page.
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
