import { Camera, RefreshCw, Square } from 'lucide-react';

// `stream` is the object returned by useCameraStream().
export default function LiveFeedPanel({ camera, stream }) {
  const { videoRef, state, error, isLive, start, stop, restart } = stream;
  const badge = isLive ? 'LIVE PREVIEW' : state === 'starting' ? 'STARTING' : 'OFFLINE';

  return (
    <section className="d-panel d-feed">
      <header className="d-panel-head">
        <div>
          <h2>Live Camera Feed</h2>
          <p>{camera.name}</p>
        </div>
        <span className={`d-feed-badge ${isLive ? 'is-live' : ''}`}><span className="d-dot" /> {badge}</span>
      </header>

      <div className="d-feed-stage">
        {isLive ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted />
            <span className="d-feed-note">Browser preview only · AI detection not connected</span>
          </>
        ) : (
          <div className="d-feed-empty">
            <Camera size={58} strokeWidth={1.5} />
            <p>{state === 'starting' ? 'Waiting for camera permission…' : 'Camera feed is offline'}</p>
            <small>{state === 'starting' ? 'Allow camera access in your browser' : 'Click Start Camera to begin monitoring'}</small>
          </div>
        )}
      </div>

      {error && <div className="d-feed-error" role="alert">{error}</div>}

      <footer className="d-feed-foot">
        <span>{isLive ? 'Camera preview is running' : 'Camera is currently stopped'}</span>
        <div className="d-btn-row">
          {isLive ? (
            <button type="button" className="d-btn d-btn-danger" onClick={stop}><Square size={16} /> Stop Camera</button>
          ) : (
            <button type="button" className="d-btn d-btn-primary" onClick={start} disabled={state === 'starting'}><Camera size={17} /> Start Camera</button>
          )}
          <button type="button" className="d-btn d-btn-ghost" onClick={restart} disabled={!isLive}><RefreshCw size={16} /> Restart</button>
        </div>
      </footer>
    </section>
  );
}
