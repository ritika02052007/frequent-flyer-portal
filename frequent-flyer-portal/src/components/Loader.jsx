/**
 * Accessible loading indicator.
 */
export default function Loader({ message = 'Loading...' }) {
  return (
    <div
      role="status"
      aria-label="Loading flyers"
      aria-live="polite"
      data-testid="loading-indicator"
      className="loader-wrapper"
    >
      <span className="spinner" aria-hidden="true" />
      <span className="loader-text">{message}</span>
    </div>
  )
}
