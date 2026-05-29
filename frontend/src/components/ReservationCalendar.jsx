/**
 * ReservationCalendar — pretty wrapper around react-datepicker that
 * accepts an `unavailable` array of "YYYY-MM-DD" strings and disables
 * those days. Used inside the booking page so the client can only pick
 * a date range that is actually free for the chosen vehicle.
 */
import DatePicker, { registerLocale } from 'react-datepicker'
import { fr } from 'date-fns/locale/fr'

registerLocale('fr', fr)

export default function ReservationCalendar({
  startDate,
  endDate,
  unavailable = [],
  onChange,
}) {
  const blocked = new Set(unavailable)

  /** react-datepicker filterDate predicate -> return true to allow the day. */
  function isAllowed(date) {
    const iso = date.toISOString().slice(0, 10)
    return !blocked.has(iso)
  }

  return (
    <DatePicker
      selected={startDate}
      onChange={onChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      inline
      minDate={new Date()}
      filterDate={isAllowed}
      locale="fr"
      dayClassName={(date) => {
        const iso = date.toISOString().slice(0, 10)
        return blocked.has(iso) ? 'day-blocked' : 'day-free'
      }}
    />
  )
}
