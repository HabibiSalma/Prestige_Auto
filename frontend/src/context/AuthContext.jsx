/**
 * AuthContext — global authentication state for the whole SPA.
 *
 * Why a Context?  We need the current user / token in many places
 * (Navbar, ProtectedRoute, dashboards). Passing them as props through
 * every level would be painful and easy to get wrong. The context API
 * lets any descendant call `useAuth()` and get { user, token, login,
 * logout, register }.
 *
 * Persistence: on first load we hydrate the user from localStorage so
 * a page refresh doesn't kick the user out. We also call /api/auth/me
 * in the background to make sure the cached token is still valid.
 */
import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth.js'

const AuthContext = createContext(null)

// Convenience hook so components write `const { user } = useAuth()`.
export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  // Hydrate from localStorage on first mount (synchronous, no flicker).
  const [user,  setUser]  = useState(() => {
    try {
      const raw = localStorage.getItem('prestige_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('prestige_token'))
  const [ready, setReady] = useState(false)   // true once the boot check is done

  // On boot, if we have a token, ask the backend "who am I?" to make sure
  // it's still valid and to refresh the cached user data.
  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (token) {
        try {
          const fresh = await authApi.me()
          if (!cancelled) saveUser(fresh)
        } catch {
          // Bad token -> wipe everything (the interceptor will have done the
          // redirect already if the response was 401).
          if (!cancelled) clearAuth()
        }
      }
      if (!cancelled) setReady(true)
    }
    boot()
    return () => { cancelled = true }
    // We intentionally run this only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Persist + state-set helpers so we never forget to update both. */
  function saveAuth(nextUser, nextToken) {
    setUser(nextUser)
    setToken(nextToken)
    localStorage.setItem('prestige_user',  JSON.stringify(nextUser))
    localStorage.setItem('prestige_token', nextToken)
  }
  function saveUser(nextUser) {
    setUser(nextUser)
    localStorage.setItem('prestige_user', JSON.stringify(nextUser))
  }
  function clearAuth() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('prestige_user')
    localStorage.removeItem('prestige_token')
  }

  /** Log a user in and store the credentials. */
  async function login(email, password) {
    const { user, token } = await authApi.login(email, password)
    saveAuth(user, token)
    return user
  }

  /** Register a new client and log them in. */
  async function register(payload) {
    const { user, token } = await authApi.register(payload)
    saveAuth(user, token)
    return user
  }

  /** Revoke the token on the server, then clear local state. */
  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Even if the network call fails, clear local state anyway.
    }
    clearAuth()
  }

  const value = {
    user,
    token,
    ready,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    refreshUser: saveUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
