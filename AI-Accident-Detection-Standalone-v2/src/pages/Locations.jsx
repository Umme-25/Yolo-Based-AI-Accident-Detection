import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'wouter';
import { Info, Plus, RotateCcw } from 'lucide-react';
import useLocations from '../hooks/useLocations.js';
import useIncidents from '../hooks/useIncidents.js';
import { computeStats, filterLocations, getActiveIncidentLocationIds } from '../utils/locationUtils.js';
import LocationStats from '../components/locations/LocationStats.jsx';
import LocationFilters from '../components/locations/LocationFilters.jsx';
import LocationList from '../components/locations/LocationList.jsx';
import LocationMap from '../components/locations/LocationMap.jsx';
import LocationFormModal from '../components/locations/LocationFormModal.jsx';
import ConfirmDialog from '../components/locations/ConfirmDialog.jsx';
import '../locations.css';

const NO_FILTERS = { query: '', status: 'all', type: 'all' };

export default function Locations() {
  const { locations, status, error, reload, add, update, remove, resetDemo } = useLocations();
  const [filters, setFilters] = useState(NO_FILTERS);
  const { incidents } = useIncidents();
  const params = useParams();
  const [selectedId, setSelectedId] = useState(params.id ?? null);
  const [form, setForm] = useState(null); // { mode: 'add' | 'edit', location? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const mapPanelRef = useRef(null);

  // Opened from an incident (/locations/:id): select that location once the page is ready.
  useEffect(() => { if (params.id) setSelectedId(params.id); }, [params.id]);
  const missingParamId = status === 'ready' && params.id && !locations.some((l) => l.id === params.id) ? params.id : null;

  // Incidents are separate records linked by locationId; a location is just a monitoring site.
  // A location counts as having an active (demo) incident while any linked incident is unresolved.
  const incidentLinks = useMemo(
    () => incidents.map((i) => ({ incidentId: i.id, locationId: i.locationId, status: i.status === 'resolved' ? 'resolved' : 'active' })),
    [incidents],
  );
  const activeIncidentIds = useMemo(() => getActiveIncidentLocationIds(locations, incidentLinks), [locations, incidentLinks]);
  const stats = useMemo(() => computeStats(locations, activeIncidentIds), [locations, activeIncidentIds]);
  const visible = useMemo(() => filterLocations(locations, filters), [locations, filters]);
  const mapSelectedId = visible.some((l) => l.id === selectedId) ? selectedId : null;

  const patchFilters = useCallback((patch) => setFilters((f) => ({ ...f, ...patch })), []);
  const clearFilters = useCallback(() => setFilters(NO_FILTERS), []);

  function selectLocation(id) {
    setSelectedId(id);
    // On stacked (narrow) layouts the map sits below the list, so bring it into view.
    if (window.matchMedia?.('(max-width: 1099px)').matches) {
      mapPanelRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  async function saveLocation(values) {
    if (form.mode === 'edit') {
      await update(form.location.id, values);
    } else {
      const created = await add(values);
      setSelectedId(created.id);
      setFilters(NO_FILTERS); // make sure the new location is visible
    }
    setForm(null);
  }

  async function confirmDelete() {
    await remove(deleteTarget.id);
    if (selectedId === deleteTarget.id) setSelectedId(null);
    setDeleteTarget(null);
  }

  async function confirmReset() {
    await resetDemo();
    setSelectedId(null);
    setFilters(NO_FILTERS);
    setResetOpen(false);
  }

  const openAdd = () => setForm({ mode: 'add' });
  const mapEmpty = locations.length === 0
    ? { title: 'No locations to show', text: 'Add a monitoring location to place it on the map.' }
    : { title: 'No matching locations', text: 'Change or clear the filters to see markers.' };

  return (
    <div className="dash">
      <div className="d-header">
        <div className="d-header-copy">
          <h1>Locations &amp; Monitoring Zones</h1>
          <p>Configure monitoring sites and review where cameras are assigned.</p>
        </div>
        <div className="d-header-actions">
          <button type="button" className="d-btn d-btn-primary" onClick={openAdd}><Plus size={18} /> Add Location</button>
        </div>
      </div>

      <div className="dash-body">
        <div className="loc-notice">
          <Info size={18} />
          <p>
            <strong>Demo locations.</strong> Sample sites use illustrative coordinates and no cameras are installed or connected.
            Changes are saved in this browser only (localStorage), not in a shared database. Camera status is set manually.
          </p>
          <button type="button" className="d-btn d-btn-ghost loc-notice-btn" onClick={() => setResetOpen(true)}><RotateCcw size={15} /> Reset demo data</button>
        </div>

        {missingParamId && (
          <div className="loc-notice" role="status"><Info size={18} /><p><strong>Location not found.</strong> No configured location has the ID “{missingParamId}”. It may have been deleted.</p></div>
        )}

        <LocationStats stats={stats} />

        {status === 'error' ? (
          <div className="loc-panel loc-state" role="alert">
            <strong>Could not load locations</strong>
            <p>{error}</p>
            <button type="button" className="d-btn d-btn-primary" onClick={reload}>Try again</button>
          </div>
        ) : status === 'loading' ? (
          <div className="loc-panel loc-state" role="status"><strong>Loading locations…</strong></div>
        ) : (
          <div className="loc-layout">
            <section className="loc-panel" aria-label="Configured locations">
              <header className="d-panel-head">
                <div><h2>Configured Locations</h2><p>Select a location to focus it on the map</p></div>
              </header>
              <LocationFilters filters={filters} onChange={patchFilters} onClear={clearFilters} resultCount={visible.length} totalCount={locations.length} />
              <LocationList
                locations={visible}
                totalCount={locations.length}
                selectedId={mapSelectedId}
                activeIncidentIds={activeIncidentIds}
                onSelect={selectLocation}
                onEdit={(l) => setForm({ mode: 'edit', location: l })}
                onDelete={setDeleteTarget}
                onAdd={openAdd}
                onClearFilters={clearFilters}
                onRestoreDemo={resetDemo}
              />
            </section>

            <section className="loc-panel loc-map-panel" ref={mapPanelRef} aria-label="Location map">
              <header className="d-panel-head">
                <div><h2>Location Map</h2><p>OpenStreetMap · drag to pan, scroll or pinch to zoom</p></div>
                <span className="d-tag">{visible.length} marker{visible.length === 1 ? '' : 's'}</span>
              </header>
              <LocationMap
                locations={visible}
                selectedId={mapSelectedId}
                activeIncidentIds={activeIncidentIds}
                onSelect={selectLocation}
                emptyTitle={mapEmpty.title}
                emptyText={mapEmpty.text}
                onAdd={locations.length === 0 ? openAdd : undefined}
              />
            </section>
          </div>
        )}
      </div>

      {form && (
        <LocationFormModal mode={form.mode} location={form.location} locations={locations} onSubmit={saveLocation} onClose={() => setForm(null)} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete location?"
          message={`“${deleteTarget.name}” (${deleteTarget.id}) will be removed from this browser's demo data. This cannot be undone.`}
          confirmLabel="Delete location"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {resetOpen && (
        <ConfirmDialog
          title="Reset demo data?"
          message="All locations in this browser, including ones you added or edited, will be replaced with the original sample locations."
          confirmLabel="Reset demo data"
          onConfirm={confirmReset}
          onCancel={() => setResetOpen(false)}
        />
      )}
    </div>
  );
}
