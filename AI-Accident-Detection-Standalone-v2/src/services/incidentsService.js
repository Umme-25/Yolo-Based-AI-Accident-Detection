import { createDemoIncidents } from '../data/incidentsDemoData.js';
import {
  ACTOR, STATUS_LABEL, canTransition, isIncidentRecord, normalizeIncident, validateNote,
} from '../utils/incidentUtils.js';

// Incident data access. This is the ONLY file that knows where incidents are stored.
//
// Today: the browser's localStorage (demo persistence only, private to this browser).
// Later: replace these function bodies with real API calls. Keep the async signatures and the
// thrown Error messages' shape so the hook, pages and components need no changes.
// Nothing here receives live events or contacts any service.

const STORAGE_KEY = 'yoloAccidentAI.demo.incidents.v1';
const memoryFallback = { list: null };
const clone = (v) => JSON.parse(JSON.stringify(v));

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null; // never saved: use the demo set
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isIncidentRecord).map(normalizeIncident);
  } catch {
    return memoryFallback.list ? clone(memoryFallback.list) : null;
  }
}

function writeStored(list) {
  memoryFallback.list = clone(list);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable or full: changes last for this session only.
  }
}

const current = () => readStored() ?? createDemoIncidents().map(normalizeIncident);
const newActivityId = (incident) => `${incident.id}-a${incident.activity.length + 1}-${Date.now().toString(36)}`;

function replace(list, updated) {
  writeStored(list.map((i) => (i.id === updated.id ? updated : i)));
  return updated;
}

export async function listIncidents() {
  return current();
}

// Moves an incident to a new status (validated against the workflow) and records it in the timeline.
// This only updates the local demo record. It does not notify anyone.
export async function changeIncidentStatus(id, to, note = '') {
  const list = current();
  const incident = list.find((i) => i.id === id);
  if (!incident) throw new Error(`Incident ${id} no longer exists.`);
  if (!canTransition(incident.status, to)) {
    throw new Error(`An incident cannot move from ${STATUS_LABEL[incident.status]} to ${STATUS_LABEL[to] ?? to}.`);
  }
  const reopening = incident.status === 'resolved';
  const noteError = validateNote(note, { required: reopening });
  if (noteError) throw new Error(noteError);
  const trimmed = note.trim();
  const entry = {
    id: newActivityId(incident), type: 'status_change', at: new Date().toISOString(),
    from: incident.status, to, note: trimmed || null, author: ACTOR,
  };
  return replace(list, { ...incident, status: to, activity: [...incident.activity, entry] });
}

export async function addIncidentNote(id, note) {
  const list = current();
  const incident = list.find((i) => i.id === id);
  if (!incident) throw new Error(`Incident ${id} no longer exists.`);
  const noteError = validateNote(note, { required: true });
  if (noteError) throw new Error(noteError);
  const entry = { id: newActivityId(incident), type: 'note', at: new Date().toISOString(), note: note.trim(), author: ACTOR };
  return replace(list, { ...incident, activity: [...incident.activity, entry] });
}

export async function resetDemoIncidents() {
  const fresh = createDemoIncidents().map(normalizeIncident);
  writeStored(fresh);
  return fresh;
}
