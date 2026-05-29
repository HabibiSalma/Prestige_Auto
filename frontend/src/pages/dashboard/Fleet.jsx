/**
 * Fleet — staff page listing every vehicle.
 *
 * Allows the manager to add, edit and change the status of a vehicle.
 * The add/edit form lives in a modal so we don't navigate away from the list.
 */
import { useEffect, useState } from 'react'
import {
  listDashboardVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../../api/vehicles.js'
import { listAgencies } from '../../api/agencies.js'
import VehicleImagesModal from '../../components/VehicleImagesModal.jsx'
import Modal from '../../components/Modal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const EMPTY = {
  agency_id: '',
  brand: '', model: '', year: new Date().getFullYear(),
  category: 'sportive', fuel_type: 'essence',
  seats: 4, price_per_day: 800, status: 'disponible',
  description: '', is_premium: false, rating: 4.5,
}

export default function Fleet() {
  const { user } = useAuth()
  const isGestionnaire = user?.role === 'gestionnaire'

  const [items, setItems] = useState([])
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | EMPTY | existing vehicle
  // Vehicle whose photo gallery is currently open. null = modal closed.
  const [photoTarget, setPhotoTarget] = useState(null)

  /** Fetch the fleet. Uses the staff endpoint which:
   *  - includes maintenance vehicles,
   *  - auto-scopes to the gestionnaire's agency server-side. */
  async function refresh() {
    setLoading(true)
    const res = await listDashboardVehicles({ per_page: 50 })
    setItems(res.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // Proprietaire needs the full list to populate the agency dropdown in
    // the add/edit form. Gestionnaire doesn't even see that field, so we
    // could skip it — leaving it loaded is harmless (3 rows in demo data).
    listAgencies().then(setAgencies).catch(() => setAgencies([]))
  }, [])

  /** Save (create or update). */
  async function save(form) {
    if (form.id) {
      const updated = await updateVehicle(form.id, form)
      setItems((arr) => arr.map((v) => (v.id === updated.id ? updated : v)))
    } else {
      const created = await createVehicle(form)
      setItems((arr) => [created, ...arr])
    }
    setEditing(null)
  }

  /** Quick status toggle from the table. */
  async function setStatus(v, status) {
    const updated = await updateVehicle(v.id, { status })
    setItems((arr) => arr.map((x) => (x.id === v.id ? updated : x)))
  }

  async function remove(v) {
    if (!confirm(`Supprimer ${v.brand} ${v.model} ?`)) return
    await deleteVehicle(v.id)
    setItems((arr) => arr.filter((x) => x.id !== v.id))
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-0">Flotte</h2>
          <small className="text-muted">{items.length} véhicules</small>
        </div>
        <button
          className="btn btn-prestige rounded-pill px-3"
          onClick={() => setEditing({
            ...EMPTY,
            // Pre-fill agency: forced to the gestionnaire's own agency,
            // or first available agency for the proprietaire.
            agency_id: isGestionnaire ? user.agency_id : agencies[0]?.id,
          })}
        >
          <i className="bi bi-plus-circle me-1" /> Ajouter
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light small text-uppercase text-muted">
              <tr>
                <th>Véhicule</th>
                <th>Agence</th>
                <th>Prix / jour</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-center py-4"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></td></tr>
              )}
              {!loading && items.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="fw-semibold">{v.brand} {v.model}</div>
                    <small className="text-muted">{v.year} · {v.category}</small>
                  </td>
                  <td><small>{v.agency?.name}</small></td>
                  <td>{v.price_per_day} DH</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 140 }}
                      value={v.status}
                      onChange={(e) => setStatus(v, e.target.value)}
                    >
                      <option value="disponible">Disponible</option>
                      <option value="louee">Louée</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </td>
                  <td className="text-end">
                    {/* Photos manager — opens the gallery modal */}
                    <button
                      className="btn btn-sm btn-outline-dark me-1"
                      onClick={() => setPhotoTarget(v)}
                      title="Gérer les photos"
                    >
                      <i className="bi bi-images" />
                    </button>
                    <button className="btn btn-sm btn-outline-dark me-1" onClick={() => setEditing(v)} title="Modifier">
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(v)} title="Supprimer">
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <VehicleModal
          initial={editing}
          agencies={agencies}
          // The modal hides the agency selector when this is true — the
          // backend forces agency_id to the gestionnaire's own anyway.
          isGestionnaire={isGestionnaire}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}

      {photoTarget && (
        <VehicleImagesModal
          vehicle={photoTarget}
          onClose={() => setPhotoTarget(null)}
          // When the modal closes, copy the freshly updated vehicle into the
          // table so the "main image" change (or new photo count) is visible
          // without a full refetch.
          onUpdated={(updated) => {
            setItems((arr) => arr.map((x) => (x.id === updated.id ? updated : x)))
          }}
        />
      )}
    </div>
  )
}

/* -----------------------------------------------------------------------
 * Modal sub-component — kept in the same file because it's only used here
 * --------------------------------------------------------------------- */
function VehicleModal({ initial, agencies, isGestionnaire, onClose, onSave }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  function set(f, v) { setForm((s) => ({ ...s, [f]: v })) }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try { await onSave(form) }
    catch (e) { alert(e.response?.data?.message ?? 'Erreur.') }
    finally { setSaving(false) }
  }

  // Name of the agency this vehicle is attached to — used by the
  // read-only banner shown to gestionnaires in place of the selector.
  const agencyName = agencies.find((a) => String(a.id) === String(form.agency_id))?.name

  // Action buttons rendered in the Modal's footer slot. They submit the
  // form below via the `form="vehicleForm"` attribute even though they
  // physically live outside the <form> element in the DOM.
  const footer = (
    <>
      <button type="button" className="btn btn-light rounded-pill" onClick={onClose}>Annuler</button>
      <button type="submit" form="vehicleForm" className="btn btn-prestige rounded-pill px-4" disabled={saving}>
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </>
  )

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={form.id ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
      closeOnBackdrop={false}      // avoid losing form data on a stray click
      footer={footer}
    >
      <form id="vehicleForm" onSubmit={submit}>
        <div className="row g-3 small">
              {/* Agency picker — only the proprietaire sees a real dropdown.
                  Gestionnaire sees a static badge with their agency name;
                  the backend enforces this anyway via prepareForValidation. */}
              {!isGestionnaire ? (
                <div className="col-md-4">
                  <label className="form-label">Agence</label>
                  <select
                    className="form-select"
                    value={form.agency_id || ''}
                    onChange={(e) => set('agency_id', e.target.value)}
                  >
                    {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              ) : (
                <div className="col-md-4">
                  <label className="form-label">Agence</label>
                  <div
                    className="form-control bg-light d-flex align-items-center"
                    title="Votre véhicule est automatiquement rattaché à votre agence."
                  >
                    <i className="bi bi-shop me-2" style={{ color: 'var(--gold)' }} />
                    <span className="text-truncate">{agencyName ?? '—'}</span>
                  </div>
                </div>
              )}

              <div className="col-md-4">
                <label className="form-label">Marque</label>
                <input className="form-control" value={form.brand} onChange={(e) => set('brand', e.target.value)} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Modèle</label>
                <input className="form-control" value={form.model} onChange={(e) => set('model', e.target.value)} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Année</label>
                <input type="number" className="form-control" value={form.year} onChange={(e) => set('year', +e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Catégorie</label>
                <select className="form-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {['sportive','berline','suv','compacte','luxe','electrique','monospace'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Énergie</label>
                <select className="form-select" value={form.fuel_type} onChange={(e) => set('fuel_type', e.target.value)}>
                  {['essence','diesel','hybride','electrique'].map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Places</label>
                <input type="number" min="1" max="9" className="form-control" value={form.seats} onChange={(e) => set('seats', +e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Prix / jour (DH)</label>
                <input type="number" className="form-control" value={form.price_per_day} onChange={(e) => set('price_per_day', +e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Note (0-5)</label>
                <input type="number" step="0.1" min="0" max="5" className="form-control" value={form.rating} onChange={(e) => set('rating', +e.target.value)} />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="premium" checked={!!form.is_premium} onChange={(e) => set('is_premium', e.target.checked)} />
                  <label className="form-check-label" htmlFor="premium">Premium</label>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
              </div>
        </div>
      </form>
    </Modal>
  )
}
