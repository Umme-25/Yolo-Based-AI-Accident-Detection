// Pure helpers for the Incidents module: constants, workflow rules, validation, filtering, sorting.
//
// Incident record shape (all values in the seed data are illustrative, NOT real AI output):
// {
//   id: 'INC-0001',
//   locationId: 'LOC-001',            // links to a configured location (may no longer exist)
//   cameraId: 'CAM-01',
//   eventType: 'possible_collision',  // see EVENT_TYPES
//   severity: 'high',                 // 'low' | 'medium' | 'high' | 'critical'  (separate classification)
//   accidentProbability: 0.91,        // 0..1 or null (separate from confidence and severity)
//   detectionConfidence: 0.87,        // 0..1 or null
//   status: 'pending_review',         // see STATUSES
//   timestamp: '2026-10-23T15:30:00.000Z',
//   latitude: null, longitude: null,  // optional incident coordinates
//   evidenceImageUrl: null,           // optional http(s) URL
//   evidenceVideoUrl: null,
//   description: '...',
//   isDemo: true,                     // seeded sample record
//   activity: [{ id, type: 'created'|'status_change'|'note', at, from?, to?, note?, author }]
// }
// Severity is never computed from probability or confidence.

export const SEVERITIES = ['low', 'medium', 'high', 'critical'];
export const SEVERITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
export const SEVERITY_RANK = { low: 1, medium: 2, high: 3, critical: 4 };

export const STATUSES = ['pending_review', 'acknowledged', 'under_review', 'resolved'];
export const STATUS_LABEL = { pending_review: 'Pending Review', acknowledged: 'Acknowledged', under_review: 'Under Review', resolved: 'Resolved' };
export const STATUS_RANK = { pending_review: 1, acknowledged: 2, under_review: 3, resolved: 4 };

export const EVENT_TYPES = {
  possible_collision: 'Possible collision',
  vehicle_stopped: 'Stopped vehicle',
  road_blockage: 'Road blockage',
  fire_or_smoke: 'Fire or smoke',
  pedestrian_on_road: 'Person on road',
};
export const eventTypeLabel = (type) => EVENT_TYPES[type]
  ?? String(type).replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

export const NOTE_MAX = 500;
export const ACTOR = 'You (demo)';

// ---------- Workflow ----------
const TRANSITIONS = {
  pending_review: ['acknowledged', 'under_review'],
  acknowledged: ['under_review', 'resolved'],
  under_review: ['resolved'],
  resolved: ['under_review'], // reopen
};
export const canTransition = (from, to) => (TRANSITIONS[from] ?? []).includes(to);

// Buttons available for a status. confirm: ask first. noteRequired: a reason must be given.
export function actionsFor(status) {
  return (TRANSITIONS[status] ?? []).map((to) => {
    if (to === 'resolved') return { to, label: 'Mark resolved', variant: 'primary', confirm: true, noteRequired: false };
    if (status === 'resolved') return { to, label: 'Reopen for review', variant: 'ghost', confirm: true, noteRequired: true };
    if (to === 'acknowledged') return { to, label: 'Acknowledge', variant: 'primary', confirm: false, noteRequired: false };
    return { to, label: 'Start review', variant: 'ghost', confirm: false, noteRequired: false };
  });
}

export function validateNote(text, { required = false } = {}) {
  const note = String(text ?? '').trim();
  if (!note) return required ? 'A note is required.' : null;
  if (note.length > NOTE_MAX) return `Notes must be ${NOTE_MAX} characters or fewer.`;
  return null;
}

// ---------- Records ----------
const isProb = (v) => v === null || (typeof v === 'number' && v >= 0 && v <= 1);

export function isIncidentRecord(r) {
  return Boolean(r) && typeof r === 'object'
    && typeof r.id === 'string' && typeof r.locationId === 'string' && typeof r.cameraId === 'string'
    && typeof r.eventType === 'string'
    && SEVERITIES.includes(r.severity) && STATUSES.includes(r.status)
    && typeof r.timestamp === 'string' && !Number.isNaN(Date.parse(r.timestamp))
    && isProb(r.accidentProbability ?? null) && isProb(r.detectionConfidence ?? null);
}

// Fills optional fields so the UI can rely on them.
export function normalizeIncident(r) {
  return {
    latitude: null, longitude: null, evidenceImageUrl: null, evidenceVideoUrl: null, description: '', isDemo: false,
    accidentProbability: null, detectionConfidence: null,
    ...r,
    activity: Array.isArray(r.activity) ? r.activity.filter((a) => a && typeof a.at === 'string') : [],
  };
}

export const hasCoordinates = (i) => Number.isFinite(i.latitude) && Number.isFinite(i.longitude)
  && Math.abs(i.latitude) <= 90 && Math.abs(i.longitude) <= 180;

// Only plain http(s) URLs are ever used as evidence sources.
export function isSafeEvidenceUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  try {
    const u = new URL(url.trim());
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getResolvedAt(incident) {
  if (incident.status !== 'resolved') return null;
  const entries = incident.activity.filter((a) => a.type === 'status_change' && a.to === 'resolved');
  return entries.length ? entries[entries.length - 1].at : null;
}

// ---------- Filtering ----------
export const DATE_PRESETS = [
  { value: 'all', label: 'Any time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
];
const PRESET_MS = { '24h': 864e5, '7d': 7 * 864e5, '30d': 30 * 864e5 };

export const DEFAULT_FILTERS = { query: '', severity: 'all', status: 'all', dateRange: 'all', from: '', to: '', locationId: 'all', eventType: 'all' };

export const isInvalidDateRange = (f) => f.dateRange === 'custom' && Boolean(f.from) && Boolean(f.to) && f.from > f.to;

export function matchesDateRange(iso, f, now = Date.now()) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  if (f.dateRange === 'all') return true;
  if (PRESET_MS[f.dateRange]) return t >= now - PRESET_MS[f.dateRange] && t <= now + 6e4;
  if (f.dateRange === 'custom') {
    if (isInvalidDateRange(f)) return false;
    if (f.from && t < new Date(`${f.from}T00:00:00`).getTime()) return false;
    if (f.to && t > new Date(`${f.to}T23:59:59.999`).getTime()) return false;
  }
  return true;
}

const locationName = (i, byId) => byId.get(i.locationId)?.name ?? '';

export function filterIncidents(incidents, filters, locationById = new Map(), now = Date.now()) {
  const q = filters.query.trim().toLowerCase();
  return incidents.filter((i) => {
    if (filters.severity !== 'all' && i.severity !== filters.severity) return false;
    if (filters.status !== 'all' && i.status !== filters.status) return false;
    if (filters.locationId !== 'all' && i.locationId !== filters.locationId) return false;
    if (filters.eventType !== 'all' && i.eventType !== filters.eventType) return false;
    if (!matchesDateRange(i.timestamp, filters, now)) return false;
    if (!q) return true;
    return `${i.id} ${locationName(i, locationById)} ${i.locationId} ${i.cameraId}`.toLowerCase().includes(q);
  });
}

// Human-readable list of active filters, each with the patch that clears it.
export function activeFilterList(f, locationById = new Map()) {
  const out = [];
  if (f.query.trim()) out.push({ key: 'query', label: `Search: “${f.query.trim()}”`, clear: { query: '' } });
  if (f.severity !== 'all') out.push({ key: 'severity', label: `Severity: ${SEVERITY_LABEL[f.severity]}`, clear: { severity: 'all' } });
  if (f.status !== 'all') out.push({ key: 'status', label: `Status: ${STATUS_LABEL[f.status]}`, clear: { status: 'all' } });
  if (f.locationId !== 'all') out.push({ key: 'locationId', label: `Location: ${locationById.get(f.locationId)?.name ?? f.locationId}`, clear: { locationId: 'all' } });
  if (f.eventType !== 'all') out.push({ key: 'eventType', label: `Event: ${eventTypeLabel(f.eventType)}`, clear: { eventType: 'all' } });
  if (f.dateRange !== 'all') {
    const preset = DATE_PRESETS.find((p) => p.value === f.dateRange)?.label;
    const label = f.dateRange === 'custom' ? `Dates: ${f.from || '…'} to ${f.to || '…'}` : `Date: ${preset}`;
    out.push({ key: 'dateRange', label, clear: { dateRange: 'all', from: '', to: '' } });
  }
  return out;
}

// ---------- Sorting ----------
export const DEFAULT_SORT_DIR = { time: 'desc', resolved: 'desc', severity: 'desc', probability: 'desc', status: 'asc', id: 'asc', location: 'asc' };

export function sortIncidents(list, key, dir, locationById = new Map()) {
  const sign = dir === 'asc' ? 1 : -1;
  const value = (i) => {
    switch (key) {
      case 'severity': return SEVERITY_RANK[i.severity];
      case 'status': return STATUS_RANK[i.status];
      case 'probability': return i.accidentProbability ?? -1;
      case 'location': return (locationName(i, locationById) || i.locationId).toLowerCase();
      case 'resolved': return Date.parse(getResolvedAt(i) ?? '') || 0;
      case 'id': return i.id;
      default: return Date.parse(i.timestamp);
    }
  };
  return [...list].sort((a, b) => {
    const va = value(a); const vb = value(b);
    if (va < vb) return -1 * sign;
    if (va > vb) return 1 * sign;
    return Date.parse(b.timestamp) - Date.parse(a.timestamp) || a.id.localeCompare(b.id);
  });
}

// ---------- Stats (always derived from the data) ----------
export function computeIncidentStats(incidents) {
  const unresolved = (i) => i.status !== 'resolved';
  return {
    total: incidents.length,
    critical: incidents.filter((i) => i.severity === 'critical').length,
    criticalOpen: incidents.filter((i) => i.severity === 'critical' && unresolved(i)).length,
    high: incidents.filter((i) => i.severity === 'high').length,
    highOpen: incidents.filter((i) => i.severity === 'high' && unresolved(i)).length,
    pendingReview: incidents.filter((i) => i.status === 'pending_review').length,
    unresolved: incidents.filter(unresolved).length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
  };
}

// ---------- Formatting ----------
export function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
export function formatRelative(iso, now = Date.now()) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const mins = Math.round((now - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
}
export const formatRatio = (v) => (typeof v === 'number' ? `${Math.round(v * 100)}%` : '—');
