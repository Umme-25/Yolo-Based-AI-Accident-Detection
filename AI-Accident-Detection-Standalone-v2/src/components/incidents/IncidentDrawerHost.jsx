import IncidentDetail from './IncidentDetail.jsx';
import Modal from '../locations/Modal.jsx';

// Opens the detail panel for `selectedId`; shows a friendly message if that incident does not exist.
export default function IncidentDrawerHost({ selectedId, incidents, locationById, onClose, onChangeStatus, onAddNote }) {
  if (!selectedId) return null;
  const incident = incidents.find((i) => i.id === selectedId);
  if (!incident) {
    return (
      <Modal title="Incident not found" titleId="incident-missing" onClose={onClose} size="sm">
        <div className="loc-modal-body"><p className="loc-confirm-text">No incident with ID “{selectedId}” exists. It may have been reset or the link is out of date.</p></div>
        <footer className="loc-modal-foot"><button type="button" className="d-btn d-btn-primary" onClick={onClose} data-autofocus>Back to list</button></footer>
      </Modal>
    );
  }
  return (
    <IncidentDetail key={incident.id} incident={incident} location={locationById.get(incident.locationId)} onClose={onClose} onChangeStatus={onChangeStatus} onAddNote={onAddNote} />
  );
}
