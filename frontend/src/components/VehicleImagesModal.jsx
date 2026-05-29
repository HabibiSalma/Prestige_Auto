/**
 * VehicleImagesModal — gallery manager for one vehicle.
 *
 * Opened from the Fleet dashboard via the "Photos" button. Lets a staff
 * user:
 *   - see every image currently attached (main one highlighted in gold),
 *   - upload one or several new files at once,
 *   - promote any image to "main" (the picture used on catalogue cards),
 *   - delete any image (the backend re-elects a main if needed).
 *
 * Pattern: the modal keeps a local copy of the vehicle so the UI updates
 * instantly after every action. When the user closes it, the parent (Fleet)
 * receives the final vehicle via `onUpdated` and refreshes its row.
 */
import { useState } from 'react'
import {
  uploadVehicleImages,
  setMainVehicleImage,
  deleteVehicleImage,
} from '../api/vehicles.js'
import Modal from './Modal.jsx'

export default function VehicleImagesModal({ vehicle, onClose, onUpdated }) {
  const [current, setCurrent] = useState(vehicle)
  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState(null)

  const images = current.images ?? []

  /** When the parent needs the latest state, hand back the live vehicle. */
  function close() {
    onUpdated?.(current)
    onClose()
  }

  /** Upload handler — triggered by the hidden file input. */
  async function handleUpload(e) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setBusy(true)
    setError(null)
    try {
      const updated = await uploadVehicleImages(current.id, files)
      setCurrent(updated)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Échec du téléversement.')
    } finally {
      setBusy(false)
      // Reset the input so re-selecting the same file fires onChange again.
      e.target.value = ''
    }
  }

  /** Promote one image to main. */
  async function handleSetMain(image) {
    if (image.is_main) return
    setBusy(true)
    try {
      const updated = await setMainVehicleImage(current.id, image.id)
      setCurrent(updated)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur.')
    } finally {
      setBusy(false)
    }
  }

  /** Delete one image. */
  async function handleDelete(image) {
    if (!confirm('Supprimer cette photo ?')) return
    setBusy(true)
    try {
      const updated = await deleteVehicleImage(current.id, image.id)
      setCurrent(updated)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur.')
    } finally {
      setBusy(false)
    }
  }

  // Title shown in the modal header — includes the count subtitle inline.
  const title = (
    <span>
      Photos — {current.brand} {current.model}
      <small className="text-muted ms-2 fw-normal">
        ({images.length} photo{images.length > 1 ? 's' : ''})
      </small>
    </span>
  )

  // Footer: single "Done" button. Clicking it just closes (and the parent
  // receives the latest vehicle via onUpdated).
  const footer = (
    <button type="button" className="btn btn-prestige rounded-pill px-4" onClick={close}>
      Terminé
    </button>
  )

  return (
    <Modal
      open
      onClose={close}
      size="lg"
      title={title}
      footer={footer}
    >
      {error && (
        <div className="alert alert-danger small">
          <i className="bi bi-exclamation-triangle me-1" /> {error}
        </div>
      )}

            {/* Upload zone */}
            <label
              className={`upload-zone d-flex flex-column align-items-center justify-content-center text-center p-4 mb-3 rounded-3 ${busy ? 'disabled' : ''}`}
              style={{
                border: '2px dashed var(--gold)',
                background: 'var(--cream-soft)',
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >
              <i className="bi bi-cloud-arrow-up fs-1" style={{ color: 'var(--gold)' }} />
              <div className="fw-semibold mt-2">
                {busy ? 'Envoi en cours…' : 'Cliquez pour téléverser une ou plusieurs photos'}
              </div>
              <small className="text-muted">
                JPG, PNG ou WEBP — 4 Mo max par fichier
              </small>
              <input
                type="file"
                hidden
                multiple
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={handleUpload}
              />
            </label>

            {/* Gallery */}
            {images.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-images fs-1 d-block mb-2" />
                Aucune photo pour ce véhicule.
              </div>
            ) : (
              <div className="row g-3">
                {images.map((img) => (
                  <div className="col-6 col-md-4" key={img.id}>
                    <div
                      className="position-relative rounded-3 overflow-hidden shadow-sm"
                      style={{
                        border: img.is_main ? '3px solid var(--gold)' : '1px solid var(--line, #e8e4d7)',
                      }}
                    >
                      <div className="ratio ratio-16x9 bg-light">
                        <img
                          src={img.url}
                          alt=""
                          className="object-fit-cover"
                        />
                      </div>

                      {/* Main badge */}
                      {img.is_main && (
                        <span
                          className="badge position-absolute top-0 start-0 m-2"
                          style={{ background: 'var(--gold)', color: '#1A1A1A' }}
                        >
                          <i className="bi bi-star-fill me-1" /> Principale
                        </span>
                      )}

                      {/* Action buttons */}
                      <div className="d-flex gap-1 p-2 bg-white">
                        {!img.is_main && (
                          <button
                            className="btn btn-sm btn-outline-dark flex-grow-1"
                            disabled={busy}
                            onClick={() => handleSetMain(img)}
                            title="Définir comme image principale"
                          >
                            <i className="bi bi-star" />
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger flex-grow-1"
                          disabled={busy}
                          onClick={() => handleDelete(img)}
                          title="Supprimer cette photo"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
    </Modal>
  )
}
