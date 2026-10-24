import { useState } from 'react';
import { Link } from 'wouter';
import { MapPin, MapPinOff, Send } from 'lucide-react';
import Modal from '../locations/Modal.jsx';
import { SeverityBadge, StatusBadge, DemoTag } from './IncidentBadges.jsx';
import EvidencePanel from './EvidencePanel.jsx';
import {
  NOTE_MAX, STATUS_LABEL, actionsFor, eventTypeLabel, formatDateTime, formatRatio, formatRelative, hasCoordinates, validateNote,
} from '../../utils/incidentUtils.js';

function Meter({ label, value }) {
  const pct = typeof value === 'number' ? Math.round(value * 100) : null;
  return (
    <div className="inc-meter">
      <div className="inc-meter-top"><span>{label}</span><strong>{formatRatio(value)}</strong></div>
      <div className="inc-meter-bar" role="img" aria-label={pct === null ? `${label}: not available` : `${label}: ${pct} percent`}>
        <span style={{ width: `${pct ?? 0}%` }} />
      </div>
    </div>
  );
}

function activityText(a) {
  if (a.type === 'created') return 'Incident record created';
  if (a.type === 'status_change') return `Status changed: ${STATUS_LABEL[a.from] ?? a.from} → ${STATUS_LABEL[a.to] ?? a.to}`;
  return 'Review note added';
}

// Render with key={incident.id}. onChangeStatus(id, to, note) and onAddNote(id, note) return promises.
export default function IncidentDetail({ incident, location, onClose, onChangeStatus, onAddNote }) {
  const [pending, setPending] = useState(null);   // action waiting for confirmation
  const [confirmNote, setConfirmNote] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteError, setNoteError] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tone: 'ok' | 'error', text }

  const actions = actionsFor(incident.status);
  const timeline = [...incident.activity].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  async function applyAction(action, note) {
    setBusy(true);
    setFeedback(null);
    try {
      await onChangeStatus(incident.id, action.to, note);
      setFeedback({ tone: 'ok', text: `Status changed to ${STATUS_LABEL[action.to]}.` });
      setPending(null);
      setConfirmNote('');
      setConfirmError('');
    } catch (err) {
      setFeedback({ tone: 'error', text: err?.message || 'Could not update this incident.' });
    } finally {
      setBusy(false);
    }
  }

  function startAction(action) {
    setFeedback(null);
    if (action.confirm) { setPending(action); setConfirmNote(''); setConfirmError(''); } else applyAction(action, '');
  }

  function confirmPending() {
    const error = validateNote(confirmNote, { required: pending.noteRequired });
    if (error) { setConfirmError(error); return; }
    applyAction(pending, confirmNote);
  }

  async function submitNote(e) {
    e.preventDefault();
    const error = validateNote(noteText, { required: true });
    if (error) { setNoteError(error); return; }
    setBusy(true);
    setFeedback(null);
    try {
      await onAddNote(incident.id, noteText);
      setNoteText('');
      setNoteError('');
      setFeedback({ tone: 'ok', text: 'Note added to the activity timeline.' });
    } catch (err) {
      setFeedback({ tone: 'error', text: err?.message || 'Could not add the note.' });
    } finally {
      setBusy(false);
    }
  }

  // Escape cancels an open confirmation first, then closes the panel.
  const handleClose = () => (pending ? setPending(null) : onClose());

  return (
    <Modal title={`Incident ${incident.id}`} titleId="incident-title" onClose={handleClose} size="drawer">
      <div className="inc-detail">
        <div className="inc-detail-head">
          <strong>{eventTypeLabel(incident.eventType)}</strong>
          <div className="inc-detail-badges">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            {incident.isDemo && <DemoTag />}
          </div>
          {incident.isDemo && <p className="inc-demo-note">Sample record for interface testing. It is not an AI detection, and its values are not validated model output.</p>}
        </div>

        <dl className="inc-facts">
          <div><dt>Occurred</dt><dd>{formatDateTime(incident.timestamp)} <small>({formatRelative(incident.timestamp)})</small></dd></div>
          <div><dt>Camera</dt><dd>{incident.cameraId}</dd></div>
          <div>
            <dt>Location</dt>
            <dd>
              {location ? (
                <>
                  <span>{location.name}</span>
                  <small>{location.id} · {location.type}</small>
                  <Link href={`/locations/${encodeURIComponent(location.id)}`} className="inc-link"><MapPin size={14} /> View on Locations page</Link>
                </>
              ) : (
                <span className="inc-missing"><MapPinOff size={14} /> Location not found ({incident.locationId}). It may have been removed from the Locations page.</span>
              )}
            </dd>
          </div>
          {hasCoordinates(incident) && (
            <div><dt>Coordinates</dt><dd>{incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}</dd></div>
          )}
        </dl>

        <section className="inc-section">
          <h3>Detection values{incident.isDemo ? ' (demo)' : ''}</h3>
          <Meter label="Accident probability" value={incident.accidentProbability} />
          <Meter label="Detection confidence" value={incident.detectionConfidence} />
          <p className="inc-hint">Probability, confidence and severity are separate fields. Severity is not calculated from either value.</p>
        </section>

        <section className="inc-section">
          <h3>Evidence</h3>
          <EvidencePanel key={incident.id} incident={incident} />
        </section>

        <section className="inc-section">
          <h3>Description</h3>
          <p className="inc-desc">{incident.description || 'No description provided.'}</p>
        </section>

        <section className="inc-section">
          <h3>Review</h3>
          <div aria-live="polite">
            {feedback && <div className={`inc-feedback is-${feedback.tone}`} role={feedback.tone === 'error' ? 'alert' : 'status'}>{feedback.text}</div>}
          </div>
          {pending ? (
            <div className="inc-confirm">
              <strong>{pending.to === 'resolved' ? 'Mark this incident as resolved?' : 'Reopen this incident for review?'}</strong>
              <p>{pending.to === 'resolved' ? 'It will move to History. You can reopen it later.' : 'It will return to Under Review and leave History.'} Only this demo record changes; nobody is notified.</p>
              <label htmlFor="inc-confirm-note">{pending.noteRequired ? 'Reason (required)' : 'Resolution note (optional)'}</label>
              <textarea id="inc-confirm-note" rows={3} maxLength={NOTE_MAX + 50} value={confirmNote} onChange={(e) => { setConfirmNote(e.target.value); setConfirmError(''); }} aria-invalid={confirmError ? 'true' : undefined} autoFocus />
              {confirmError && <small className="loc-error" role="alert">{confirmError}</small>}
              <div className="inc-confirm-actions">
                <button type="button" className="d-btn d-btn-ghost" onClick={() => setPending(null)} disabled={busy}>Cancel</button>
                <button type="button" className="d-btn d-btn-primary" onClick={confirmPending} disabled={busy}>{busy ? 'Saving…' : pending.label}</button>
              </div>
            </div>
          ) : (
            <div className="d-btn-row">
              {actions.map((a) => (
                <button key={a.to} type="button" className={`d-btn ${a.variant === 'primary' ? 'd-btn-primary' : 'd-btn-ghost'}`} onClick={() => startAction(a)} disabled={busy}>{a.label}</button>
              ))}
            </div>
          )}
          <p className="inc-hint">Review actions update this demo record in your browser only. No emergency service or authority is contacted.</p>

          <form className="inc-note-form" onSubmit={submitNote} noValidate>
            <label htmlFor="inc-note">Add a review note</label>
            <textarea id="inc-note" rows={3} value={noteText} onChange={(e) => { setNoteText(e.target.value); setNoteError(''); }} placeholder="What did you check or decide?" aria-invalid={noteError ? 'true' : undefined} />
            <div className="inc-note-foot">
              <small className={noteText.length > NOTE_MAX ? 'loc-error' : 'loc-hint'}>{noteText.length}/{NOTE_MAX}</small>
              <button type="submit" className="d-btn d-btn-ghost" disabled={busy}><Send size={15} /> Add note</button>
            </div>
            {noteError && <small className="loc-error" role="alert">{noteError}</small>}
          </form>
        </section>

        <section className="inc-section">
          <h3>Activity timeline <small>newest first</small></h3>
          <ol className="inc-timeline">
            {timeline.map((a) => (
              <li key={a.id} className={`is-${a.type}`}>
                <span className="inc-tl-dot" aria-hidden="true" />
                <div>
                  <strong>{activityText(a)}</strong>
                  {a.note && <p>{a.note}</p>}
                  <small>{formatDateTime(a.at)} · {a.author ?? 'Unknown'}</small>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Modal>
  );
}
