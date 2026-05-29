/**
 * Agencies — public page showing all agencies on a Leaflet map +
 * a list of cards on the right. Each marker has a popup with a
 * "Voir les véhicules" link that pre-filters the catalogue by agency.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { listAgencies } from '../api/agencies.js'

// Fix the default Leaflet marker icon — without this the marker disappears
// because Vite cannot resolve the asset paths bundled inside the library.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function Agencies() {
  const [agencies, setAgencies] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await listAgencies()
        if (!cancelled) setAgencies(data ?? [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Default to Morocco roughly centred on Casablanca.
  const center = [33.5, -7.6]

  return (
    <div className="container py-4 fade-in">
      <h1 className="fw-bold mb-1">Nos agences</h1>
      <p className="text-muted">Retrouvez l'agence Prestige Auto la plus proche.</p>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="rounded-4 overflow-hidden shadow-sm" style={{ height: 480 }}>
            <MapContainer
              center={center}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {agencies
                .filter((a) => a.latitude && a.longitude)
                .map((a) => (
                  <Marker key={a.id} position={[a.latitude, a.longitude]}>
                    <Popup>
                      <div>
                        <strong>{a.name}</strong><br />
                        <span className="text-muted small">{a.address}</span><br />
                        <Link to={`/vehicles?agency_id=${a.id}`}>Voir les véhicules</Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>

        <div className="col-lg-5">
          {loading && (
            <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></div>
          )}
          <div className="d-flex flex-column gap-3">
            {agencies.map((a) => (
              <div className="card border-0 shadow-sm" key={a.id}>
                <div className="card-body">
                  <h5 className="fw-bold mb-1">{a.name}</h5>
                  <p className="small text-muted mb-2">
                    <i className="bi bi-geo-alt me-1" />{a.address}, {a.city}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <i className="bi bi-car-front me-1" />
                      {a.vehicles_count ?? 0} véhicules
                    </small>
                    <Link to={`/vehicles?agency_id=${a.id}`} className="btn btn-sm btn-outline-dark rounded-pill">
                      Voir la flotte
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
