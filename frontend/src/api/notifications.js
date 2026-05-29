/**
 * Notifications API — feeds the bell icon in the navbar.
 */
import api from './client.js'

export async function listNotifications() {
  const { data } = await api.get('/notifications')
  return data
}

export async function markRead(id) {
  await api.post(`/notifications/${id}/read`)
}

export async function markAllRead() {
  await api.post('/notifications/read-all')
}
