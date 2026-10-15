import { useState, useEffect, useRef } from 'react'
import { sanitizeInput } from '../utils/sanitize'
import { validateFlyer } from '../utils/validate'

/**
 * Accessible Modal Dialog Form for Adding/Editing Flyers.
 */
export default function FlyerForm({ initialData = null, onSave, onClose }) {
  const isEditing = Boolean(initialData?.id)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    membershipNumber: initialData?.membershipNumber || '',
    tier: initialData?.tier || 'Silver',
    points: initialData?.points !== undefined ? String(initialData.points) : '0',
  })

  const [errors, setErrors] = useState({})
  const dialogRef = useRef(null)

  // Always call the latest onClose without re-running the effects below
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  // On open: focus the first field. On close: return focus to the opener.
  useEffect(() => {
    const opener = document.activeElement
    const firstInput =
      dialogRef.current?.querySelector('input, select') ??
      dialogRef.current?.querySelector('button')
    firstInput?.focus()

    return () => {
      if (opener && opener.isConnected && typeof opener.focus === 'function') {
        opener.focus()
      }
    }
  }, [])

  // Escape closes the dialog; Tab and Shift+Tab cycle inside it (focus trap)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }

      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (!dialogRef.current.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for field if previously invalid
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    if (name === 'name' || name === 'email' || name === 'membershipNumber') {
      const sanitized = sanitizeInput(value)
      setFormData((prev) => ({
        ...prev,
        [name]: sanitized,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name.trim()),
      email: sanitizeInput(formData.email.trim()),
      membershipNumber: sanitizeInput(formData.membershipNumber.trim()),
    }

    const validation = validateFlyer(sanitizedData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    onSave({
      ...(initialData || {}),
      name: sanitizedData.name,
      email: sanitizedData.email,
      membershipNumber: sanitizedData.membershipNumber,
      tier: sanitizedData.tier,
      points: Number(sanitizedData.points),
    })
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit Flyer' : 'Add Flyer'}
        className="modal-dialog"
      >
        <div className="dialog-header">
          <h2>{isEditing ? 'Edit Flyer' : 'Add Flyer'}</h2>
          <button
            type="button"
            aria-label="Close dialog"
            className="btn-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flyer-form">
          <div className="form-group">
            <label htmlFor="flyer-name">Name</label>
            <input
              id="flyer-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'flyer-name-error' : undefined}
              className={errors.name ? 'input-error invalid border-red' : ''}
            />
            {errors.name && (
              <span id="flyer-name-error" className="error-text" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="flyer-email">Email</label>
            <input
              id="flyer-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'flyer-email-error' : undefined}
              className={errors.email ? 'input-error invalid border-red' : ''}
            />
            {errors.email && (
              <span id="flyer-email-error" className="error-text" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="flyer-membership">Membership Number</label>
            <input
              id="flyer-membership"
              name="membershipNumber"
              type="text"
              value={formData.membershipNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(errors.membershipNumber)}
              aria-describedby={
                errors.membershipNumber ? 'flyer-membership-error' : undefined
              }
              className={
                errors.membershipNumber ? 'input-error invalid border-red' : ''
              }
            />
            {errors.membershipNumber && (
              <span
                id="flyer-membership-error"
                className="error-text"
                role="alert"
              >
                {errors.membershipNumber}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="flyer-tier">Tier</label>
            <select
              id="flyer-tier"
              name="tier"
              value={formData.tier}
              onChange={handleChange}
              aria-label="Tier"
            >
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="flyer-points">Points</label>
            <input
              id="flyer-points"
              name="points"
              type="number"
              value={formData.points}
              onChange={handleChange}
              aria-invalid={Boolean(errors.points)}
              aria-describedby={errors.points ? 'flyer-points-error' : undefined}
              className={errors.points ? 'input-error invalid border-red' : ''}
            />
            {errors.points && (
              <span id="flyer-points-error" className="error-text" role="alert">
                {errors.points}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              aria-label="Cancel"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              aria-label={isEditing ? 'Save Flyer' : 'Submit Flyer'}
              className="btn btn-primary"
            >
              {isEditing ? 'Save' : 'Save Flyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
