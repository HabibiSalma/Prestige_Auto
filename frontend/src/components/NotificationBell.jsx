/**
 * NotificationBell — the bell icon + dropdown rendered in the Navbar.
 *
 * Polls /api/notifications every 60s (only when the user is logged in)
 * so the red badge stays roughly in sync without us having to set up
 * websockets. The dropdown itself uses Bootstrap's native classes.
 */
import { useEffect, useState } from 'react'
import { listNotifications, markRead, markAllRead } from '../api/notifications.js'

export default function NotificationBell() {
  const [items,  setItems]  = useState([])
  const [unread, setUnread] = useState(0)

  /** Pull notifications from the backend. */
  async function refresh() {
    try {
      const res = await listNotifications()
      setItems(res.data ?? [])
      setUnread(res.unread ?? 0)
    } catch {
      /* fail silently — bell is not critical */
    }
  }

  // Initial load + poll every minute.
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [])

  /** Mark one item read in the UI and on the server. */
  async function handleRead(id) {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnread((u) => Math.max(0, u - 1))
    try { await markRead(id) } catch {}
  }

  /** Mark all read. */
  async function handleReadAll() {
    setItems((list) => list.map((n) => ({ ...n, read: true })))
    setUnread(0)
    try { await markAllRead() } catch {}
  }

  return (
    <div className="dropdown">
      <button
        className="btn btn-link position-relative p-2 text-dark"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Notifications"
      >
        <i className="bi bi-bell fs-5" />
        {unread > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
            style={{ background: '#C9A84C', color: '#1A1A1A', fontSize: '0.65rem' }}
          >
            {unread}
          </span>
        )}
      </button>

      <div
        className="dropdown-menu dropdown-menu-end shadow border-0 p-0"
        style={{ width: 340 }}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <strong>Notifications</strong>
          {unread > 0 && (
            <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={handleReadAll}>
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {items.length === 0 && (
            <div className="text-center text-muted py-4 small">
              <i className="bi bi-inbox fs-3 d-block mb-1" />
              Aucune notification
            </div>
          )}

          {items.map((n) => (
            <button
              key={n.id}
              className="dropdown-item d-flex gap-2 align-items-start py-2 px-3 text-wrap"
              onClick={() => handleRead(n.id)}
              style={{ background: n.read ? 'transparent' : '#FAF7F0' }}
            >
              <i
                className={`bi ${
                  n.type === 'success' ? 'bi-check-circle text-success'
                  : n.type === 'warning' ? 'bi-exclamation-triangle text-warning'
                  : 'bi-info-circle text-primary'
                } mt-1`}
              />
              <div className="flex-grow-1">
                <div className="fw-semibold small">{n.title}</div>
                <div className="text-muted small">{n.message}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
