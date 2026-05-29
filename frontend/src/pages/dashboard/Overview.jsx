/**
 * Overview — landing tab of the dashboard.
 *
 * Renders 4 KPI cards + a 30-day revenue line chart + a fleet
 * utilisation donut chart. Uses Chart.js via react-chartjs-2.
 */
import { useEffect, useState } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { getOverview } from '../../api/dashboard.js'
import { useAuth } from '../../context/AuthContext.jsx'

// Chart.js requires every controller/element to be registered once.
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function Overview() {
  const { user } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    getOverview().then(setData).catch(() => setData({ error: true }))
  }, [])

  if (!data) return <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></div>
  if (data.error) return <div className="alert alert-danger">Impossible de charger les données.</div>

  const { kpis, revenue_series, fleet_distribution } = data

  // Context label shown next to the title:
  //   - gestionnaire -> "Agence : <name>" (his single assigned agency)
  //   - proprietaire -> "Vue globale — toutes les agences"
  const isGestionnaire = user?.role === 'gestionnaire'
  const scopeLabel = isGestionnaire
    ? `Agence : ${user.agency?.name ?? 'non assignée'}`
    : 'Vue globale — toutes les agences'

  // ----- Chart configs ---------------------------------------------------
  const lineData = {
    labels: revenue_series.map((d) => d.date.slice(5)), // MM-DD
    datasets: [{
      label: 'Revenus (DH)',
      data:  revenue_series.map((d) => d.revenue),
      borderColor: '#C9A84C',
      backgroundColor: 'rgba(201,168,76,.18)',
      tension: 0.35,
      fill: true,
      pointRadius: 0,
    }],
  }
  const lineOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { callback: (v) => v + ' DH' } } },
  }

  const donutData = {
    labels: ['Disponibles', 'Louées', 'Maintenance'],
    datasets: [{
      data: [fleet_distribution.disponible, fleet_distribution.louee, fleet_distribution.maintenance],
      backgroundColor: ['#C9A84C', '#1A1A1A', '#D9534F'],
      borderWidth: 0,
    }],
  }

  // ----- Render ----------------------------------------------------------
  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-1">
        <h2 className="fw-bold mb-0">Vue d'ensemble</h2>
        {/* Scope banner — makes it crystal-clear whether the figures below
            are for one agency or for the whole platform. */}
        <span
          className="badge rounded-pill px-3 py-2"
          style={{
            background: isGestionnaire ? 'rgba(201,168,76,.18)' : '#1A1A1A',
            color:      isGestionnaire ? 'var(--gold-dark)'     : 'var(--gold)',
            fontWeight: 600,
          }}
        >
          <i className={`bi ${isGestionnaire ? 'bi-shop' : 'bi-globe2'} me-1`} />
          {scopeLabel}
        </span>
      </div>
      <p className="text-muted">Vos indicateurs clés en un coup d'œil.</p>

      <div className="row g-3 mb-4">
        <KpiCard icon="cash-coin"    title="Revenus du mois"   value={`${kpis.month_revenue} DH`} />
        <KpiCard icon="calendar2-check" title="Réservations"   value={kpis.total_reservations} />
        <KpiCard icon="car-front"    title="Véhicules dispo."  value={kpis.available_vehicles} />
        <KpiCard icon="people"       title="Clients actifs"    value={kpis.active_clients} />
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Revenus — 30 derniers jours</h6>
              <Line data={lineData} options={lineOpts} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Utilisation de la flotte</h6>
              <Doughnut data={donutData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Reusable KPI tile. */
function KpiCard({ icon, title, value }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <small className="text-muted">{title}</small>
            <i className={`bi bi-${icon}`} style={{ color: 'var(--gold)' }} />
          </div>
          <div className="fs-4 fw-bold mt-2">{value}</div>
        </div>
      </div>
    </div>
  )
}
