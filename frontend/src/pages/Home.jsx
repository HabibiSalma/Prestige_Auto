/**
 * Home — landing page.
 *
 * Hero section + featured vehicles + value props. Uses the dark/cream/gold
 * palette and big confident typography to feel premium.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listVehicles } from '../api/vehicles.js'
import VehicleCard from '../components/VehicleCard.jsx'

export default function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await listVehicles({ sort: 'recommended', per_page: 6 })
        if (!cancelled) setFeatured(res.data ?? [])
      } catch { /* no-op */ }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="fade-in">
      {/* HERO ------------------------------------------------------- */}
      <section className="prestige-hero text-white">
        <div className="container py-5">
          <div className="row align-items-center" style={{ minHeight: '480px' }}>
            <div className="col-lg-7">
              {/* <span className="badge px-3 py-2 mb-3" style={{ background: 'rgba(201,168,76,.15)', color: 'var(--gold)' }}>
                <i className="bi bi-stars me-1" /> Édition Sportives & Luxe
              </span> */}
              <h1 className="display-3 fw-bold lh-1 mb-3">
                Roulez en <span style={{ color: 'var(--gold)' }}>légende.</span><br />
                Louez en <span style={{ color: 'var(--gold)' }}>quelques clics.</span>
              </h1>
              <p className="lead text-light opacity-75 mb-4" style={{ maxWidth: 560 }}>
                Porsche, Ferrari, Lamborghini, Range Rover&hellip; Notre flotte d'exception
                vous attend à Casablanca, Marrakech et Rabat. Réservez en ligne en moins
                de deux minutes.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/vehicles" className="btn btn-prestige btn-lg rounded-pill px-4">
                  Voir le catalogue <i className="bi bi-arrow-right ms-2" />
                </Link>
                <Link to="/agencies" className="btn btn-outline-light btn-lg rounded-pill px-4">
                  <i className="bi bi-geo-alt me-1" /> Nos agences
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS ----------------------------------------------- */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 text-center">
            {[
              { icon: 'shield-check',     title: 'Véhicules vérifiés',     text: 'Contrôle technique avant chaque location.' },
              { icon: 'clock',            title: 'Réservation 24/7',       text: 'Vous réservez en ligne, on s\'occupe du reste.' },
              { icon: 'cash-coin',        title: 'Sans frais cachés',      text: 'Le prix affiché est le prix payé.' },
              { icon: 'headset',          title: 'Support 7j/7',           text: 'Une équipe dédiée à votre service.' },
            ].map((b) => (
              <div className="col-6 col-md-3" key={b.title}>
                <div className="value-card p-4 h-100">
                  <i className={`bi bi-${b.icon}`} style={{ fontSize: '2rem', color: 'var(--gold)' }} />
                  <h6 className="fw-bold mt-3">{b.title}</h6>
                  <small className="text-muted">{b.text}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED FLEET -------------------------------------------- */}
      <section className="py-5 bg-cream">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <small className="text-uppercase fw-bold" style={{ color: 'var(--gold)', letterSpacing: '2px' }}>
                Notre sélection
              </small>
              <h2 className="fw-bold mb-0">Véhicules à l'affiche</h2>
            </div>
            <Link to="/vehicles" className="btn btn-link text-decoration-none text-dark fw-medium d-none d-md-inline">
              Tout voir <i className="bi bi-arrow-right" />
            </Link>
          </div>

          <div className="row g-4">
            {featured.length === 0 && (
              <div className="col-12 text-center text-muted py-5">
                <div className="spinner-border" style={{ color: 'var(--gold)' }} />
              </div>
            )}
            {featured.map((v) => (
              <div className="col-12 col-md-6 col-lg-4" key={v.id}>
                <VehicleCard vehicle={v} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
