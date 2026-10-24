import { Search, X } from 'lucide-react';
import {
  DATE_PRESETS, EVENT_TYPES, SEVERITIES, SEVERITY_LABEL, STATUSES, STATUS_LABEL, isInvalidDateRange,
} from '../../utils/incidentUtils.js';

// options: { showStatus, showLocation, showEventType }. `chips` is activeFilterList() output.
export default function IncidentFilters({ filters, onChange, onReset, chips, locations = [], options = {}, resultCount, totalCount }) {
  const { showStatus = true, showLocation = false, showEventType = false } = options;
  const badRange = isInvalidDateRange(filters);

  return (
    <div className="inc-filters">
      <label className="loc-search">
        <Search size={17} aria-hidden="true" />
        <input type="search" value={filters.query} onChange={(e) => onChange({ query: e.target.value })} placeholder="Search by incident ID, location name or camera ID" aria-label="Search incidents by ID, location name or camera ID" />
      </label>

      <div className="inc-filter-row">
        <select value={filters.severity} onChange={(e) => onChange({ severity: e.target.value })} aria-label="Filter by severity">
          <option value="all">All severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{SEVERITY_LABEL[s]}</option>)}
        </select>
        {showStatus && (
          <select value={filters.status} onChange={(e) => onChange({ status: e.target.value })} aria-label="Filter by review status">
            <option value="all">All review statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        )}
        {showLocation && (
          <select value={filters.locationId} onChange={(e) => onChange({ locationId: e.target.value })} aria-label="Filter by location">
            <option value="all">All locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        )}
        {showEventType && (
          <select value={filters.eventType} onChange={(e) => onChange({ eventType: e.target.value })} aria-label="Filter by event type">
            <option value="all">All event types</option>
            {Object.entries(EVENT_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        )}
        <select value={filters.dateRange} onChange={(e) => onChange({ dateRange: e.target.value, ...(e.target.value === 'custom' ? {} : { from: '', to: '' }) })} aria-label="Filter by date">
          {DATE_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {filters.dateRange === 'custom' && (
        <div className="inc-date-row">
          <label>From<input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => onChange({ from: e.target.value })} /></label>
          <label>To<input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => onChange({ to: e.target.value })} /></label>
        </div>
      )}
      {badRange && <p className="loc-error" role="alert">The end date is before the start date, so no incidents match.</p>}

      <div className="inc-filter-meta">
        <span aria-live="polite">Showing {resultCount} of {totalCount}</span>
        {chips.length > 0 && <button type="button" className="loc-link-btn" onClick={onReset}><X size={14} /> Reset filters</button>}
      </div>
      {chips.length > 0 && (
        <ul className="inc-chips" aria-label="Active filters">
          {chips.map((c) => (
            <li key={c.key}>
              <span>{c.label}</span>
              <button type="button" onClick={() => onChange(c.clear)} aria-label={`Remove filter ${c.label}`}><X size={12} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
