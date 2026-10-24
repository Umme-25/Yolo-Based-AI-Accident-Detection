import { useCallback, useMemo, useState } from 'react';
import {
  DEFAULT_FILTERS, DEFAULT_SORT_DIR, activeFilterList, filterIncidents, sortIncidents,
} from '../utils/incidentUtils.js';

// Filter + sort state shared by the Incidents and History pages.
// `baseFilter` must be a stable function (defined outside the component) or undefined.
export default function useIncidentView({ incidents, locationById, baseFilter, defaultSort }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState(defaultSort);

  const base = useMemo(() => (baseFilter ? incidents.filter(baseFilter) : incidents), [incidents, baseFilter]);
  const visible = useMemo(
    () => sortIncidents(filterIncidents(base, filters, locationById), sort.key, sort.dir, locationById),
    [base, filters, sort, locationById],
  );
  const chips = useMemo(() => activeFilterList(filters, locationById), [filters, locationById]);

  const patch = useCallback((p) => setFilters((f) => ({ ...f, ...p })), []);
  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const toggleSort = useCallback((key) => setSort((s) => (
    s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: DEFAULT_SORT_DIR[key] ?? 'asc' }
  )), []);

  return { base, visible, filters, patch, reset, chips, sort, toggleSort };
}
