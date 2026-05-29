/**
 * Profile API — endpoints the authenticated user uses on their own profile.
 */
import api from './client.js'

export async function updateProfile(payload) {
  const { data } = await api.put('/profile', payload)
  return data.data ?? data
}

export async function uploadAvatar(file) {
  const fd = new FormData()
  fd.append('avatar', file)
  const { data } = await api.post('/profile/avatar', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data ?? data
}
