/**
 * Vehicles — the full catalogue.
 *
 * Two-column layout (sidebar + grid). The sidebar updates the local
 * `filters` state which is then debounced and sent to the API. Sort
 * dropdown is above the grid.
 */
import { useEffect, useMemo, useState } from 'react'
import VehicleCard from '../components/VehicleCard.jsx'
import FilterSidebar from '../components/FilterSidebar.jsx'
import { listVehicles } from '../api/vehicles.js'

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  fuel_type: '',
  seats: '',
  max_price: 10000,
}

export default function Vehicles() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sort,    setSort]    = useState('recommended')
  const [items,   setItems]   = useState([])
  const [meta,    setMeta]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Build the params object passed to the API. useMemo avoids rebuilding
  // it on every render — only when filters/sort actually change.
  const params = useMemo(() => {
    const p = { sort, per_page: 24 }
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) p[k] = v
    })
    return p
  }, [filters, sort])

  // Debounced fetch — wait 300 ms after the last change before hitting the API.
  useEffect(() => {
    setLoading(true)
    const id = setTimeout(async () => {
      try {
        const res = await listVehicles(params)
        setItems(res.data ?? [])
        setMeta(res.meta ?? null)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(id)
  }, [params])

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
    setSort('recommended')
  }

  return (
    <div className="container py-4 fade-in">
      {/* Title ------------------------------------------------------ */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Catalogue</h1>
        <p className="text-muted mb-0">
          Trouvez le véhicule d'exception parfait pour votre prochaine sortie.
        </p>
      </div>

      <div className="row g-4">
        {/* Sidebar -------------------------------------------------- */}
        <div className="col-12 col-md-4 col-lg-3">
          <FilterSidebar value={filters} onChange={setFilters} onReset={resetFilters} />
        </div>

        {/* Grid ----------------------------------------------------- */}
        <div className="col-12 col-md-8 col-lg-9">
          {/* Toolbar */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <small className="text-muted">
              {loading
                ? 'Chargement...'
                : `${items.length} véhicule${items.length > 1 ? 's' : ''} trouvé${items.length > 1 ? 's' : ''}`}
            </small>

            <div className="d-flex align-items-center gap-2">
              <label className="form-label small mb-0 text-muted">Trier par</label>
              <select
                className="form-select form-select-sm"
                style={{ width: 180 }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recommended">Recommandés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: 'var(--gold)' }} />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-emoji-frown fs-1 d-block" />
              Aucun véhicule ne correspond à votre recherche.
            </div>
          )}

          <div className="row g-4">
            {items.map((v) => (
              <div className="col-12 col-sm-6 col-xl-4" key={v.id}>
                <VehicleCard vehicle={v} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
