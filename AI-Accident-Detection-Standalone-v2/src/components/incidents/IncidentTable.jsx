import { ArrowDown, ArrowUp, ArrowUpDown, MapPinOff } from 'lucide-react';
import { SeverityBadge, StatusBadge, DemoTag } from './IncidentBadges.jsx';
import { eventTypeLabel, formatDateTime, formatRatio, formatRelative, getResolvedAt } from '../../utils/incidentUtils.js';

const COLUMNS = {
  incident: { label: 'Incident', sort: 'id' },
  severity: { label: 'Severity', sort: 'severity' },
  status: { label: 'Review status', sort: 'status' },
  location: { label: 'Location / camera', sort: 'location' },
  time: { label: 'Occurred', sort: 'time' },
  resolved: { label: 'Resolved', sort: 'resolved' },
  probability: { label: 'Probability (demo)', sort: 'probability' },
};

function Cell({ column, incident, location }) {
  switch (column) {
    case 'incident':
      return (
        <>
          <button type="button" className="inc-id-btn" aria-label={`Open details for ${incident.id}`}>{incident.id}</button>
          <span className="inc-sub">{eventTypeLabel(incident.eventType)}</span>
          {incident.isDemo && <DemoTag />}
        </>
      );
    case 'severity': return <SeverityBadge severity={incident.severity} />;
    case 'status': return <StatusBadge status={incident.status} />;
    case 'location':
      return (
        <>
          {location
            ? <strong className="inc-loc">{location.name}</strong>
            : <span className="inc-missing"><MapPinOff size={13} aria-hidden="true" /> Unknown location ({incident.locationId})</span>}
          <span className="inc-sub">{incident.cameraId}</span>
        </>
      );
    case 'time':
      return (<><span>{formatDateTime(incident.timestamp)}</span><span className="inc-sub">{formatRelative(incident.timestamp)}</span></>);
    case 'resolved': {
      const at = getResolvedAt(incident);
      return at ? (<><span>{formatDateTime(at)}</span><span className="inc-sub">{formatRelative(at)}</span></>) : <span className="inc-sub">—</span>;
    }
    case 'probability': return <span className="inc-num">{formatRatio(incident.accidentProbability)}</span>;
    default: return null;
  }
}

// incidents: already filtered and sorted by the parent. columns: keys of COLUMNS to show.
export default function IncidentTable({ incidents, columns, locationById, sort, onSort, selectedId, onSelect }) {
  return (
    <div className="inc-table-wrap">
      <table className="inc-table">
        <thead>
          <tr>
            {columns.map((key) => {
              const col = COLUMNS[key];
              const active = sort.key === col.sort;
              const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
              return (
                <th key={key} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className={`inc-sort ${active ? 'is-active' : ''}`} onClick={() => onSort(col.sort)}>
                    {col.label} <Icon size={13} aria-hidden="true" />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id} className={incident.id === selectedId ? 'is-selected' : ''} onClick={() => onSelect(incident.id)}>
              {columns.map((key) => (
                <td key={key} data-label={COLUMNS[key].label} className={`inc-col-${key}`}>
                  <Cell column={key} incident={incident} location={locationById.get(incident.locationId)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
