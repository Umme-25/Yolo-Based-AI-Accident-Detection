import { MapPin, Pencil, Plus, RotateCcw, SearchX, Trash2, TriangleAlert, Video, VideoOff } from 'lucide-react';
import { CAMERA_STATUS_LABEL } from '../../utils/locationUtils.js';

export default function LocationList({ locations, totalCount, selectedId, activeIncidentIds, onSelect, onEdit, onDelete, onAdd, onClearFilters, onRestoreDemo }) {
  if (totalCount === 0) {
    return (
      <div className="loc-empty">
        <MapPin size={38} strokeWidth={1.5} className="ic-cyan" />
        <strong>No locations configured</strong>
        <p>Add a monitoring location to see it here and on the map.</p>
        <div className="d-btn-row loc-empty-actions">
          <button type="button" className="d-btn d-btn-primary" onClick={onAdd}><Plus size={17} /> Add Location</button>
          <button type="button" className="d-btn d-btn-ghost" onClick={onRestoreDemo}><RotateCcw size={16} /> Restore demo locations</button>
        </div>
      </div>
    );
  }
  if (locations.length === 0) {
    return (
      <div className="loc-empty">
        <SearchX size={38} strokeWidth={1.5} className="ic-cyan" />
        <strong>No locations match</strong>
        <p>Try a different search or clear the filters.</p>
        <button type="button" className="d-btn d-btn-ghost" onClick={onClearFilters}>Clear filters</button>
      </div>
    );
  }
  return (
    <ul className="loc-list">
      {locations.map((l) => {
        const selected = l.id === selectedId;
        const online = l.cameraStatus === 'online';
        return (
          <li key={l.id} className={`loc-item ${selected ? 'is-selected' : ''}`}>
            <button type="button" className="loc-item-main" onClick={() => onSelect(l.id)} aria-pressed={selected} aria-label={`Select ${l.name} on the map`}>
              <span className="loc-item-top">
                <strong>{l.name}</strong>
                <span className={`loc-badge ${online ? 'is-online' : 'is-offline'}`}>
                  {online ? <Video size={13} /> : <VideoOff size={13} />} {CAMERA_STATUS_LABEL[l.cameraStatus]}
                </span>
              </span>
              <span className="loc-item-meta">
                <span>{l.id}</span><span>{l.type}</span><span>{l.cameraId}</span>
              </span>
              <span className="loc-item-coords">{l.latitude.toFixed(4)}, {l.longitude.toFixed(4)}</span>
              {l.description && <span className="loc-item-desc">{l.description}</span>}
              <span className="loc-item-tags">
                <span className="d-tag">{l.isDemo ? 'Demo location' : 'Added locally'}</span>
                {activeIncidentIds.has(l.id) && <span className="d-tag loc-tag-incident"><TriangleAlert size={12} /> Active incident (demo)</span>}
              </span>
            </button>
            <div className="loc-item-actions">
              <button type="button" className="d-icon-btn loc-act" onClick={() => onEdit(l)} aria-label={`Edit ${l.name}`}><Pencil size={16} /></button>
              <button type="button" className="d-icon-btn loc-act loc-act-danger" onClick={() => onDelete(l)} aria-label={`Delete ${l.name}`}><Trash2 size={16} /></button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
