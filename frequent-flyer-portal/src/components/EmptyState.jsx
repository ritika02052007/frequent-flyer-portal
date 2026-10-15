/**
 * Empty state component showing fallback message.
 */
export default function EmptyState({ message = 'No data found' }) {
  return (
    <div className="empty-state-wrapper" data-testid="empty-state">
      <p className="empty-state-message">{message}</p>
    </div>
  )
}
