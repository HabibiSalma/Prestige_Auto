/**
 * Agencies API — public listing + proprietaire CRUD.
 */
import api from './client.js'

export async function listAgencies() {
  const { data } = await api.get('/agencies')
  return data.data ?? data
}

export async function getAgency(id) {
  const { data } = await api.get(`/agencies/${id}`)
  return data.data
}

export async function createAgency(payload) {
  const { data } = await api.post('/agencies', payload)
  return data.data
}

export async function updateAgency(id, payload) {
  const { data } = await api.put(`/agencies/${id}`, payload)
  return data.data
}

export async function deleteAgency(id) {
  await api.delete(`/agencies/${id}`)
}
