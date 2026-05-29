/**
 * Reservations API — booking workflow used by clients and staff.
 */
import api from './client.js'

export async function listReservations(params = {}) {
  const { data } = await api.get('/reservations', { params })
  return data
}

export async function createReservation(payload) {
  const { data } = await api.post('/reservations', payload)
  return data.data ?? data
}

export async function cancelReservation(id) {
  const { data } = await api.post(`/reservations/${id}/cancel`)
  return data.data ?? data
}

export async function approveReservation(id) {
  const { data } = await api.post(`/reservations/${id}/approve`)
  return data.data ?? data
}

export async function rejectReservation(id) {
  const { data } = await api.post(`/reservations/${id}/reject`)
  return data.data ?? data
}
