/**
 * Dashboard API — KPI cards + charts + user/role admin.
 */
import api from './client.js'

export async function getOverview() {
  const { data } = await api.get('/dashboard/overview')
  return data
}

export async function listUsers() {
  const { data } = await api.get('/dashboard/users')
  return data.data ?? data
}

export async function updateUserRole(id, payload) {
  const { data } = await api.put(`/dashboard/users/${id}/role`, payload)
  return data.data ?? data
}

/**
 * Soft-delete a user account (proprietaire only). Backend will refuse to
 * delete the calling user or anyone with an active reservation.
 */
export async function deleteUser(id) {
  await api.delete(`/dashboard/users/${id}`)
}
