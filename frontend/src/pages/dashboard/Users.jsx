/**
 * Users — proprietaire-only tab to list every user and change their role
 * (assigning a gestionnaire to an agency in the process).
 */
import { useEffect, useState } from 'react'
import { listUsers, updateUserRole, deleteUser } from '../../api/dashboard.js'
import { listAgencies } from '../../api/agencies.js'
import Avatar from '../../components/Avatar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users,    setUsers]    = useState([])
  const [agencies, setAgencies] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([listUsers(), listAgencies()]).then(([u, a]) => {
      if (cancelled) return
      setUsers(u); setAgencies(a); setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  /** Apply a role change. Sends both role and (when needed) agency. */
  async function changeRole(u, role, agency_id) {
    const payload = { role, agency_id: role === 'gestionnaire' ? agency_id : null }
    const updated = await updateUserRole(u.id, payload)
    setUsers((arr) => arr.map((x) => (x.id === u.id ? updated : x)))
  }

  /**
   * Delete a user account. Backend enforces the real safety rules
   * (cannot delete self, cannot delete a user with an active rental);
   * the client-side confirm is just so the owner doesn't fire it by accident.
   */
  async function removeUser(u) {
    if (!confirm(`Supprimer définitivement le compte de ${u.name} ?`)) return
    try {
      await deleteUser(u.id)
      setUsers((arr) => arr.filter((x) => x.id !== u.id))
    } catch (e) {
      alert(e.response?.data?.message ?? 'Suppression impossible.')
    }
  }

  return (
    <div>
      <h2 className="fw-bold mb-1">Utilisateurs</h2>
      <p className="text-muted">Modifiez les rôles et les agences assignées.</p>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light small text-uppercase text-muted">
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Agence assignée</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-center py-4"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></td></tr>
              )}
              {!loading && users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {/* <Avatar name={u.name} size={32} /> */}
                      <div>
                        <div className="fw-semibold">{u.name}</div>
                        <small className="text-muted">{u.phone}</small>
                      </div>
                    </div>
                  </td>
                  <td><small>{u.email}</small></td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 160 }}
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value, u.agency_id)}
                    >
                      <option value="client">Client</option>
                      <option value="gestionnaire">Gestionnaire</option>
                      <option value="proprietaire">Propriétaire</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 240 }}
                      value={u.agency_id || ''}
                      disabled={u.role !== 'gestionnaire'}
                      onChange={(e) => changeRole(u, u.role, e.target.value || null)}
                    >
                      <option value="">— Aucune —</option>
                      {agencies.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </td>
                  {/* <td className="text-end"> */}
                    {/* Hide the delete button on the current owner's own row —
                        the API would refuse the call anyway, but hiding the
                        button is clearer UX than letting them click and fail. */}
                    {/* {u.id !== currentUser?.id && ( */}
                      {/* // <button */}
                      {/* //   className="btn btn-sm btn-outline-danger"
                      //   onClick={() => removeUser(u)}
                      //   title="Supprimer cet utilisateur"
                      // >
                      //   <i className="bi bi-trash" />
                      // </button> */}
                    {/* // )} */}
                  {/* </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
