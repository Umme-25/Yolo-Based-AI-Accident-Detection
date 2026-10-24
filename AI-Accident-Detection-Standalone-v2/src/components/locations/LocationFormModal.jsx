import { useState } from 'react';
import { LocateFixed } from 'lucide-react';
import Modal from './Modal.jsx';
import { CAMERA_STATUSES, CAMERA_STATUS_LABEL, LOCATION_TYPES, nextLocationId, validateLocation } from '../../utils/locationUtils.js';

function Field({ label, name, error, hint, children }) {
  return (
    <div className="loc-field">
      <label htmlFor={`loc-${name}`}>{label}</label>
      {children}
      {hint && !error && <small className="loc-hint">{hint}</small>}
      {error && <small className="loc-error" id={`loc-${name}-error`}>{error}</small>}
    </div>
  );
}

// mode: 'add' | 'edit'. `onSubmit(cleanValues)` should reject with a ValidationError or Error on failure.
export default function LocationFormModal({ mode, location, locations, onSubmit, onClose }) {
  const editing = mode === 'edit';
  const [values, setValues] = useState(() => ({
    id: location?.id ?? nextLocationId(locations),
    name: location?.name ?? '',
    type: location?.type ?? LOCATION_TYPES[0],
    latitude: location?.latitude ?? '',
    longitude: location?.longitude ?? '',
    cameraId: location?.cameraId ?? '',
    cameraStatus: location?.cameraStatus ?? 'offline',
    description: location?.description ?? '',
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gps, setGps] = useState({ state: 'idle', message: '' });

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((old) => ({ ...old, [key]: undefined }));
  };
  const inputProps = (key) => ({
    id: `loc-${key}`,
    value: values[key],
    onChange: set(key),
    'aria-invalid': errors[key] ? 'true' : undefined,
    'aria-describedby': errors[key] ? `loc-${key}-error` : undefined,
  });

  // Optional: only runs when the user clicks, and the browser asks for permission.
  function useCurrentPosition() {
    if (!navigator.geolocation) { setGps({ state: 'error', message: 'This browser does not support location access.' }); return; }
    setGps({ state: 'busy', message: 'Waiting for browser permission…' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValues((v) => ({ ...v, latitude: coords.latitude.toFixed(6), longitude: coords.longitude.toFixed(6) }));
        setErrors((old) => ({ ...old, latitude: undefined, longitude: undefined }));
        setGps({ state: 'done', message: 'Filled with this device’s current position.' });
      },
      (err) => setGps({ state: 'error', message: err.code === 1 ? 'Location permission was denied. Enter coordinates manually.' : 'Could not read the current position. Enter coordinates manually.' }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    const result = validateLocation(values, locations, editing ? location.id : null);
    if (!result.ok) {
      setErrors(result.errors);
      const firstKey = Object.keys(result.errors)[0];
      document.getElementById(`loc-${firstKey}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(result.clean);
    } catch (err) {
      if (err?.fieldErrors) setErrors(err.fieldErrors);
      else setFormError(err?.message || 'Could not save this location.');
      setSubmitting(false);
    }
  }

  return (
    <Modal title={editing ? 'Edit location' : 'Add location'} titleId="loc-form-title" onClose={submitting ? () => {} : onClose}>
      <form onSubmit={submit} noValidate>
        <div className="loc-modal-body">
          <p className="loc-form-note">
            {editing ? 'Update this monitoring location.' : 'Configure a monitoring site.'} Saved in this browser only (demo). Adding a location does not connect a camera.
          </p>
          {formError && <div className="loc-form-error" role="alert">{formError}</div>}
          <div className="loc-form-grid">
            <Field label="Location ID *" name="id" error={errors.id} hint={editing ? 'The ID cannot be changed.' : null}>
              <input {...inputProps('id')} readOnly={editing} autoComplete="off" data-autofocus={editing ? undefined : true} />
            </Field>
            <Field label="Location name *" name="name" error={errors.name}>
              <input {...inputProps('name')} placeholder="e.g. Demo Junction Zone B" autoComplete="off" data-autofocus={editing ? true : undefined} />
            </Field>
            <Field label="Location type *" name="type" error={errors.type}>
              <select {...inputProps('type')}>{LOCATION_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </Field>
            <Field label="Camera ID *" name="cameraId" error={errors.cameraId}>
              <input {...inputProps('cameraId')} placeholder="e.g. CAM-07" autoComplete="off" />
            </Field>
            <Field label="Latitude *" name="latitude" error={errors.latitude} hint="-90 to 90">
              <input {...inputProps('latitude')} inputMode="decimal" placeholder="26.7606" autoComplete="off" />
            </Field>
            <Field label="Longitude *" name="longitude" error={errors.longitude} hint="-180 to 180">
              <input {...inputProps('longitude')} inputMode="decimal" placeholder="83.3732" autoComplete="off" />
            </Field>
            <Field label="Camera status *" name="cameraStatus" error={errors.cameraStatus} hint="Set manually. No live camera check is performed.">
              <select {...inputProps('cameraStatus')}>{CAMERA_STATUSES.map((s) => <option key={s} value={s}>{CAMERA_STATUS_LABEL[s]}</option>)}</select>
            </Field>
            <div className="loc-field loc-gps">
              <span className="loc-label-fake">Coordinates helper</span>
              <button type="button" className="d-btn d-btn-ghost" onClick={useCurrentPosition} disabled={gps.state === 'busy'}><LocateFixed size={16} /> Use my current position</button>
              {gps.message && <small className={gps.state === 'error' ? 'loc-error' : 'loc-hint'} role="status">{gps.message}</small>}
            </div>
            <div className="loc-field loc-full">
              <label htmlFor="loc-description">Description</label>
              <textarea {...inputProps('description')} rows={3} placeholder="Optional notes about this monitoring site" />
              {errors.description && <small className="loc-error" id="loc-description-error">{errors.description}</small>}
            </div>
          </div>
        </div>
        <footer className="loc-modal-foot">
          <button type="button" className="d-btn d-btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="d-btn d-btn-primary" disabled={submitting}>{submitting ? 'Saving…' : editing ? 'Save changes' : 'Add location'}</button>
        </footer>
      </form>
    </Modal>
  );
}
