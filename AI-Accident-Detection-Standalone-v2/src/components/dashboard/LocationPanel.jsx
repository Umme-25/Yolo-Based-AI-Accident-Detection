import { useState } from 'react';
import { ExternalLink, MapPin, Navigation, Satellite } from 'lucide-react';
import Panel from './Panel.jsx';

const GPS_LABEL = {
  standby: ['Standby', 'tone-warn'],
  locating: ['Locating…', 'tone-warn'],
  acquired: ['Acquired', 'tone-safe'],
  denied: ['Permission denied', 'tone-critical'],
  unavailable: ['Unavailable', 'tone-critical'],
};

// Uses the browser Geolocation API, only when the button is pressed.
// The coordinates are this device's position, not a detected accident location.
export default function LocationPanel() {
  const [status, setStatus] = useState('standby');
  const [coords, setCoords] = useState(null);

  function getLocation() {
    if (!navigator.geolocation) { setStatus('unavailable'); return; }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => { setCoords({ lat: c.latitude, lng: c.longitude }); setStatus('acquired'); },
      (err) => setStatus(err.code === 1 ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  const [label, tone] = GPS_LABEL[status];
  return (
    <Panel title="Accident Location" subtitle="GPS monitoring" aside={<Satellite size={20} className="ic-cyan" />} className="d-location">
      <div className="d-gps-box">
        <MapPin size={36} strokeWidth={1.6} className="ic-cyan" />
        <strong>GPS Location</strong>
        <small>{coords ? 'Current device coordinates' : 'Get your current coordinates'}</small>
      </div>
      <dl className="d-rows d-rows-plain">
        <div><dt>Latitude</dt><dd>{coords ? coords.lat.toFixed(5) : '--'}</dd></div>
        <div><dt>Longitude</dt><dd>{coords ? coords.lng.toFixed(5) : '--'}</dd></div>
        <div><dt>GPS Status</dt><dd className={tone}>{label}</dd></div>
      </dl>
      <p className="d-note">Shows this device's position. Accident coordinates will appear here once detection is connected.</p>
      <div className="d-stack">
        <button type="button" className="d-btn d-btn-ghost d-btn-wide" onClick={getLocation} disabled={status === 'locating'}><Navigation size={16} /> Get GPS Location</button>
        {coords ? (
          <a className="d-btn d-btn-primary d-btn-wide" href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> View Location</a>
        ) : (
          <button type="button" className="d-btn d-btn-primary d-btn-wide" disabled><ExternalLink size={16} /> View Location</button>
        )}
      </div>
    </Panel>
  );
}
