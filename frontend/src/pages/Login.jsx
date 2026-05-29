/**
 * Login — email + password form. On success the user is redirected to:
 *   - the page they originally wanted (state.from), OR
 *   - their dashboard if they're staff, OR
 *   - the catalogue otherwise.
 */
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const user = await login(email, password)

      // Redirect priority: explicit "from", then role-based default.
      const from = location.state?.from?.pathname
      if (from) {
        navigate(from, { replace: true })
      } else if (user.role === 'gestionnaire' || user.role === 'proprietaire') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/vehicles', { replace: true })
      }
    } catch (e) {
      setError(e.response?.data?.message ?? 'Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5 fade-in" style={{ maxWidth: 440 }}>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 fw-bold mb-1">Bon retour</h1>
          <p className="text-muted small">Connectez-vous à votre espace Prestige.</p>

          {error && (
            <div className="alert alert-danger small">
              <i className="bi bi-exclamation-triangle me-1" /> {error}
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <label htmlFor="email">Adresse email</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password">Mot de passe</label>
            </div>

            <button
              className="btn btn-prestige w-100 rounded-pill py-2"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 small">
            Pas encore de compte ? <Link to="/register" className="fw-semibold" style={{ color: 'var(--gold)' }}>Inscrivez-vous</Link>
          </p>
        </div>
      </div>

      {/* Demo credentials helper — useful for the student during dev */}
      <div className="text-center small text-muted mt-3">
        {/* Comptes de démonstration :<br /> */}
        {/* <code>owner@prestige-auto.ma</code> · <code>gestionnaire.casa@prestige-auto.ma</code> · <code>client@prestige-auto.ma</code><br /> */}
        {/* Mot de passe : <code>password</code> */}
      </div>
    </div>
  )
}
