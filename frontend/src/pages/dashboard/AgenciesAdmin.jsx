/**
 * AgenciesAdmin — proprietaire-only tab to CRUD agencies.
 *
 * Lets the owner add a new agency by clicking on the Leaflet map (the
 * click sets lat/lng automatically) or by filling the address fields
 * manually.
 */
import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { listAgencies, createAgency, updateAgency, deleteAgency } from '../../api/agencies.js'
import Modal from '../../components/Modal.jsx'

const EMPTY = { name: '', city: '', address: '', latitude: 33.5, longitude: -7.6, phone: '', email: '', description: '' }

export default function AgenciesAdmin() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)

  async function refresh() {
    setItems(await listAgencies())
  }

  useEffect(() => { refresh() }, [])

  async function save(form) {
    if (form.id) {
      const updated = await updateAgency(form.id, form)
      setItems((arr) => arr.map((a) => (a.id === updated.id ? updated : a)))
    } else {
      const created = await createAgency(form)
      setItems((arr) => [created, ...arr])
    }
    setEditing(null)
  }

  async function remove(a) {
    if (!confirm(`Supprimer ${a.name} ?`)) return
    await deleteAgency(a.id)
    setItems((arr) => arr.filter((x) => x.id !== a.id))
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-0">Agences</h2>
          <small className="text-muted">{items.length} agences</small>
        </div>
        <button className="btn btn-prestige rounded-pill px-3" onClick={() => setEditing({ ...EMPTY })}>
          <i className="bi bi-plus-circle me-1" /> Nouvelle agence
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <ul className="list-group list-group-flush">
          {items.map((a) => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={a.id}>
              <div>
                <div className="fw-semibold">{a.name}</div>
                <small className="text-muted">{a.address}, {a.city}</small>
              </div>
              <div>
                <button className="btn btn-sm btn-outline-dark me-1" onClick={() => setEditing(a)}>
                  <i className="bi bi-pencil" />
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(a)}>
                  <i className="bi bi-trash" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing && <AgencyModal initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  )
}

/* -------- Modal --------------------------------------------------------- */

function AgencyModal({ initial, onClose, onSave }) {
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

  // Footer buttons — submit the form below via the form="agencyForm" attribute.
  const footer = (
    <>
      <button type="button" className="btn btn-light rounded-pill" onClick={onClose}>Annuler</button>
      <button type="submit" form="agencyForm" className="btn btn-prestige rounded-pill px-4" disabled={saving}>
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </>
  )

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={form.id ? "Modifier l'agence" : 'Nouvelle agence'}
      closeOnBackdrop={false}
      footer={footer}
    >
      <form id="agencyForm" onSubmit={submit}>
        <div className="row g-3 small">
              <div className="col-md-6">
                <label className="form-label">Nom</label>
                <input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ville</label>
                <input className="form-control" value={form.city} onChange={(e) => set('city', e.target.value)} required />
              </div>
              <div className="col-12">
                <label className="form-label">Adresse</label>
                <input className="form-control" value={form.address} onChange={(e) => set('address', e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Téléphone</label>
                <input className="form-control" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input className="form-control" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">Position GPS (cliquez sur la carte)</label>
                <div className="rounded overflow-hidden border" style={{ height: 280 }}>
                  <MapContainer center={[form.latitude || 33.5, form.longitude || -7.6]} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ClickHandler onPick={(latlng) => { set('latitude', latlng.lat); set('longitude', latlng.lng) }} />
                    {form.latitude && form.longitude && <Marker position={[form.latitude, form.longitude]} />}
                  </MapContainer>
                </div>
                <small className="text-muted">Lat: {form.latitude?.toFixed?.(4) ?? form.latitude} — Lng: {form.longitude?.toFixed?.(4) ?? form.longitude}</small>
              </div>
        </div>
      </form>
    </Modal>
  )
}

/** Tiny helper component: forwards Leaflet map clicks to the parent. */
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) { onPick(e.latlng) },
  })
  return null
}
