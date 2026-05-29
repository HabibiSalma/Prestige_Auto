/**
 * VehicleDetail — full page for one vehicle.
 *
 * Layout: gallery on the left (main image + clickable thumbnails),
 * specs/description/agency info + CTA on the right. The booked-dates
 * array returned by the API is passed down to the booking page so the
 * calendar there can grey-out the unavailable days.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getVehicle } from '../api/vehicles.js'

export default function VehicleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(null)
  const [active,  setActive]  = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const v = await getVehicle(id)
        if (!cancelled) setVehicle(v)
      } catch {
        navigate('/vehicles', { replace: true })
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, navigate])

  if (!vehicle) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: 'var(--gold)' }} />
      </div>
    )
  }

  const images = vehicle.images?.length ? vehicle.images : [{ url: 'https://placehold.co/1280x720/1A1A1A/C9A84C?text=Prestige+Auto' }]
  const mainImg = images[active]?.url || images[0]?.url
  const stars = Math.round(vehicle.rating || 0)

  return (
    <div className="container py-4 fade-in">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/vehicles">Catalogue</Link></li>
          <li className="breadcrumb-item active">{vehicle.brand} {vehicle.model}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Gallery -------------------------------------------------- */}
        <div className="col-lg-7">
          <div className="ratio ratio-16x9 rounded-4 overflow-hidden bg-light shadow-sm mb-3">
            <img src={mainImg} alt={`${vehicle.brand} ${vehicle.model}`} className="object-fit-cover" />
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {images.map((img, i) => (
              <button
                key={img.id ?? i}
                onClick={() => setActive(i)}
                className={`p-0 border ${i === active ? 'border-2' : 'border-1'} rounded overflow-hidden`}
                style={{
                  width: 96, height: 64,
                  borderColor: i === active ? 'var(--gold)' : 'transparent',
                  background: 'transparent',
                }}
                aria-label={`Image ${i + 1}`}
              >
                <img src={img.url} alt="" className="w-100 h-100 object-fit-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details -------------------------------------------------- */}
        <div className="col-lg-5">
          <div className="d-flex gap-2 mb-2 flex-wrap">
            {vehicle.is_premium && (
              <span className="badge premium-badge">
                <i className="bi bi-stars me-1" /> Premium
              </span>
            )}
            <span className="badge bg-dark text-uppercase">{vehicle.category}</span>
            <span className="badge bg-light text-dark border">{vehicle.year}</span>
          </div>

          <h1 className="fw-bold mb-1">{vehicle.brand} {vehicle.model}</h1>

          <div className="mb-3" style={{ color: 'var(--gold)' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <i key={i} className={`bi ${i < stars ? 'bi-star-fill' : 'bi-star'}`} />
            ))}
            <small className="text-muted ms-1">{(vehicle.rating ?? 0).toFixed(1)} / 5</small>
          </div>

          {/* Specs */}
          <div className="row g-2 small mb-4">
            {[
              { icon: 'fuel-pump',    label: 'Énergie',  value: vehicle.fuel_type },
              { icon: 'people',       label: 'Places',   value: vehicle.seats },
              { icon: 'gear',         label: 'Statut',   value: vehicle.status },
              { icon: 'calendar',     label: 'Année',    value: vehicle.year },
            ].map((s) => (
              <div className="col-6" key={s.label}>
                <div className="p-3 rounded-3 bg-cream d-flex align-items-center gap-2">
                  <i className={`bi bi-${s.icon}`} style={{ color: 'var(--gold)' }} />
                  <div>
                    <div className="text-muted small">{s.label}</div>
                    <strong className="text-capitalize">{s.value}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {vehicle.description && (
            <>
              <h6 className="text-uppercase small fw-bold" style={{ color: 'var(--gold)', letterSpacing: 1 }}>
                Description
              </h6>
              <p className="text-muted">{vehicle.description}</p>
            </>
          )}

          {/* Agency */}
          {vehicle.agency && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h6 className="fw-bold mb-1">
                  <i className="bi bi-shop me-2" style={{ color: 'var(--gold)' }} />
                  {vehicle.agency.name}
                </h6>
                <small className="text-muted d-block">{vehicle.agency.address}, {vehicle.agency.city}</small>
                {vehicle.agency.phone && (
                  <small className="text-muted"><i className="bi bi-telephone me-1" />{vehicle.agency.phone}</small>
                )}
              </div>
            </div>
          )}

          {/* Price + CTA */}
          <div className="d-flex justify-content-between align-items-center p-3 rounded-3 border">
            <div>
              <div className="display-6 fw-bold mb-0">
                {vehicle.price_per_day} <small className="fs-6 fw-normal text-muted">DH / jour</small>
              </div>
            </div>
            <Link
              to={`/booking/${vehicle.id}`}
              className="btn btn-prestige btn-lg rounded-pill px-4"
            >
              Réserver maintenant <i className="bi bi-arrow-right ms-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
