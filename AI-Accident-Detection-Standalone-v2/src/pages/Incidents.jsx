import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Info, RotateCcw } from 'lucide-react';
import useIncidents from '../hooks/useIncidents.js';
import useIncidentView from '../hooks/useIncidentView.js';
import useLocations from '../hooks/useLocations.js';
import { computeIncidentStats } from '../utils/incidentUtils.js';
import IncidentStats from '../components/incidents/IncidentStats.jsx';
import IncidentFilters from '../components/incidents/IncidentFilters.jsx';
import IncidentTable from '../components/incidents/IncidentTable.jsx';
import IncidentDrawerHost from '../components/incidents/IncidentDrawerHost.jsx';
import ConfirmDialog from '../components/locations/ConfirmDialog.jsx';
import '../locations.css';
import '../incidents.css';

const BASE_PATH = '/reports'; // existing route kept for backward compatibility; sidebar label is "Incidents"
const COLUMNS = ['incident', 'severity', 'status', 'location', 'time', 'probability'];
const DEFAULT_SORT = { key: 'time', dir: 'desc' };

export default function Incidents() {
  const { incidents, status, error, reload, changeStatus, addNote, resetDemo } = useIncidents();
  const { locations } = useLocations();
  const locationById = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);
  const view = useIncidentView({ incidents, locationById, defaultSort: DEFAULT_SORT });
  const { id: selectedId } = useParams();
  const [, navigate] = useLocation();
  const [resetOpen, setResetOpen] = useState(false);

  const stats = useMemo(() => computeIncidentStats(incidents), [incidents]);
  const open = (id) => navigate(`${BASE_PATH}/${encodeURIComponent(id)}`);
  const close = () => navigate(BASE_PATH);

  async function confirmReset() {
    await resetDemo();
    view.reset();
    setResetOpen(false);
    if (selectedId) close();
  }

  return (
    <div className="dash">
      <div className="d-header">
        <div className="d-header-copy">
          <h1>Incidents &amp; Event History</h1>
          <p>Review incident records, assess severity and track review status.</p>
        </div>
      </div>

      <div className="dash-body">
        <div className="loc-notice">
          <Info size={18} />
          <p>
            <strong>Demo data.</strong> These are sample incidents, not AI detections, and no live events are being received.
            Review actions only change this demo record in your browser (localStorage). Nobody is notified and no authority is contacted.
          </p>
          <button type="button" className="d-btn d-btn-ghost loc-notice-btn" onClick={() => setResetOpen(true)}><RotateCcw size={15} /> Reset demo data</button>
        </div>

        <IncidentStats stats={stats} />

        {status === 'loading' && <div className="loc-panel loc-state" role="status"><strong>Loading incidents…</strong></div>}
        {status === 'error' && (
          <div className="loc-panel loc-state" role="alert">
            <strong>Could not load incidents</strong><p>{error}</p>
            <button type="button" className="d-btn d-btn-primary" onClick={reload}>Try again</button>
          </div>
        )}
        {status === 'ready' && (
          <section className="loc-panel" aria-label="Incident list">
            <header className="d-panel-head">
              <div><h2>Incident Records</h2><p>Select an incident to review details</p></div>
              <span className="d-tag">Demo data</span>
            </header>
            <IncidentFilters
              filters={view.filters} onChange={view.patch} onReset={view.reset} chips={view.chips}
              options={{ showStatus: true }} resultCount={view.visible.length} totalCount={incidents.length}
            />
            {incidents.length === 0 ? (
              <div className="loc-empty">
                <strong>No incidents recorded</strong>
                <p>Incidents will appear here once a detection source provides them.</p>
                <button type="button" className="d-btn d-btn-ghost" onClick={resetDemo}><RotateCcw size={16} /> Restore demo incidents</button>
              </div>
            ) : view.visible.length === 0 ? (
              <div className="loc-empty">
                <strong>No incidents match</strong>
                <p>Try different search terms or reset the filters.</p>
                <button type="button" className="d-btn d-btn-ghost" onClick={view.reset}>Reset filters</button>
              </div>
            ) : (
              <IncidentTable incidents={view.visible} columns={COLUMNS} locationById={locationById} sort={view.sort} onSort={view.toggleSort} selectedId={selectedId} onSelect={open} />
            )}
          </section>
        )}
      </div>

      {status === 'ready' && (
        <IncidentDrawerHost selectedId={selectedId} incidents={incidents} locationById={locationById} onClose={close} onChangeStatus={changeStatus} onAddNote={addNote} />
      )}
      {resetOpen && (
        <ConfirmDialog
          title="Reset demo data?"
          message="All incidents, review notes and status changes in this browser will be replaced with the original sample incidents."
          confirmLabel="Reset demo data"
          onConfirm={confirmReset}
          onCancel={() => setResetOpen(false)}
        />
      )}
    </div>
  );
}
