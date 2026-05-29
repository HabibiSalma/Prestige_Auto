/**
 * FilterSidebar — left column on the catalogue page.
 *
 * Controlled by the parent (Vehicles.jsx) via the `value` and `onChange`
 * props. We deliberately keep state in the parent so the URL can mirror
 * the filters later if needed.
 */
const CATEGORIES = [
  { value: '',            label: 'Toutes les catégories' },
  { value: 'sportive',    label: 'Sportive' },
  { value: 'berline',     label: 'Berline' },
  { value: 'suv',         label: 'SUV' },
  { value: 'compacte',    label: 'Compacte' },
  { value: 'luxe',        label: 'Luxe' },
  { value: 'electrique',  label: 'Électrique' },
  { value: 'monospace',   label: 'Monospace' },
]

const FUELS = [
  { value: '',           label: 'Toutes les énergies' },
  { value: 'essence',    label: 'Essence' },
  { value: 'diesel',     label: 'Diesel' },
  { value: 'hybride',    label: 'Hybride' },
  { value: 'electrique', label: 'Électrique' },
]

export default function FilterSidebar({ value, onChange, onReset }) {
  /** Helper: produce a new filter object with one field replaced. */
  function update(field, v) {
    onChange({ ...value, [field]: v })
  }

  return (
    <aside className="card border-0 shadow-sm p-3 sticky-md-top" style={{ top: '90px' }}>
      <h6 className="fw-bold mb-3">
        <i className="bi bi-funnel me-2" />Filtres
      </h6>

      {/* Search ------------------------------------------------------- */}
      <div className="mb-3">
        <label className="form-label small fw-medium">Recherche</label>
        <div className="input-group">
          <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Marque ou modèle"
            value={value.search || ''}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>
      </div>

      {/* Category ----------------------------------------------------- */}
      <div className="mb-3">
        <label className="form-label small fw-medium">Catégorie</label>
        <select
          className="form-select"
          value={value.category || ''}
          onChange={(e) => update('category', e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Fuel --------------------------------------------------------- */}
      <div className="mb-3">
        <label className="form-label small fw-medium">Énergie</label>
        <select
          className="form-select"
          value={value.fuel_type || ''}
          onChange={(e) => update('fuel_type', e.target.value)}
        >
          {FUELS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Seats -------------------------------------------------------- */}
      <div className="mb-3">
        <label className="form-label small fw-medium">Places minimum</label>
        <select
          className="form-select"
          value={value.seats || ''}
          onChange={(e) => update('seats', e.target.value)}
        >
          <option value="">Indifférent</option>
          {[2, 4, 5, 7].map((n) => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </select>
      </div>

      {/* Max price slider -------------------------------------------- */}
      <div className="mb-3">
        <label className="form-label small fw-medium d-flex justify-content-between">
          <span>Budget maximum</span>
          <span className="text-muted">{value.max_price || 5000} DH</span>
        </label>
        <input
          type="range"
          className="form-range"
          min={500}
          max={5000}
          step={100}
          value={value.max_price || 5000}
          onChange={(e) => update('max_price', e.target.value)}
        />
      </div>

      <button className="btn btn-outline-dark btn-sm w-100" onClick={onReset}>
        <i className="bi bi-arrow-clockwise me-1" /> Réinitialiser
      </button>
    </aside>
  )
}
