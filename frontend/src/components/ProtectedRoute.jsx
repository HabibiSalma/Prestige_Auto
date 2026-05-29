/**
 * ProtectedRoute — wraps any page that requires authentication.
 *
 * Behaviour:
 *  - while the AuthContext is still booting (checking the cached token)
 *    we render a spinner so the user doesn't see a flash of "logged out".
 *  - if no user is logged in, we redirect to /login and remember the
 *    original location so we can come back after a successful login.
 *  - if `roles` is provided, the user's role must be in the list,
 *    otherwise we redirect to the home page.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, roles }) {
  const { user, ready, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" style={{ color: 'var(--gold)' }} role="status" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
