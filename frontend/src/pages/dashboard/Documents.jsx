/**
 * Documents — staff tab listing client documents pending verification.
 */
import { useEffect, useState } from 'react'
import { listDocuments, verifyDocument } from '../../api/documents.js'

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await listDocuments()
    setDocs(res.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function approve(d) {
    const updated = await verifyDocument(d.id)
    setDocs((arr) => arr.map((x) => (x.id === d.id ? updated : x)))
  }

  return (
    <div>
      <h2 className="fw-bold mb-1">Documents</h2>
      <p className="text-muted">Vérifiez les documents transmis par les clients.</p>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light small text-uppercase text-muted">
              <tr>
                <th>Client</th>
                <th>Type</th>
                <th>Téléversé le</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-center py-4"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></td></tr>
              )}
              {!loading && docs.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted py-4">Aucun document.</td></tr>
              )}
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="fw-semibold">{d.user?.name}</div>
                    <small className="text-muted">{d.user?.email}</small>
                  </td>
                  <td className="text-capitalize">{d.type}</td>
                  <td><small>{(d.created_at || '').slice(0, 10)}</small></td>
                  <td>
                    {d.verified
                      ? <span className="badge bg-success-subtle text-success">Vérifié</span>
                      : <span className="badge bg-warning-subtle text-warning">En attente</span>}
                  </td>
                  <td className="text-end">
                    <a className="btn btn-sm btn-outline-dark me-1" href={d.url} target="_blank" rel="noreferrer">
                      <i className="bi bi-eye" /> Voir
                    </a>
                    {!d.verified && (
                      <button className="btn btn-sm btn-success" onClick={() => approve(d)}>
                        <i className="bi bi-check2" /> Vérifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
