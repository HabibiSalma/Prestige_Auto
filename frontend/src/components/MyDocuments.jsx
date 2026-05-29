/**
 * MyDocuments — section embedded inside the client profile page.
 *
 * Lists ONLY the documents that belong to the authenticated user
 * (the backend at GET /api/documents already scopes by user_id when
 * the caller is a client — see DocumentController::index).
 *
 * Features:
 *   - upload a new document (type, file, optional expiry date)
 *   - see each document's verification status (badge)
 *   - download / view the file
 *   - delete a document that has NOT been verified yet
 *
 * Security notes for the student:
 *   - We never send user_id to the backend; it always uses auth()->id().
 *   - The "delete" button only renders when verified === false. The
 *     backend would refuse anyway (see DocumentController::destroy), but
 *     hiding the button is clearer UX.
 */
import { useEffect, useRef, useState } from 'react'
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
} from '../api/documents.js'

// Human-readable label shown on cards and option lists.
const TYPE_LABEL = {
  permis:    'Permis de conduire',
  cin:       'Carte Nationale',
  passeport: 'Passeport',
}

export default function MyDocuments() {
  const [docs,      setDocs]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState(null)

  // Upload form state
  const [type,      setType]      = useState('permis')
  const [expiresAt, setExpiresAt] = useState('')
  const fileRef = useRef(null)

  /** Fetch the current user's documents from /api/documents.
   *  mine=1 forces the API to return ONLY documents this user uploaded
   *  themselves — even if they happen to be a gestionnaire or the
   *  proprietaire (who would otherwise see other people's papers via
   *  the role-based scoping on this endpoint). */
  async function load() {
    setLoading(true)
    try {
      const res = await listDocuments({ mine: 1 })
      setDocs(res.data ?? [])
    } catch {
      setError('Impossible de charger vos documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  /**
   * Submit the upload form.
   * We pass the File directly to the API helper which builds the
   * FormData (multipart/form-data) under the hood.
   */
  async function handleUpload(e) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('Veuillez sélectionner un fichier.')
      return
    }

    setError(null)
    setUploading(true)
    try {
      const created = await uploadDocument({
        type,
        file,
        expires_at: expiresAt || undefined,
      })
      // Prepend so the newest doc appears on top.
      setDocs((prev) => [created, ...prev])
      // Reset the form so the user can upload another doc immediately.
      fileRef.current.value = ''
      setExpiresAt('')
      setType('permis')
    } catch (err) {
      setError(err.response?.data?.message ?? "Erreur lors de l'envoi.")
    } finally {
      setUploading(false)
    }
  }

  /** Delete a single (unverified) document after confirmation. */
  async function handleDelete(doc) {
    if (!window.confirm(`Supprimer ce ${TYPE_LABEL[doc.type]?.toLowerCase()} ?`)) return
    try {
      await deleteDocument(doc.id)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
    } catch (err) {
      alert(err.response?.data?.message ?? 'Suppression impossible.')
    }
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">

        {/* Section title with gold underline */}
        <h5 className="section-title mb-4">
          <i className="bi bi-folder2-open me-2" style={{ color: 'var(--gold)' }} />
          Mes documents
        </h5>

        {/* ===== UPLOAD FORM =============================================== */}
        <form onSubmit={handleUpload} className="doc-upload-card p-3 mb-4">
          <div className="row g-2 align-items-end">

            {/* Type dropdown */}
            <div className="col-md-3">
              <label className="form-label small fw-medium mb-1">Type</label>
              <select
                className="form-select form-select-sm"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {Object.entries(TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Optional expiry date */}
            <div className="col-md-3">
              <label className="form-label small fw-medium mb-1">
                Expiration <span className="text-muted">(facultatif)</span>
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            {/* File picker */}
            <div className="col-md-4">
              <label className="form-label small fw-medium mb-1">
                Fichier (PDF, JPG, PNG)
              </label>
              <input
                ref={fileRef}
                type="file"
                className="form-control form-control-sm"
                accept=".pdf,image/jpeg,image/png"
                required
              />
            </div>

            {/* Submit */}
            <div className="col-md-2 d-grid">
              <button
                type="submit"
                className="btn btn-prestige btn-sm rounded-pill"
                disabled={uploading}
              >
                {uploading
                  ? <><span className="spinner-border spinner-border-sm me-1" /> Envoi…</>
                  : <><i className="bi bi-upload me-1" /> Envoyer</>}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger small mt-3 mb-0">
              <i className="bi bi-exclamation-triangle me-1" /> {error}
            </div>
          )}
        </form>

        {/* ===== DOCUMENTS LIST ============================================= */}
        {loading && (
          <div className="text-center text-muted py-3">
            <div className="spinner-border" style={{ color: 'var(--gold)' }} />
          </div>
        )}

        {!loading && docs.length === 0 && (
          <div className="text-center text-muted py-4">
            <i className="bi bi-file-earmark fs-1 d-block mb-2" />
            Aucun document téléchargé pour le moment.
          </div>
        )}

        <div className="d-flex flex-column gap-2">
          {docs.map((doc) => (
            <div className="doc-card d-flex align-items-center gap-3 p-3" key={doc.id}>

              {/* Type icon */}
              <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 48, height: 48,
                  background: 'rgba(201,168,76,.15)',
                  color: 'var(--gold-dark)',
                }}
              >
                <i className="bi bi-file-earmark-text fs-4" />
              </div>

              {/* Info */}
              <div className="flex-grow-1">
                <div className="fw-semibold">{TYPE_LABEL[doc.type] ?? doc.type}</div>
                <small className="text-muted d-block">
                  Ajouté le {formatDate(doc.created_at)}
                  {doc.expires_at && <> — expire le {formatDate(doc.expires_at)}</>}
                </small>

                {/* Verification badge */}
                {doc.verified ? (
                  <span className="badge bg-success-subtle text-success mt-1">
                    <i className="bi bi-check-circle me-1" /> Vérifié
                  </span>
                ) : (
                  <span className="badge bg-warning-subtle text-warning mt-1">
                    <i className="bi bi-hourglass-split me-1" /> En attente de vérification
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="d-flex gap-2 flex-shrink-0">
                {/* View / download — opens the file in a new tab */}
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-dark"
                  title="Voir le document"
                >
                  <i className="bi bi-eye" />
                </a>

                {/* Delete — only when the doc is not yet verified */}
                {!doc.verified && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    title="Supprimer"
                    onClick={() => handleDelete(doc)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Tiny date formatter — turns "2026-05-27" or an ISO timestamp into
 * the more human-friendly "27/05/2026". Falls back to the raw value
 * if parsing fails, so we never display "Invalid Date" to the user.
 */
function formatDate(raw) {
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = d.getFullYear()
  return `${dd}/${mm}/${yy}`
}
