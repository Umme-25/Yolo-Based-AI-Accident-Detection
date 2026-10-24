import { Search, X } from 'lucide-react';
import { CAMERA_STATUSES, CAMERA_STATUS_LABEL, LOCATION_TYPES } from '../../utils/locationUtils.js';

export default function LocationFilters({ filters, onChange, onClear, resultCount, totalCount }) {
  const active = filters.query || filters.status !== 'all' || filters.type !== 'all';
  return (
    <div className="loc-filters">
      <label className="loc-search">
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder="Search by location name or ID"
          aria-label="Search locations by name or ID"
        />
      </label>
      <div className="loc-filter-row">
        <select value={filters.status} onChange={(e) => onChange({ status: e.target.value })} aria-label="Filter by camera status">
          <option value="all">All camera statuses</option>
          {CAMERA_STATUSES.map((s) => <option key={s} value={s}>{CAMERA_STATUS_LABEL[s]}</option>)}
        </select>
        <select value={filters.type} onChange={(e) => onChange({ type: e.target.value })} aria-label="Filter by location type">
          <option value="all">All location types</option>
          {LOCATION_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="loc-filter-meta" aria-live="polite">
        <span>Showing {resultCount} of {totalCount}</span>
        {active && <button type="button" className="loc-link-btn" onClick={onClear}><X size={14} /> Clear filters</button>}
      </div>
    </div>
  );
}
