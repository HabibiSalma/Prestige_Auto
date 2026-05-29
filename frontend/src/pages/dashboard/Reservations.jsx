/**
 * Reservations — staff dashboard tab listing every booking in scope.
 *
 * Lets gestionnaires approve / reject pending bookings with one click.
 */
import { useEffect, useState } from 'react'
import { listReservations, approveReservation, rejectReservation } from '../../api/reservations.js'
import StatusBadge from '../../components/StatusBadge.jsx'

const STATUS_FILTERS = [
  { value: '',          label: 'Toutes' },
  { value: 'pending',   label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'active',    label: 'En cours' },
  { value: 'completed', label: 'Terminées' },
  { value: 'cancelled', label: 'Annulées' },
]

export default function Reservations() {
  const [items,  setItems]  = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const params = filter ? { status: filter } : {}
    const res = await listReservations(params)
    setItems(res.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  async function approve(r) {
    const updated = await approveReservation(r.id)
    setItems((arr) => arr.map((x) => (x.id === r.id ? updated : x)))
  }
  async function reject(r) {
    if (!confirm('Rejeter cette réservation ?')) return
    const updated = await rejectReservation(r.id)
    setItems((arr) => arr.map((x) => (x.id === r.id ? updated : x)))
  }

  return (
    <div>
      <h2 className="fw-bold mb-1">Réservations</h2>
      <p className="text-muted">Validez ou rejetez les demandes en attente.</p>

      <ul className="nav nav-pills mb-3 small">
        {STATUS_FILTERS.map((f) => (
          <li className="nav-item" key={f.value}>
            <button
              className={`nav-link ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
              style={filter === f.value ? { background: 'var(--gold)', color: '#1A1A1A' } : {}}
            >
              {f.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light small text-uppercase text-muted">
              <tr>
                
                <th>Client</th>
                <th>Véhicule</th>
                <th>Période</th>
                <th>Total</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="text-center py-4"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">Aucune réservation.</td></tr>
              )}
              {items.map((r) => (
                <tr key={r.id}>
                  {/* <td><small className="text-muted">#{r.id}</small></td> */}
                  <td>
                    <div className="fw-semibold">{r.user?.name}</div>
                    <small className="text-muted">{r.user?.email}</small>
                  </td>
                  <td>{r.vehicle?.brand} {r.vehicle?.model}</td>
                  <td><small>{r.start_date} → {r.end_date}</small></td>
                  <td>{r.total_price} DH</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="text-end">
                    {r.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-success me-1" onClick={() => approve(r)}>
                          <i className="bi bi-check2" />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => reject(r)}>
                          <i className="bi bi-x" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
