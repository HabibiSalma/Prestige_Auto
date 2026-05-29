/**
 * Avatar — renders either the user's uploaded photo or a gold circle
 * with the user's initials. The initial fallback matches the dark
 * mockups in the design brief.
 */
export default function Avatar({ name = '', src, size = 36 }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const style = {
    width:  size,
    height: size,
    fontSize: Math.round(size * 0.4),
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-circle object-fit-cover"
        style={style}
      />
    )
  }

  return (
    <div
      className="rounded-circle d-inline-flex justify-content-center align-items-center fw-semibold"
      style={{
        ...style,
        background: 'linear-gradient(135deg, #C9A84C, #B8860B)',
        color: '#1A1A1A',
      }}
      aria-label={name}
    >
      {initials || 'U'}
    </div>
  )
}
