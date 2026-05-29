/**
 * StatusBadge — small coloured pill used everywhere a reservation status
 * needs to be displayed. Keeping the mapping in one place ensures the
 * colours never drift across pages.
 */
const MAP = {
  pending:   { label: 'En attente',  className: 'bg-primary-subtle text-primary' },
  confirmed: { label: 'Confirmée',   className: 'bg-success-subtle text-success' },
  active:    { label: 'En cours',    className: 'badge-gold' },
  completed: { label: 'Terminée',    className: 'bg-secondary-subtle text-secondary' },
  cancelled: { label: 'Annulée',     className: 'bg-danger-subtle text-danger' },
}

export default function StatusBadge({ status }) {
  const conf = MAP[status] || { label: status, className: 'bg-light text-dark' }
  return (
    <span className={`badge rounded-pill px-3 py-2 ${conf.className}`}>
      {conf.label}
    </span>
  )
}
