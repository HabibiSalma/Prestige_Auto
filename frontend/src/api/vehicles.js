/**
 * Vehicles API — catalogue + staff CRUD.
 *
 * The `params` argument of listVehicles maps 1:1 to the query string the
 * VehicleController.index expects (search, category, fuel_type, seats,
 * max_price, sort, per_page).
 */
import api from './client.js'

export async function listVehicles(params = {}) {
  const { data } = await api.get('/vehicles', { params })
  return data
}

/**
 * Staff-only listing used by the Fleet dashboard.
 *
 * Calls /api/dashboard/vehicles which:
 *   - returns vehicles in EVERY status (including 'maintenance'), unlike
 *     the public /api/vehicles which hides maintenance cars,
 *   - automatically scopes to the gestionnaire's assigned agency
 *     server-side, so the front-end never has to send agency_id for
 *     a gestionnaire.
 */
export async function listDashboardVehicles(params = {}) {
  const { data } = await api.get('/dashboard/vehicles', { params })
  return data
}

export async function getVehicle(id) {
  const { data } = await api.get(`/vehicles/${id}`)
  return data.data
}

export async function createVehicle(payload) {
  const { data } = await api.post('/vehicles', payload)
  return data.data
}

export async function updateVehicle(id, payload) {
  const { data } = await api.put(`/vehicles/${id}`, payload)
  return data.data
}

export async function deleteVehicle(id) {
  await api.delete(`/vehicles/${id}`)
}

/* ===========================================================================
 * Image management (staff only)
 * Each helper returns the refreshed vehicle so the caller can update its
 * local state without re-fetching the whole catalogue.
 * ========================================================================= */

/**
 * Upload one or several photos for a vehicle.
 * @param {number} vehicleId
 * @param {File[]} files  the files coming from <input type="file" multiple>
 */
export async function uploadVehicleImages(vehicleId, files) {
  const fd = new FormData()
  Array.from(files).forEach((f) => fd.append('images[]', f))

  const { data } = await api.post(`/vehicles/${vehicleId}/images`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data ?? data
}

/** Promote an existing image to "main" (the one shown on the catalogue card). */
export async function setMainVehicleImage(vehicleId, imageId) {
  const { data } = await api.post(`/vehicles/${vehicleId}/images/${imageId}/main`)
  return data.data ?? data
}

/** Delete one image from a vehicle. */
export async function deleteVehicleImage(vehicleId, imageId) {
  const { data } = await api.delete(`/vehicles/${vehicleId}/images/${imageId}`)
  return data.data ?? data
}
