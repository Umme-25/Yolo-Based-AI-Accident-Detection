import { useCallback, useEffect, useState } from 'react';
import {
  addIncidentNote, changeIncidentStatus, listIncidents, resetDemoIncidents,
} from '../services/incidentsService.js';

// Incident state for the UI. Talks only to incidentsService, so replacing demo storage with a
// backend later does not change the pages or components that use this hook.
// status: 'loading' | 'ready' | 'error'. Mutations reject with an Error the UI can display.
export default function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      setIncidents(await listIncidents());
      setStatus('ready');
    } catch (err) {
      setError(err?.message || 'Could not load incidents.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listIncidents()
      .then((list) => { if (!cancelled) { setIncidents(list); setStatus('ready'); } })
      .catch((err) => { if (!cancelled) { setError(err?.message || 'Could not load incidents.'); setStatus('error'); } });
    return () => { cancelled = true; };
  }, []);

  const applyUpdate = (updated) => setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

  const changeStatus = useCallback(async (id, to, note) => {
    const updated = await changeIncidentStatus(id, to, note);
    applyUpdate(updated);
    return updated;
  }, []);

  const addNote = useCallback(async (id, note) => {
    const updated = await addIncidentNote(id, note);
    applyUpdate(updated);
    return updated;
  }, []);

  const resetDemo = useCallback(async () => {
    setIncidents(await resetDemoIncidents());
  }, []);

  return { incidents, status, error, reload: load, changeStatus, addNote, resetDemo };
}
