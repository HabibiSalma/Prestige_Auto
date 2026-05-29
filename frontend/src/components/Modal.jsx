/**
 * Modal — single, reusable, portal-based modal for the whole app.
 *
 * Why a portal?
 *   Bootstrap modals only behave correctly when they live OUTSIDE the
 *   regular DOM flow. If a modal renders deep inside a page (which is
 *   what happens when you put <div className="modal"> straight in JSX),
 *   any ancestor with `transform`, `filter`, or `overflow: hidden` can
 *   trap `position: fixed` children inside its own box — that's how the
 *   "modal cut off by the footer" bug appears.
 *
 *   createPortal renders our markup straight into document.body, so it
 *   is always positioned relative to the viewport, above EVERY page
 *   element regardless of layout.
 *
 * What it gives us:
 *   - viewport-sized backdrop that covers navbar + footer,
 *   - centred dialog with a max-height of (viewport − margin),
 *   - the body scrolls INTERNALLY when the form is taller than the screen,
 *   - background page is scroll-locked while the modal is open,
 *   - closes on ESC and on backdrop click,
 *   - sizes:  sm | md | lg | xl  (defaults to md).
 *
 * Usage:
 *   <Modal open={open} onClose={closeFn} title="My title" size="lg"
 *          footer={<button className="btn ...">Save</button>}>
 *     ...content...
 *   </Modal>
 */
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  // When true the click on the dark backdrop closes the modal.
  // Set to false for forms where an accidental click would lose data.
  closeOnBackdrop = true,
}) {
  /* ----------------------------------------------------------------------
   * Effect: while the modal is open, lock the page scroll and listen for
   * the ESC key. We clean both up on unmount so the page never gets
   * stuck with overflow: hidden.
   * -------------------------------------------------------------------- */
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  /* ----------------------------------------------------------------------
   * Markup — rendered straight into <body> via createPortal.
   * -------------------------------------------------------------------- */
  return createPortal(
    <div
      className="prestige-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        // mouseDown (not click) so we don't close when the user starts a
        // selection inside the dialog and releases outside.
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className={`prestige-modal-dialog prestige-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Boîte de dialogue'}
      >
        <div className="prestige-modal-content">

          {/* Header — optional but recommended for accessibility. */}
          {title && (
            <div className="prestige-modal-header">
              <h5 className="fw-bold mb-0">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Fermer"
                onClick={onClose}
              />
            </div>
          )}

          {/* Body — this is the area that gets a scrollbar when too tall. */}
          <div className="prestige-modal-body">
            {children}
          </div>

          {/* Footer — optional. Pass action buttons here so they stay
              pinned to the bottom even when the body scrolls. */}
          {footer && (
            <div className="prestige-modal-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
