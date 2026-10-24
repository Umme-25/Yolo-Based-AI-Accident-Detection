import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { isSafeEvidenceUrl } from '../../utils/incidentUtils.js';

// Shows evidence only when a valid http(s) source exists and it actually loads.
// Otherwise a placeholder is shown, never a broken image or video element.
// Render with key={incident.id} so load-failure state resets per incident.
export default function EvidencePanel({ incident }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const imageUrl = !imageFailed && isSafeEvidenceUrl(incident.evidenceImageUrl) ? incident.evidenceImageUrl.trim() : null;
  const videoUrl = !videoFailed && isSafeEvidenceUrl(incident.evidenceVideoUrl) ? incident.evidenceVideoUrl.trim() : null;

  if (!imageUrl && !videoUrl) {
    const failed = imageFailed || videoFailed;
    return (
      <div className="inc-evidence-empty">
        <ImageOff size={28} strokeWidth={1.5} />
        <strong>{failed ? 'Evidence could not be loaded' : 'No evidence attached'}</strong>
        <small>{failed ? 'The evidence source is unavailable.' : 'Evidence images and video will appear here once a detection source provides them.'}</small>
      </div>
    );
  }
  return (
    <div className="inc-evidence">
      {imageUrl && <img src={imageUrl} alt={`Evidence image for ${incident.id}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />}
      {videoUrl && <video src={videoUrl} controls preload="metadata" onError={() => setVideoFailed(true)} aria-label={`Evidence video for ${incident.id}`} />}
    </div>
  );
}
