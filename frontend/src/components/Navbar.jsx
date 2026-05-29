/**
 * Navbar — top navigation rendered on every page.
 *
 * Shows different links based on the user's role and exposes the
 * notification bell + user dropdown when authenticated.
 */
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from './Avatar.jsx'
import NotificationBell from './NotificationBell.jsx'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  /** Build the path to the dashboard depending on the user's role. */
  const dashboardPath = user?.role === 'proprietaire' || user?.role === 'gestionnaire'
    ? '/dashboard'
    : null

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white sticky-top border-bottom prestige-navbar">
      <div className="container">
        {/* Brand */}
        <Link to="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <i className="bi bi-suit-diamond-fill" style={{ color: 'var(--gold)' }} />
          <span style={{ letterSpacing: '.4px' }}>
            Prestige <span style={{ color: 'var(--gold)' }}>Auto</span>
          </span>
        </Link>

        {/* Mobile hamburger */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#prestigeNav"
          aria-controls="prestigeNav"
          aria-expanded="false"
          aria-label="Menu"
        >
          <i className="bi bi-list fs-3" />
        </button>

        {/* Main menu */}
        <div className="collapse navbar-collapse" id="prestigeNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link">Accueil</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/vehicles" className="nav-link">Catalogue</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/agencies" className="nav-link">Agences</NavLink>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink to="/my-reservations" className="nav-link">Mes réservations</NavLink>
              </li>
            )}
            {dashboardPath && (
              <li className="nav-item">
                <NavLink to={dashboardPath} className="nav-link">Tableau de bord</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {!isAuthenticated && (
              <>
                <Link to="/login" className="btn btn-link text-dark fw-medium text-decoration-none">
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-prestige rounded-pill px-3">
                  Inscription
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                <NotificationBell />

                <div className="dropdown">
                  <button
                    className="btn btn-link p-1 d-flex align-items-center gap-2 text-decoration-none text-dark"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <Avatar name={user.name} src={user.avatar ? `${apiHost()}/storage/${user.avatar}` : null} />
                    <span className="d-none d-md-inline small fw-semibold">
                      {user.name.split(' ')[0]}
                    </span>
                    <i className="bi bi-chevron-down small d-none d-md-inline" />
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                    <li>
                      <Link to="/profile" className="dropdown-item">
                        <i className="bi bi-person me-2" /> Mon profil
                      </Link>
                    </li>
                    <li>
                      <Link to="/my-reservations" className="dropdown-item">
                        <i className="bi bi-calendar-check me-2" /> Mes réservations
                      </Link>
                    </li>
                    {dashboardPath && (
                      <li>
                        <Link to={dashboardPath} className="dropdown-item">
                          <i className="bi bi-speedometer2 me-2" /> Tableau de bord
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2" /> Déconnexion
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

/** Compute the API host (without /api) so we can build /storage URLs. */
function apiHost() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  return base.replace(/\/api\/?$/, '')
}
