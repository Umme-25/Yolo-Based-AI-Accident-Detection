import { useEffect, useState } from 'react';
import useCameraStream from '../hooks/useCameraStream.js';
import { Camera, CircleStop, Upload, Video, ShieldAlert, MonitorPlay, X } from 'lucide-react';

export default function TrafficAnalysis() {
  const camera = useCameraStream();
  const { videoRef, error: cameraError, start: startCamera, stop: stopCamera } = camera;
  const cameraState = camera.isLive ? 'live' : 'idle';
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  function chooseFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setFileUrl(url);
    stopCamera();
  }

  return (
    <section className="page-wrap app-page">
      <div className="page-heading"><div><span className="eyebrow">CAMERA WORKSPACE</span><h1>Traffic analysis</h1><p>Preview a connected camera or load a local traffic video for UI testing.</p></div><span className={`camera-state ${cameraState === 'live' ? 'camera-live' : ''}`}><span /> {cameraState === 'live' ? 'CAMERA ACTIVE' : 'CAMERA STANDBY'}</span></div>
      <div className="demo-notice"><span className="notice-icon"><ShieldAlert size={18} /></span><div><strong>Camera preview only</strong><p>This page can display a camera or video, but accident detection inference is not connected yet. No automated alerts are generated.</p></div><span className="demo-pill">NO AI INFERENCE</span></div>
      <div className="traffic-layout">
        <section className="panel camera-panel">
          <div className="panel-heading"><div><h2><MonitorPlay size={18} /> Camera preview</h2><p>Browser camera or uploaded video</p></div><span className="feed-id">FEED · 01</span></div>
          <div className={`video-stage ${cameraState === 'live' || fileUrl ? 'has-video' : ''}`}>
            {cameraState === 'live' ? <video ref={videoRef} autoPlay playsInline muted /> : fileUrl ? <video src={fileUrl} controls playsInline /> : <div className="camera-placeholder"><div className="camera-placeholder-icon"><Camera size={30} /></div><h3>No video source selected</h3><p>Start your camera or upload a video clip to preview it here.</p><span className="placeholder-tag"><span /> WAITING FOR SOURCE</span></div>}
            {(cameraState === 'live' || fileUrl) && <span className="video-overlay-tag"><span className="live-dot" /> {cameraState === 'live' ? 'LIVE CAMERA PREVIEW' : 'LOCAL VIDEO PREVIEW'}</span>}
          </div>
          {cameraError && <div className="inline-error" role="alert">{cameraError}</div>}
          <div className="camera-controls">
            {cameraState === 'live' ? <button type="button" className="button button-danger" onClick={stopCamera}><CircleStop size={16} /> Stop camera</button> : <button type="button" className="button button-primary" onClick={startCamera}><Camera size={16} /> Start camera</button>}
            <label className="button button-secondary upload-button"><Upload size={16} /> Upload video<input type="file" accept="video/*" onChange={chooseFile} /></label>
            {fileUrl && <button type="button" className="button button-quiet" onClick={() => { URL.revokeObjectURL(fileUrl); setFileUrl(''); setSelectedFile(null); }}> <X size={15} /> Clear video</button>}
          </div>
          {selectedFile && <p className="selected-file">Selected file: <strong>{selectedFile.name}</strong></p>}
        </section>
        <aside className="panel camera-info-panel">
          <div className="panel-heading"><div><h2>Feed details</h2><p>Local preview status</p></div></div>
          <div className="feed-detail"><span>Source type</span><strong>{cameraState === 'live' ? 'Browser camera' : fileUrl ? 'Uploaded video' : 'Not selected'}</strong></div>
          <div className="feed-detail"><span>Connection</span><strong className={cameraState === 'live' || fileUrl ? 'text-accent' : ''}>{cameraState === 'live' || fileUrl ? 'Preview available' : 'Waiting'}</strong></div>
          <div className="feed-detail"><span>AI model</span><strong className="text-muted">Not connected</strong></div>
          <div className="feed-detail"><span>Incident detection</span><strong className="text-muted">Inactive</strong></div>
          <div className="camera-info-note"><Video size={17} /><p>Use this workspace to validate camera permissions and video display. Model inference will be integrated after the AI pipeline and backend are ready.</p></div>
        </aside>
      </div>
    </section>
  );
}