import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, RefreshCw } from 'lucide-react';
import { CAMERA_STATUS_LABEL } from '../../utils/locationUtils.js';

const DEFAULT_CENTER = [22.5, 79];
const DEFAULT_ZOOM = 4;
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// divIcon avoids Leaflet's default image assets, which don't resolve under Vite bundling.
function makeIcon(location, selected, hasIncident) {
  const status = location.cameraStatus === 'online' ? 'online' : 'offline';
  const cls = `loc-pin loc-pin--${status}${selected ? ' is-selected' : ''}${hasIncident ? ' has-incident' : ''}`;
  return L.divIcon({ className: 'loc-marker', html: `<span class="${cls}"></span>`, iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -16] });
}

// Popup content is built with DOM nodes and textContent, so user-entered text is never parsed as HTML.
function buildPopup(location, hasIncident) {
  const root = document.createElement('div');
  root.className = 'loc-popup';
  const add = (tag, text, cls) => { const el = document.createElement(tag); el.textContent = text; if (cls) el.className = cls; root.appendChild(el); };
  add('strong', location.name);
  add('span', `ID: ${location.id}`);
  add('span', `Camera: ${location.cameraId}`);
  add('span', `Status: ${CAMERA_STATUS_LABEL[location.cameraStatus] ?? location.cameraStatus}`, `loc-popup-${location.cameraStatus === 'online' ? 'online' : 'offline'}`);
  if (hasIncident) add('span', 'Active incident (demo)', 'loc-popup-incident');
  add('em', location.isDemo ? 'Demo location. No camera installed.' : 'Added locally (demo storage).');
  return root;
}

export default function LocationMap({ locations, selectedId, activeIncidentIds, onSelect, emptyTitle, emptyText, onAdd }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const markersRef = useRef(new Map());
  const signatureRef = useRef('');
  const onSelectRef = useRef(onSelect);
  const tileStats = useRef({ loaded: 0, failed: 0 });
  const [tileState, setTileState] = useState('loading'); // 'loading' | 'ready' | 'error'

  onSelectRef.current = onSelect;

  // Create the map once; remove it (and its listeners) on unmount.
  useEffect(() => {
    const container = containerRef.current;
    const map = L.map(container, { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, minZoom: 2, worldCopyJump: true });
    const tiles = L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION });
    mapRef.current = map;
    tileRef.current = tiles;

    const timeout = window.setTimeout(() => {
      if (tileStats.current.loaded === 0) setTileState('error');
    }, 12000);

    tiles.on('tileload', () => {
      tileStats.current.loaded += 1;
      setTileState('ready');
    });
    tiles.on('tileerror', () => {
      tileStats.current.failed += 1;
      if (tileStats.current.loaded === 0 && tileStats.current.failed >= 2) setTileState('error');
    });
    tiles.addTo(map);

    let observer = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(container);
    }

    const markers = markersRef.current;
    return () => {
      window.clearTimeout(timeout);
      observer?.disconnect();
      tiles.off();
      markers.clear();
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, []);

  // Keep markers in sync with the location list, incident flags and selection.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    const ids = new Set(locations.map((l) => l.id));

    markers.forEach((marker, id) => {
      if (!ids.has(id)) { marker.remove(); markers.delete(id); }
    });

    locations.forEach((l) => {
      const hasIncident = activeIncidentIds.has(l.id);
      const icon = makeIcon(l, l.id === selectedId, hasIncident);
      let marker = markers.get(l.id);
      if (!marker) {
        marker = L.marker([l.latitude, l.longitude], { icon, title: l.name, keyboard: true, riseOnHover: true });
        marker.bindPopup(buildPopup(l, hasIncident));
        marker.on('click', () => onSelectRef.current(l.id));
        marker.addTo(map);
        markers.set(l.id, marker);
      } else {
        marker.setLatLng([l.latitude, l.longitude]);
        marker.setIcon(icon);
        marker.setPopupContent(buildPopup(l, hasIncident));
      }
      marker.setZIndexOffset(l.id === selectedId ? 1000 : 0);
    });

    // Re-fit only when the set of visible locations changes.
    const signature = locations.map((l) => l.id).sort().join('|');
    if (signature !== signatureRef.current) {
      signatureRef.current = signature;
      if (locations.length === 1) {
        map.setView([locations[0].latitude, locations[0].longitude], 13, { animate: false });
      } else if (locations.length > 1) {
        map.fitBounds(L.latLngBounds(locations.map((l) => [l.latitude, l.longitude])), { padding: [40, 40], maxZoom: 15, animate: false });
      }
    }
  }, [locations, activeIncidentIds, selectedId]);

  // Focus the selected marker and open its popup.
  useEffect(() => {
    const map = mapRef.current;
    const marker = selectedId ? markersRef.current.get(selectedId) : null;
    if (!map || !marker) return;
    const target = marker.getLatLng();
    map.setView(target, Math.max(map.getZoom(), 14), { animate: !prefersReducedMotion() });
    marker.openPopup();
  }, [selectedId]);

  function retryTiles() {
    tileStats.current = { loaded: 0, failed: 0 };
    setTileState('loading');
    tileRef.current?.redraw();
    window.setTimeout(() => {
      if (tileStats.current.loaded === 0) setTileState('error');
    }, 12000);
  }

  return (
    <div className="loc-map-wrap">
      <div ref={containerRef} className="loc-map-canvas" role="region" aria-label="Map of configured monitoring locations" />
      {tileState === 'loading' && <div className="loc-map-banner" role="status">Loading map tiles…</div>}
      {tileState === 'error' && (
        <div className="loc-map-banner is-error" role="alert">
          <span>Map tiles could not be loaded. Check your internet connection. Markers are still shown.</span>
          <button type="button" className="loc-link-btn" onClick={retryTiles}><RefreshCw size={14} /> Retry</button>
        </div>
      )}
      {locations.length === 0 && (
        <div className="loc-map-empty">
          <MapPin size={34} strokeWidth={1.5} className="ic-cyan" />
          <strong>{emptyTitle}</strong>
          <p>{emptyText}</p>
          {onAdd && <button type="button" className="d-btn d-btn-primary" onClick={onAdd}><Plus size={16} /> Add Location</button>}
        </div>
      )}
    </div>
  );
}
