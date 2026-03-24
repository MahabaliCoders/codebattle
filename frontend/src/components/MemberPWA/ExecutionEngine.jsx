import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Play, 
  CheckCircle, 
  AlertOctagon, 
  Clock, 
  Navigation, 
  Image as ImageIcon,
  ShieldAlert
} from 'lucide-react';
import { validateGeofence } from './geofencingUtils';
import './ExecutionEngine.css';

// For simulated local testing, we fetch the latest event from localStorage
const getLatestEvent = () => {
  const events = JSON.parse(localStorage.getItem('eventsDirectory') || '[]');
  return events[0] || {
    id: 't-mock',
    eventName: 'Annual Tech Symposium',
    description: 'Ensure stage mics and projector are synced. Perform a test call.',
    venue_latitude: 12.9716, // Default
    venue_longitude: 77.5946,
    geofence_radius_meters: 100,
    priority: 'HIGH',
    deadline: '2:30 PM'
  };
};

const ExecutionEngine = () => {
  const [eventData, setEventData] = useState(getLatestEvent());
  const [status, setStatus] = useState('PENDING'); // PENDING | STARTED | CAPTURING | COMPLETED
  const [timer, setTimer] = useState(0);
  const [media, setMedia] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerInterval = useRef(null);

  useEffect(() => {
    // Sync with any updates in the lead dashboard
    const handleStorageChange = () => setEventData(getLatestEvent());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const startTask = () => {
    setStatus('STARTED');
    timerInterval.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const handlePanic = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      alert(`EMERGENCY ALERT SENT!\nLocation: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}\nLead Dashboard Notified.`);
    });
  };

  // The Strict Security Protocol: Validate Location BEFORE Opening Camera
  const initiateSubmitProof = () => {
    setError(null);
    if (!navigator.geolocation) {
       setError("Geolocation is not supported by this browser.");
       return;
    }

    // Step 1: Silent Geolocation Verification
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: curLat, longitude: curLng } = pos.coords;
        const target = { 
          lat: eventData.venue_latitude, 
          lng: eventData.venue_longitude 
        };
        
        const { isValid, distance } = validateGeofence(
          { lat: curLat, lng: curLng }, 
          target, 
          eventData.geofence_radius_meters
        );

        setLocation(pos.coords);

        if (!isValid) {
          setError(`Upload Failed: You are ${distance} meters away from the venue. Please return to the venue to submit proof.`);
          return;
        }

        // Step 2: Verification Passed -> Open Camera
        openCamera();
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
           setError("PERMISSION ERROR: You must enable GPS location permissions to submit tasks.");
        } else {
           setError(`GPS ERROR: ${err.message}. Ensure GPS is active.`);
        }
      },
      { enableHighAccuracy: true }
    );
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus('CAPTURING');
      }
    } catch (err) {
      setError("Camera Access Denied: Please enable camera in your settings.");
    }
  };

  const captureAndWatermark = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 1. Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 2. Critical Watermark for Lead Verification
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px 'Outfit', sans-serif";
    const dateStr = new Date().toLocaleString();
    const locStr = `GPS VALIDATED: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
    const eventStr = `EVENT: ${eventData.eventName.toUpperCase()}`;
    
    ctx.fillText(`${eventStr}`, 24, canvas.height - 65);
    ctx.fillText(`${dateStr} | ${locStr}`, 24, canvas.height - 25);

    // 3. Stop Stream
    video.srcObject.getTracks().forEach(track => track.stop());
    
    setMedia(canvas.toDataURL('image/jpeg'));
    setStatus('COMPLETED');
    clearInterval(timerInterval.current);
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="worker-engine-card">
      {/* Panic Button - Sticky Top */}
      <button className="panic-btn" onClick={handlePanic}>
        <AlertOctagon size={24} /> PANIC / HELP
      </button>

      <div className="task-header-pwa">
        <div className="priority-ring">
          <span className={`p-dot p-${eventData.priority?.toLowerCase() || 'high'}`}></span>
          {eventData.priority || 'HIGH'}
        </div>
        <h1>{eventData.eventName}</h1>
        <div className="task-meta">
          <Clock size={14} /> Deadline: {eventData.deadline || 'ASAP'} | <Navigation size={14} /> Venue Lock-in active
        </div>
      </div>

      <div className="engine-display">
        {status === 'PENDING' && (
          <div className="centered-view">
             <div className="task-desc">{eventData.description}</div>
             <button className="cta-btn start-cta" onClick={startTask}>
               <Play size={24} /> Start Task Now
             </button>
          </div>
        )}

        {status === 'STARTED' && (
          <div className="active-tracker">
            <div className="timer-display">{formatTime(timer)}</div>
            <p className="timer-label">TASK IN PROGRESS</p>
            <div className="visual-feedback">
              <MapPin className="pulse-icon" />
              <span>Tracking Geolocation...</span>
            </div>
            <button className="cta-btn camera-cta" onClick={initiateSubmitProof}>
              <Camera size={32} /> Submit Proof (GPS Check)
            </button>
          </div>
        )}

        {status === 'CAPTURING' && (
          <div className="camera-view">
            <video ref={videoRef} autoPlay playsInline muted className="live-preview" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="camera-overlay">
              <button className="shutter-btn" onClick={captureAndWatermark}>
                <div className="shutter-inner"></div>
              </button>
              <p>Position the proof clearly in view</p>
            </div>
          </div>
        )}

        {status === 'COMPLETED' && (
          <div className="completion-summary">
            {media && <img src={media} alt="Proof" className="proof-preview" />}
            <div className="success-banner">
              <CheckCircle size={32} />
              <h3>PROOF SUBMITTED!</h3>
              <p>Sent to Lead for approval | Time: {formatTime(timer)}</p>
            </div>
            <button className="cta-btn reset-cta" onClick={() => setStatus('PENDING')}>
              Next Task
            </button>
          </div>
        )}

        {error && (
          <div className="error-toast">
            <AlertOctagon size={20} />
            <div className="error-content">
              <strong>Geofence Error</strong>
              <p>{error}</p>
            </div>
            <button onClick={() => setError(null)} className="error-close">Dismiss</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionEngine;
