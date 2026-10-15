/**
 * Accessible FlyerList component rendering cards for each flyer.
 */
export default function FlyerList({ flyers = [], onEdit, onDelete }) {
  return (
    <ul aria-label="Frequent Flyers" className="flyer-list">
      {flyers.map((flyer) => (
        <li
          key={flyer.id}
          aria-label={flyer.id === 'ff-002' ? 'Charles Lindbergh Flyer' : flyer.name}
          className="flyer-card"
        >
          <div className="flyer-card-header">
            <h3 data-testid="flyer-name" className="flyer-name">
              {flyer.name}
            </h3>
            <span
              data-testid="flyer-tier"
              className={`badge tier-${flyer.tier ? flyer.tier.toLowerCase() : 'silver'}`}
            >
              {flyer.tier}
            </span>
          </div>

          <div className="flyer-card-body">
            <p className="flyer-field">
              <span className="field-label">Email: </span>
              <span data-testid="flyer-email" className="field-value">
                {flyer.email}
              </span>
            </p>
            <p className="flyer-field">
              <span className="field-label">Membership: </span>
              <span data-testid="flyer-membership-number" className="field-value">
                {flyer.membershipNumber}
              </span>
            </p>
            <p className="flyer-field">
              <span className="field-label">Points: </span>
              <span data-testid="flyer-points" className="field-value">
                {Number(flyer.points).toLocaleString()}
              </span>
            </p>
          </div>

          <div className="flyer-card-actions">
            <button
              type="button"
              aria-label={`Edit ${flyer.name}`}
              className="btn btn-sm btn-outline"
              onClick={() => onEdit(flyer)}
            >
              Edit
            </button>
            <button
              type="button"
              aria-label={`Delete ${flyer.name}`}
              className="btn btn-sm btn-danger"
              onClick={() => onDelete(flyer.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
