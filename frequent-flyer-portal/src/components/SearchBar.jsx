/**
 * SearchBar component for instantaneous flyer filtering and staff input.
 */
export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar-wrapper">
      <div className="search-input-group">
        <label htmlFor="search-input" className="sr-only">
          Search flyers
        </label>
        <input
          id="search-input"
          type="search"
          role="searchbox"
          aria-label="Search flyers"
          placeholder="Search flyers by name, email, or membership number..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="staff-memo-group">
        <label htmlFor="staff-memo" className="sr-only">
          Staff notes
        </label>
        <input
          id="staff-memo"
          type="text"
          aria-label="Staff notes"
          tabIndex={-1}
          placeholder="Shift notes..."
          className="staff-memo-input sr-only"
        />
      </div>
    </div>
  )
}
