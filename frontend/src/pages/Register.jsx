/**
 * Register — public sign-up form. Creates a client account and
 * immediately logs the user in (the AuthContext handles both).
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  /** Generic field updater. */
  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await register(form)
      navigate('/vehicles', { replace: true })
    } catch (e) {
      // Laravel returns 422 with { errors: { field: [...] } }
      setErrors(e.response?.data?.errors ?? { _: e.response?.data?.message })
    } finally {
      setLoading(false)
    }
  }

  /** Shortcut to display the first error for a field, if any. */
  const err = (f) => errors[f]?.[0] || null

  return (
    <div className="container py-5 fade-in" style={{ maxWidth: 540 }}>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 fw-bold mb-1">Créer un compte</h1>
          <p className="text-muted small">Réservez une voiture d'exception en quelques clics.</p>

          {errors._ && (
            <div className="alert alert-danger small">
              <i className="bi bi-exclamation-triangle me-1" /> {errors._}
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <div className="form-floating mb-3">
              <input
                type="text"
                className={`form-control ${err('name') ? 'is-invalid' : ''}`}
                id="name"
                placeholder="Nom complet"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
              <label htmlFor="name">Nom complet</label>
              {err('name') && <div className="invalid-feedback">{err('name')}</div>}
            </div>

            <div className="form-floating mb-3">
              <input
                type="email"
                className={`form-control ${err('email') ? 'is-invalid' : ''}`}
                id="email"
                placeholder="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
              />
              <label htmlFor="email">Adresse email</label>
              {err('email') && <div className="invalid-feedback">{err('email')}</div>}
            </div>

            <div className="form-floating mb-3">
              <input
                type="tel"
                className={`form-control ${err('phone') ? 'is-invalid' : ''}`}
                id="phone"
                placeholder="Téléphone"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
              <label htmlFor="phone">Téléphone</label>
              {err('phone') && <div className="invalid-feedback">{err('phone')}</div>}
            </div>

            <div className="form-floating mb-3">
              <input
                type="password"
                className={`form-control ${err('password') ? 'is-invalid' : ''}`}
                id="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
              />
              <label htmlFor="password">Mot de passe (8 caractères minimum)</label>
              {err('password') && <div className="invalid-feedback">{err('password')}</div>}
            </div>

            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                id="password_confirmation"
                placeholder="Confirmer"
                value={form.password_confirmation}
                onChange={(e) => set('password_confirmation', e.target.value)}
                required
              />
              <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
            </div>

            <button
              className="btn btn-prestige w-100 rounded-pill py-2"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 small">
            Déjà inscrit ? <Link to="/login" className="fw-semibold" style={{ color: 'var(--gold)' }}>Connectez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
