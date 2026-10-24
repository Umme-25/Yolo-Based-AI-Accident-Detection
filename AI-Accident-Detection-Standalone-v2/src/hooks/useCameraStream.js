import { useCallback, useEffect, useRef, useState } from 'react';

// Browser camera (getUserMedia) controller shared by the Dashboard and Traffic Analysis pages.
// state: 'idle' | 'starting' | 'live'. This only displays the camera; it runs no AI.
export default function useCameraStream() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const startingRef = useRef(false);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const stopTracks = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  // Attach the stream once the <video> element exists (it only renders while live).
  useEffect(() => {
    if (state === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [state]);

  useEffect(() => stopTracks, []);

  const stop = useCallback(() => {
    stopTracks();
    if (videoRef.current) videoRef.current.srcObject = null;
    setState('idle');
  }, []);

  const start = useCallback(async () => {
    if (startingRef.current || streamRef.current) return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not available in this browser. Use the video upload option on Live Monitoring instead.');
      return;
    }
    startingRef.current = true;
    setState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setState('live');
    } catch (err) {
      setState('idle');
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access in your browser and try again.'
          : 'Could not start the camera. Check that a camera is connected and not in use by another application.'
      );
    } finally {
      startingRef.current = false;
    }
  }, []);

  const restart = useCallback(async () => {
    stop();
    await start();
  }, [stop, start]);

  return { videoRef, state, error, isLive: state === 'live', start, stop, restart };
}
