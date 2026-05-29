/**
 * DashboardLayout — left side menu + right content area used by every
 * dashboard sub-page (Overview, Fleet, Reservations, Documents, Agencies, Users).
 */
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function DashboardLayout() {
  const { user } = useAuth()
  const isOwner = user?.role === 'proprietaire'

  const tabs = [
    { to: '/dashboard',              icon: 'speedometer2', label: "Vue d'ensemble", end: true },
    { to: '/dashboard/fleet',        icon: 'car-front',    label: 'Flotte' },
    { to: '/dashboard/reservations', icon: 'calendar2-check', label: 'Réservations' },
    { to: '/dashboard/documents',    icon: 'file-earmark-text', label: 'Documents' },
    ...(isOwner ? [
      { to: '/dashboard/agencies', icon: 'shop',  label: 'Agences' },
      { to: '/dashboard/users',    icon: 'people', label: 'Utilisateurs' },
    ] : []),
  ]

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="row g-4">
        <aside className="col-lg-3">
          <div className="card border-0 shadow-sm p-3 sticky-lg-top" style={{ top: 90 }}>
            <div className="small text-muted text-uppercase fw-bold mb-2" style={{ letterSpacing: 1 }}>
              {isOwner ? 'Administration' : 'Mon agence'}
            </div>
            <nav className="nav flex-column dashboard-nav">
              {tabs.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
                  }
                >
                  <i className={`bi bi-${t.icon}`} /> {t.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main className="col-lg-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
