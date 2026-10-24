import { DEMO_LOCATIONS } from '../data/locationsDemoData.js';
import { isLocationRecord, validateLocation } from '../utils/locationUtils.js';

// Location data access. This is the ONLY file that knows where locations are stored.
//
// Today: the browser's localStorage (demo persistence only: private to this browser, not shared
// between users or devices, and not a database).
// Later: replace the function bodies with real API calls. The async signatures and the
// ValidationError contract below can stay the same, so the page and hook need no changes.

const STORAGE_KEY = 'yoloAccidentAI.demo.locations.v1';
const memoryFallback = { list: null }; // used if localStorage is unavailable (private mode, blocked)

const clone = (list) => list.map((l) => ({ ...l }));
const seed = () => clone(DEMO_LOCATIONS);

export class ValidationError extends Error {
  constructor(errors) {
    super('Location data failed validation.');
    this.name = 'ValidationError';
    this.fieldErrors = errors;
  }
}

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null; // never saved: use the demo set
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isLocationRecord);
  } catch {
    return memoryFallback.list ? clone(memoryFallback.list) : null;
  }
}

function writeStored(list) {
  memoryFallback.list = clone(list);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable or full: data lives in memory for this session only.
  }
}

const current = () => readStored() ?? seed();

export async function listLocations() {
  return current();
}

export async function createLocation(input) {
  const list = current();
  const { ok, errors, clean } = validateLocation(input, list);
  if (!ok) throw new ValidationError(errors);
  const record = { ...clean, isDemo: false };
  writeStored([...list, record]);
  return record;
}

export async function updateLocation(id, input) {
  const list = current();
  const existing = list.find((l) => l.id === id);
  if (!existing) throw new Error(`Location ${id} no longer exists.`);
  const { ok, errors, clean } = validateLocation({ ...input, id }, list, id);
  if (!ok) throw new ValidationError(errors);
  const record = { ...clean, isDemo: existing.isDemo === true };
  writeStored(list.map((l) => (l.id === id ? record : l)));
  return record;
}

export async function deleteLocation(id) {
  writeStored(current().filter((l) => l.id !== id));
}

export async function resetDemoLocations() {
  const fresh = seed();
  writeStored(fresh);
  return fresh;
}
