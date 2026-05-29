/**
 * VehicleCard — the rectangular card displayed in the catalogue grid.
 *
 * Shows: main image (16:9), brand & model, category badge, optional
 * gold "Premium" badge, price per day, star rating and a "Réserver"
 * button. The whole card is clickable and routes to /vehicles/:id.
 */
import { Link } from 'react-router-dom'

export default function VehicleCard({ vehicle }) {
  // Pick the main image — first one with is_main = true, otherwise the first
  // available, otherwise a placeholder so the card never breaks the layout.
  const image =
    vehicle.main_image ||
    vehicle.images?.find((i) => i.is_main)?.url ||
    vehicle.images?.[0]?.url ||
    'https://placehold.co/640x360/1A1A1A/C9A84C?text=Prestige+Auto'

  // Round the rating down to whole stars; show 5 if equal/over 5.
  const fullStars = Math.round(vehicle.rating || 0)

  return (
    <Link to={`/vehicles/${vehicle.id}`} className="text-decoration-none text-dark">
      <div className="card vehicle-card border-0 shadow-sm h-100">
        {/* Image -------------------------------------------------- */}
        <div className="position-relative overflow-hidden vehicle-card-image">
          <img src={image} alt={`${vehicle.brand} ${vehicle.model}`} loading="lazy" />

          {/* Premium ribbon */}
          {vehicle.is_premium && (
            <span className="badge premium-badge position-absolute top-0 end-0 m-2">
              <i className="bi bi-stars me-1" /> Premium
            </span>
          )}

          {/* Category pill */}
          <span className="badge bg-dark position-absolute bottom-0 start-0 m-2 text-uppercase">
            {vehicle.category}
          </span>
        </div>

        {/* Body --------------------------------------------------- */}
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <h5 className="card-title fw-bold mb-0">
              {vehicle.brand} <span className="fw-normal">{vehicle.model}</span>
            </h5>
            <small className="text-muted">{vehicle.year}</small>
          </div>

          {/* Rating */}
          <div className="mb-2" style={{ color: 'var(--gold)' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <i key={i} className={`bi ${i < fullStars ? 'bi-star-fill' : 'bi-star'}`} />
            ))}
            <small className="text-muted ms-1">{(vehicle.rating ?? 0).toFixed(1)}</small>
          </div>

          {/* Quick specs */}
          <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
            <span><i className="bi bi-fuel-pump me-1" />{vehicle.fuel_type}</span>
            <span><i className="bi bi-people me-1" />{vehicle.seats} places</span>
            {vehicle.agency?.city && (
              <span><i className="bi bi-geo-alt me-1" />{vehicle.agency.city}</span>
            )}
          </div>

          <div className="mt-auto d-flex justify-content-between align-items-center">
            <div>
              <span className="fs-5 fw-bold">{vehicle.price_per_day} DH</span>
              <small className="text-muted"> / jour</small>
            </div>
            <span className="btn btn-prestige btn-sm rounded-pill px-3">
              Réserver
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
