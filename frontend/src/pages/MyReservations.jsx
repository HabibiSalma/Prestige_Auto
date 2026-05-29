/**
 * MyReservations — list of the current client's reservations.
 *
 * Lets the user cancel a booking when allowed (canBeCancelled = true
 * on the server side). Opens a detail modal on click.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listReservations, cancelReservation } from '../api/reservations.js'
import StatusBadge from '../components/StatusBadge.jsx'
import Modal from '../components/Modal.jsx'

export default function MyReservations() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  async function load() {
    setLoading(true)
    try {
      // mine=1 forces the API to return ONLY the bookings this user made
      // personally as a customer — even if they happen to be a gestionnaire
      // or the proprietaire (who would otherwise see the agency / global
      // list on the same endpoint).
      const res = await listReservations({ mine: 1 })
      setItems(res.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  /** Cancel a booking — optimistic update + reload if it fails. */
  async function handleCancel(id) {
    if (!confirm('Annuler cette réservation ?')) return
    try {
      const updated = await cancelReservation(id)
      setItems((list) => list.map((r) => (r.id === id ? updated : r)))
    } catch (e) {
      alert(e.response?.data?.message ?? 'Annulation impossible.')
    }
  }

  return (
    <div className="container py-4 fade-in">
      <h1 className="fw-bold mb-1">Mes réservations</h1>
      <p className="text-muted">Suivez l'état de vos réservations passées et à venir.</p>

      {loading && (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-calendar-x fs-1 d-block mb-2" />
          Aucune réservation pour l'instant.<br />
          <Link to="/vehicles" className="btn btn-prestige rounded-pill mt-3">Découvrir le catalogue</Link>
        </div>
      )}

      <div className="row g-3">
        {items.map((r) => (
          <div className="col-12" key={r.id}>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <div className="row g-3 align-items-center">
                  <div className="col-md-2">
                    <div className="ratio ratio-16x9 rounded overflow-hidden bg-light">
                      <img
                        src={r.vehicle?.main_image || r.vehicle?.images?.[0]?.url || 'https://placehold.co/300x180/1A1A1A/C9A84C?text=...'}
                        alt={`${r.vehicle?.brand} ${r.vehicle?.model}`}
                        className="object-fit-cover"
                      />
                    </div>
                  </div>
                  <div className="col-md-5">
                    <h6 className="fw-bold mb-1">{r.vehicle?.brand} {r.vehicle?.model}</h6>
                    <small className="text-muted d-block">
                      <i className="bi bi-shop me-1" />{r.agency?.name}
                    </small>
                    <small className="text-muted d-block">
                      <i className="bi bi-calendar3 me-1" />
                      Du {r.start_date} au {r.end_date} <span className="text-secondary">({r.days}j)</span>
                    </small>
                  </div>
                  <div className="col-md-2 text-md-center">
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="col-md-2 text-md-center">
                    <div className="fw-bold">{r.total_price} DH</div>
                  </div>
                  <div className="col-md-1 text-end">
                    <div className="dropdown">
                      <button className="btn btn-sm btn-light" data-bs-toggle="dropdown" aria-label="actions">
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                        <li>
                          <button className="dropdown-item" onClick={() => setSelected(r)}>
                            <i className="bi bi-eye me-2" /> Détails
                          </button>
                        </li>
                        {r.can_cancel && (
                          <li>
                            <button className="dropdown-item text-danger" onClick={() => handleCancel(r.id)}>
                              <i className="bi bi-x-circle me-2" /> Annuler
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal — uses the shared <Modal /> component so it is rendered
          via a portal into <body>, escapes every page stacking context and
          scrolls internally when the content is taller than the viewport. */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        size="md"
        title={selected ? `Réservation #${selected.id}` : ''}
      >
        {selected && (
          <div className="small">
            <p><strong>Véhicule :</strong> {selected.vehicle?.brand} {selected.vehicle?.model}</p>
            <p><strong>Agence :</strong> {selected.agency?.name}, {selected.agency?.city}</p>
            <p><strong>Période :</strong> du {selected.start_date} au {selected.end_date}</p>
            <p><strong>Horaires :</strong> {selected.pickup_time} → {selected.return_time}</p>
            <p><strong>Total :</strong> {selected.total_price} DH</p>
            <p><strong>Statut :</strong> <StatusBadge status={selected.status} /></p>
            {selected.notes && (
              <p className="mb-0"><strong>Notes :</strong> {selected.notes}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
