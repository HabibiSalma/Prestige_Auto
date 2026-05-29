/**
 * Documents API — upload / verify / delete identity documents.
 */
import api from './client.js'

/**
 * Fetch documents. Accepts a `params` object forwarded as query string.
 * The most useful flag is `mine: 1` which forces the API to return only
 * the documents uploaded by the authenticated user — regardless of their
 * role (client, gestionnaire or proprietaire).
 */
export async function listDocuments(params = {}) {
  const { data } = await api.get('/documents', { params })
  return data
}

/**
 * Upload a document. Expects a File coming from an <input type="file">.
 * Builds FormData under the hood so axios sets multipart/form-data.
 */
export async function uploadDocument({ type, file, expires_at }) {
  const fd = new FormData()
  fd.append('type', type)
  fd.append('file', file)
  if (expires_at) fd.append('expires_at', expires_at)

  const { data } = await api.post('/documents', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data ?? data
}

export async function verifyDocument(id) {
  const { data } = await api.post(`/documents/${id}/verify`)
  return data.data ?? data
}

export async function deleteDocument(id) {
  await api.delete(`/documents/${id}`)
}
