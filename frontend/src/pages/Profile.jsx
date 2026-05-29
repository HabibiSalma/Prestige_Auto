/**
 * Profile — every authenticated user can update their own information
 * and (for clients) upload their driving licence.
 */
import { useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import MyDocuments from '../components/MyDocuments.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { updateProfile, uploadAvatar } from '../api/profile.js'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [form,     setForm]     = useState(() => initial(user))
  const [saving,   setSaving]   = useState(false)
  const [message,  setMessage]  = useState(null)

  function set(field, v) { setForm((f) => ({ ...f, [field]: v })) }

  /** Save the profile fields. */
  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const fresh = await updateProfile(form)
      refreshUser(fresh)
      setMessage({ type: 'success', text: 'Profil mis à jour.' })
    } catch (e) {
      setMessage({ type: 'danger', text: e.response?.data?.message ?? 'Erreur.' })
    } finally {
      setSaving(false)
    }
  }

  /** Upload a new avatar. */
  async function handleAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const fresh = await uploadAvatar(file)
      refreshUser(fresh)
    } catch (e) {
      setMessage({ type: 'danger', text: 'Impossible de mettre à jour la photo.' })
    }
  }

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: 920 }}>
      <h1 className="fw-bold mb-1">Mon profil</h1>
      <p className="text-muted">Gérez vos informations et documents.</p>

      {message && (
        <div className={`alert alert-${message.type} small`}>
          {message.text}
        </div>
      )}

      <div className="row g-4">
        {/* Avatar card */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center p-4">
            {/* Flex wrapper guarantees the avatar is horizontally centered
                regardless of its inner element type (img vs initials div). */}
            <div className="d-flex justify-content-center">
              <Avatar
                name={user.name}
                src={user.avatar_url || null}
                size={120}
              />
            </div>
            <h5 className="fw-bold mt-3 mb-0">{user.name}</h5>
            <small className="text-muted text-capitalize">{user.role}</small>

            <label className="btn btn-outline-dark btn-sm rounded-pill mt-3">
              <i className="bi bi-camera me-1" /> Changer la photo
              <input type="file" hidden accept="image/*" onChange={handleAvatar} />
            </label>
          </div>
        </div>

        {/* Editable fields */}
        <div className="col-md-8">
          <form onSubmit={save} className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Informations personnelles</h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Nom complet</label>
                  <input type="text" className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Téléphone</label>
                  <input type="tel" className="form-control" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Ville</label>
                  <input type="text" className="form-control" value={form.city || ''} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Adresse</label>
                  <input type="text" className="form-control" value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Numéro de permis</label>
                  <input type="text" className="form-control" value={form.licence_number || ''} onChange={(e) => set('licence_number', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Expiration du permis</label>
                  <input type="date" className="form-control" value={form.licence_expires_at || ''} onChange={(e) => set('licence_expires_at', e.target.value)} />
                </div>
              </div>

              <div className="text-end mt-4">
                <button className="btn btn-prestige rounded-pill px-4" disabled={saving}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </form>

          {/* Documents — dedicated component, scoped to the authenticated
              user via /api/documents (client branch in DocumentController). */}
          <div className="mt-4">
            <MyDocuments />
          </div>
        </div>
      </div>
    </div>
  )
}

function initial(user) {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    address: user.address,
    licence_number: user.licence_number,
    licence_expires_at: user.licence_expires_at,
  }
}
