import { useCallback, useEffect, useState } from 'react';
import {
  createLocation, deleteLocation, listLocations, resetDemoLocations, updateLocation,
} from '../services/locationsService.js';

// Location state for the UI. Talks only to locationsService, so swapping the storage for a real
// API later does not touch this hook's consumers.
// status: 'loading' | 'ready' | 'error'. add/update/remove reject on failure
// (a ValidationError carries .fieldErrors) so forms can show the problem.
export default function useLocations() {
  const [locations, setLocations] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      setLocations(await listLocations());
      setStatus('ready');
    } catch (err) {
      setError(err?.message || 'Could not load locations.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listLocations()
      .then((list) => { if (!cancelled) { setLocations(list); setStatus('ready'); } })
      .catch((err) => { if (!cancelled) { setError(err?.message || 'Could not load locations.'); setStatus('error'); } });
    return () => { cancelled = true; };
  }, []);

  const add = useCallback(async (input) => {
    const created = await createLocation(input);
    setLocations((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id, input) => {
    const saved = await updateLocation(id, input);
    setLocations((prev) => prev.map((l) => (l.id === id ? saved : l)));
    return saved;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteLocation(id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const resetDemo = useCallback(async () => {
    setLocations(await resetDemoLocations());
  }, []);

  return { locations, status, error, reload: load, add, update, remove, resetDemo };
}
