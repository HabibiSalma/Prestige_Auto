/**
 * Auth API — register, login, logout, "who am I".
 *
 * All functions use async/await and return the parsed `data` field
 * directly so callers don't have to deal with axios's response wrapper.
 */
import api from './client.js'

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function me() {
  const { data } = await api.get('/auth/me')
  return data.data ?? data
}
