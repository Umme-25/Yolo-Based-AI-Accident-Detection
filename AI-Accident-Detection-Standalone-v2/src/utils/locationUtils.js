// Pure helpers for the Locations module: constants, validation, filtering and stats.

export const LOCATION_TYPES = ['Highway', 'Junction', 'Urban Road', 'Bridge', 'Toll Plaza', 'Other'];
export const CAMERA_STATUSES = ['online', 'offline'];
export const CAMERA_STATUS_LABEL = { online: 'Online', offline: 'Offline' };

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{1,19}$/;
const round6 = (n) => Math.round(n * 1e6) / 1e6;
const isBlank = (v) => v === null || v === undefined || String(v).trim() === '';

// Validates form-style input (strings allowed). `existing` is the current list; `editingId`
// excludes a record from duplicate checks. Returns { ok, errors, clean }.
export function validateLocation(values, existing = [], editingId = null) {
  const errors = {};
  const others = existing.filter((l) => l.id !== editingId);

  const id = String(values.id ?? '').trim();
  if (!id) errors.id = 'Location ID is required.';
  else if (!CODE_PATTERN.test(id)) errors.id = 'Use 2–20 letters, numbers, hyphens or underscores (e.g. LOC-007).';
  else if (others.some((l) => l.id.toLowerCase() === id.toLowerCase())) errors.id = `ID "${id}" is already in use.`;

  const name = String(values.name ?? '').trim();
  if (!name) errors.name = 'Location name is required.';
  else if (name.length > 80) errors.name = 'Name must be 80 characters or fewer.';

  const type = String(values.type ?? '');
  if (!LOCATION_TYPES.includes(type)) errors.type = 'Choose a location type.';

  const cameraId = String(values.cameraId ?? '').trim();
  if (!cameraId) errors.cameraId = 'Camera ID is required.';
  else if (!CODE_PATTERN.test(cameraId)) errors.cameraId = 'Use 2–20 letters, numbers, hyphens or underscores (e.g. CAM-07).';
  else if (others.some((l) => l.cameraId.toLowerCase() === cameraId.toLowerCase())) errors.cameraId = `Camera "${cameraId}" is already assigned to another location.`;

  const cameraStatus = String(values.cameraStatus ?? '');
  if (!CAMERA_STATUSES.includes(cameraStatus)) errors.cameraStatus = 'Choose a camera status.';

  const description = String(values.description ?? '').trim();
  if (description.length > 200) errors.description = 'Description must be 200 characters or fewer.';

  let latitude = null;
  if (isBlank(values.latitude)) errors.latitude = 'Latitude is required.';
  else {
    latitude = Number(String(values.latitude).trim());
    if (!Number.isFinite(latitude)) errors.latitude = 'Latitude must be a number.';
    else if (latitude < -90 || latitude > 90) errors.latitude = 'Latitude must be between -90 and 90.';
  }

  let longitude = null;
  if (isBlank(values.longitude)) errors.longitude = 'Longitude is required.';
  else {
    longitude = Number(String(values.longitude).trim());
    if (!Number.isFinite(longitude)) errors.longitude = 'Longitude must be a number.';
    else if (longitude < -180 || longitude > 180) errors.longitude = 'Longitude must be between -180 and 180.';
  }

  if (Object.keys(errors).length) return { ok: false, errors, clean: null };
  return {
    ok: true,
    errors: {},
    clean: { id, name, type, latitude: round6(latitude), longitude: round6(longitude), cameraId, cameraStatus, description },
  };
}

// Loose shape check used when reading stored data, so a corrupted entry can't crash the page.
export function isLocationRecord(r) {
  return Boolean(r) && typeof r === 'object'
    && typeof r.id === 'string' && typeof r.name === 'string' && typeof r.cameraId === 'string'
    && Number.isFinite(r.latitude) && Number.isFinite(r.longitude)
    && CAMERA_STATUSES.includes(r.cameraStatus) && typeof r.type === 'string';
}

export function nextLocationId(existing) {
  const used = new Set(existing.map((l) => l.id.toLowerCase()));
  let max = 0;
  existing.forEach((l) => {
    const m = /^LOC-(\d+)$/i.exec(l.id);
    if (m) max = Math.max(max, Number(m[1]));
  });
  let n = max + 1;
  while (used.has(`loc-${String(n).padStart(3, '0')}`)) n += 1;
  return `LOC-${String(n).padStart(3, '0')}`;
}

export function filterLocations(locations, { query = '', status = 'all', type = 'all' } = {}) {
  const q = query.trim().toLowerCase();
  return locations.filter((l) => {
    if (status !== 'all' && l.cameraStatus !== status) return false;
    if (type !== 'all' && l.type !== type) return false;
    if (!q) return true;
    return `${l.name} ${l.id} ${l.cameraId}`.toLowerCase().includes(q);
  });
}

// Returns the set of location IDs that have an active (demo) incident link.
export function getActiveIncidentLocationIds(locations, links) {
  const known = new Set(locations.map((l) => l.id));
  return new Set(links.filter((k) => k.status === 'active' && known.has(k.locationId)).map((k) => k.locationId));
}

export function computeStats(locations, activeIncidentIds) {
  const online = locations.filter((l) => l.cameraStatus === 'online').length;
  return {
    total: locations.length,
    online,
    offline: locations.length - online,
    withActiveIncidents: activeIncidentIds.size,
  };
}
