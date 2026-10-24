import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Archive, Info } from 'lucide-react';
import useIncidents from '../hooks/useIncidents.js';
import useIncidentView from '../hooks/useIncidentView.js';
import useLocations from '../hooks/useLocations.js';
import { computeIncidentStats } from '../utils/incidentUtils.js';
import IncidentFilters from '../components/incidents/IncidentFilters.jsx';
import IncidentTable from '../components/incidents/IncidentTable.jsx';
import IncidentDrawerHost from '../components/incidents/IncidentDrawerHost.jsx';
import '../locations.css';
import '../incidents.css';

const BASE_PATH = '/history';
const COLUMNS = ['incident', 'severity', 'location', 'time', 'resolved'];
const DEFAULT_SORT = { key: 'resolved', dir: 'desc' };
const isResolved = (i) => i.status === 'resolved'; // stable reference for the view hook

// History = closed (Resolved) incident records. Reopening one returns it to the Incidents page.
export default function History() {
  const { incidents, status, error, reload, changeStatus, addNote } = useIncidents();
  const { locations } = useLocations();
  const locationById = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);
  const view = useIncidentView({ incidents, locationById, baseFilter: isResolved, defaultSort: DEFAULT_SORT });
  const { id: selectedId } = useParams();
  const [, navigate] = useLocation();

  const stats = useMemo(() => computeIncidentStats(incidents), [incidents]);
  const open = (id) => navigate(`${BASE_PATH}/${encodeURIComponent(id)}`);
  const close = () => navigate(BASE_PATH);

  return (
    <div className="dash">
      <div className="d-header">
        <div className="d-header-copy">
          <h1>Incident History</h1>
          <p>Resolved incident records. Filter by date, severity, location or event type.</p>
        </div>
      </div>

      <div className="dash-body">
        <div className="loc-notice">
          <Info size={18} />
          <p><strong>Demo data.</strong> History shows resolved sample incidents, not real events. Reopening an incident moves it back to the <Link href="/reports" className="inc-link">Incidents page</Link>.</p>
        </div>

        {status === 'loading' && <div className="loc-panel loc-state" role="status"><strong>Loading history…</strong></div>}
        {status === 'error' && (
          <div className="loc-panel loc-state" role="alert">
            <strong>Could not load history</strong><p>{error}</p>
            <button type="button" className="d-btn d-btn-primary" onClick={reload}>Try again</button>
          </div>
        )}
        {status === 'ready' && (
          <section className="loc-panel" aria-label="Resolved incidents">
            <header className="d-panel-head">
              <div><h2>Resolved Incidents</h2><p>{stats.resolved} closed record{stats.resolved === 1 ? '' : 's'}</p></div>
              <span className="d-tag">Demo data</span>
            </header>
            <IncidentFilters
              filters={view.filters} onChange={view.patch} onReset={view.reset} chips={view.chips}
              locations={locations} options={{ showStatus: false, showLocation: true, showEventType: true }}
              resultCount={view.visible.length} totalCount={view.base.length}
            />
            {view.base.length === 0 ? (
              <div className="loc-empty">
                <Archive size={36} strokeWidth={1.5} className="ic-cyan" />
                <strong>No resolved incidents yet</strong>
                <p>Incidents appear here after they are marked as resolved.</p>
                <Link href="/reports" className="d-btn d-btn-ghost">Go to Incidents</Link>
              </div>
            ) : view.visible.length === 0 ? (
              <div className="loc-empty">
                <strong>No records match</strong>
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
    </div>
  );
}
