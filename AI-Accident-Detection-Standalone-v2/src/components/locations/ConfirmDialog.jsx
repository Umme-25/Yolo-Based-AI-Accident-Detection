import { useState } from 'react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ title, message, confirmLabel, danger = false, onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return (
    <Modal title={title} titleId="confirm-title" onClose={busy ? () => {} : onCancel} size="sm">
      <div className="loc-modal-body">
        <p className="loc-confirm-text">{message}</p>
        {error && <div className="loc-form-error" role="alert">{error}</div>}
      </div>
      <footer className="loc-modal-foot">
        <button type="button" className="d-btn d-btn-ghost" onClick={onCancel} disabled={busy} data-autofocus>Cancel</button>
        <button type="button" className={`d-btn ${danger ? 'd-btn-danger-solid' : 'd-btn-primary'}`} onClick={confirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button>
      </footer>
    </Modal>
  );
}
