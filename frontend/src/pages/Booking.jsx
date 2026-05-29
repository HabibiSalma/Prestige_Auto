/**
 * Booking — three-step reservation flow.
 *
 * Step 1: dates + agency + times
 * Step 2: summary with computed total
 * Step 3: success page with reservation number
 *
 * Uses ReservationCalendar to block already-booked dates server-side.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getVehicle } from '../api/vehicles.js'
import { createReservation } from '../api/reservations.js'
import ReservationCalendar from '../components/ReservationCalendar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Booking() {
  const { vehicleId } = useParams()
  const navigate      = useNavigate()
  const { isAuthenticated } = useAuth()

  const [vehicle, setVehicle] = useState(null)
  const [step,    setStep]    = useState(1)

  // Form fields
  const [range,   setRange]   = useState([null, null])
  const [pickup,  setPickup]  = useState('10:00')
  const [retTime, setRetTime] = useState('18:00')
  const [notes,   setNotes]   = useState('')
  const [agencyId, setAgencyId] = useState(null)

  // Result
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [created,    setCreated]    = useState(null)

  const [startDate, endDate] = range

  // Redirect to login if not authenticated.
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/booking/${vehicleId}` } } })
    }
  }, [isAuthenticated, navigate, vehicleId])

  // Fetch the vehicle + its booked dates.
  useEffect(() => {
    let cancelled = false
    async function load() {
      const v = await getVehicle(vehicleId)
      if (!cancelled) {
        setVehicle(v)
        setAgencyId(v.agency_id)
      }
    }
    load()
    return () => { cancelled = true }
  }, [vehicleId])

  if (!vehicle) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: 'var(--gold)' }} />
      </div>
    )
  }

  // ----- Helpers ----------------------------------------------------
  /** Returns the number of days currently selected (>= 1) or 0 if invalid. */
  function dayCount() {
    if (!startDate || !endDate) return 0
    const ms = endDate.getTime() - startDate.getTime()
    return Math.max(1, Math.round(ms / 86_400_000) + 1)
  }

  const days  = dayCount()
  const total = days * vehicle.price_per_day

  /** Submit the booking to the API. */
  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        vehicle_id:  vehicle.id,
        agency_id:   agencyId,
        start_date:  toIso(startDate),
        end_date:    toIso(endDate),
        pickup_time: pickup,
        return_time: retTime,
        notes,
      }
      const reservation = await createReservation(payload)
      setCreated(reservation)
      setStep(3)
    } catch (e) {
      setError(e.response?.data?.message ?? 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  // ----- Render -----------------------------------------------------
  return (
    <div className="container py-4 fade-in" style={{ maxWidth: 960 }}>
      <h1 className="fw-bold mb-1">Réservation</h1>
      <p className="text-muted">{vehicle.brand} {vehicle.model}</p>

      {/* Step indicator */}
      <div className="d-flex gap-2 mb-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex-grow-1 rounded-pill"
            style={{
              height: 6,
              background: n <= step ? 'var(--gold)' : '#e5e1d6',
              transition: 'background .3s',
            }}
          />
        ))}
      </div>

      {/* ===== STEP 1 ===================================================== */}
      {step === 1 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Sélectionnez vos dates</h5>
            <div className="row g-4">
              <div className="col-md-7">
                <ReservationCalendar
                  startDate={startDate}
                  endDate={endDate}
                  unavailable={vehicle.booked_dates ?? []}
                  onChange={(dates) => setRange(dates)}
                />
              </div>
              <div className="col-md-5">
                <div className="mb-3">
                  <label className="form-label small fw-medium">Heure de prise en charge</label>
                  <input type="time" className="form-control" value={pickup} onChange={(e) => setPickup(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-medium">Heure de retour</label>
                  <input type="time" className="form-control" value={retTime} onChange={(e) => setRetTime(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-medium">Notes (facultatif)</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Demandes particulières, vol d'arrivée…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="bg-cream rounded-3 p-3">
                  <div className="d-flex justify-content-between small">
                    <span>{days || '--'} jour{days > 1 ? 's' : ''} × {vehicle.price_per_day} DH</span>
                    <strong>{total ? `${total} DH` : '--'}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                className="btn btn-prestige rounded-pill px-4"
                disabled={!startDate || !endDate}
                onClick={() => setStep(2)}
              >
                Étape suivante <i className="bi bi-arrow-right ms-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== STEP 2 ===================================================== */}
      {step === 2 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">Récapitulatif</h5>

            <div className="row g-3 small">
              <div className="col-md-6">
                <div className="text-muted">Véhicule</div>
                <strong>{vehicle.brand} {vehicle.model}</strong>
              </div>
              <div className="col-md-6">
                <div className="text-muted">Agence de prise en charge</div>
                <strong>{vehicle.agency?.name}</strong>
              </div>
              <div className="col-md-3">
                <div className="text-muted">Du</div>
                <strong>{toIso(startDate)}</strong>
              </div>
              <div className="col-md-3">
                <div className="text-muted">Au</div>
                <strong>{toIso(endDate)}</strong>
              </div>
              <div className="col-md-3">
                <div className="text-muted">Heure prise</div>
                <strong>{pickup}</strong>
              </div>
              <div className="col-md-3">
                <div className="text-muted">Heure retour</div>
                <strong>{retTime}</strong>
              </div>
            </div>

            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Total à régler en agence</div>
                <div className="display-6 fw-bold mb-0">{total} DH</div>
              </div>
              <small className="text-muted">{days} jour{days > 1 ? 's' : ''}</small>
            </div>

            {error && (
              <div className="alert alert-danger mt-3 mb-0">
                <i className="bi bi-exclamation-triangle me-1" /> {error}
              </div>
            )}

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-dark rounded-pill px-4" onClick={() => setStep(1)}>
                <i className="bi bi-arrow-left me-1" /> Retour
              </button>
              <button
                className="btn btn-prestige rounded-pill px-4"
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? 'Envoi…' : 'Confirmer la réservation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== STEP 3 ===================================================== */}
      {step === 3 && created && (
        <div className="card border-0 shadow-sm text-center">
          <div className="card-body p-5">
            <div
              className="rounded-circle mx-auto d-flex justify-content-center align-items-center mb-3"
              style={{ width: 80, height: 80, background: 'rgba(201,168,76,.15)' }}
            >
              <i className="bi bi-check2-circle" style={{ fontSize: 36, color: 'var(--gold)' }} />
            </div>
            <h3 className="fw-bold">Réservation enregistrée</h3>
            <p className="text-muted mb-4">
              Votre numéro de réservation est <strong>#{created.id}</strong>. Vous serez
              notifié(e) dès que l'agence aura validé votre demande.
            </p>
            <button
              className="btn btn-prestige rounded-pill px-4"
              onClick={() => navigate('/my-reservations')}
            >
              Voir mes réservations
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Convert a Date to "YYYY-MM-DD" without timezone shifts. */
function toIso(d) {
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
