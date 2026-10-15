/**
 * Accessible error banner with retry capability.
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" className="error-banner">
      <p className="error-message">{message || 'An error occurred while loading data.'}</p>
      {onRetry && (
        <button
          type="button"
          aria-label="Retry"
          className="btn-retry"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  )
}
