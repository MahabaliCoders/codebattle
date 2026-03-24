import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Play, 
  CheckCircle, 
  AlertOctagon, 
  Clock, 
  Navigation, 
  Image as ImageIcon 
} from 'lucide-react';
import './ExecutionEngine.css';

const EVENT_VENUE = {
  lat: 12.9716, // Example: College Main Campus
  lng: 77.5946,
  radius: 100 // meters
};

const ExecutionEngine = () => {
  const [activeTask, setActiveTask] = useState({
    id: 't-101',
    title: 'Setup Auditorium A/V',
    description: 'Ensure stage mics and projector are synced. Perform a test call.',
    priority: 'HIGH',
    deadline: '2:30 PM'
  });

  const [status, setStatus] = useState('PENDING'); // PENDING | STARTED | CAPTURING | COMPLETED
  const [timer, setTimer] = useState(0);
  const [location, setLocation] = useState(null);
  const [media, setMedia] = useState(null);
  const [isGeofenced, setIsGeofenced] = useState(true);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerInterval = useRef(null);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in meters
  };

  const startTask = () => {
    setStatus('STARTED');
    timerInterval.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const handlePanic = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      alert(`EMERGENCY ALERT SENT!\nLocation: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}\nDashboard Lead Notified.`);
    });
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
      setError("Camera access denied. Enable permissions in settings.");
    }
  };

  const captureProof = () => {
    // 1. Get Location First (Geofencing)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, EVENT_VENUE.lat, EVENT_VENUE.lng);
        setLocation(pos.coords);

        if (dist > EVENT_VENUE.radius) {
          setError("ERROR: Out of bounds. You must be at the Auditorium (Venue) to submit proof.");
          return;
        }

        // 2. Capture and Watermark
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Watermark Styling
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
        
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 24px Inter, sans-serif";
        const dateStr = new Date().toLocaleString();
        const locStr = `LAT: ${pos.coords.latitude.toFixed(4)} LON: ${pos.coords.longitude.toFixed(4)}`;
        
        ctx.fillText(`VALIDATED PROOF | ${dateStr}`, 20, canvas.height - 45);
        ctx.fillText(locStr, 20, canvas.height - 15);

        // Stop camera stream
        video.srcObject.getTracks().forEach(track => track.stop());
        
        setMedia(canvas.toDataURL('image/jpeg'));
        setStatus('COMPLETED');
        clearInterval(timerInterval.current);
      },
      (err) => {
        setError("Location required for proof. Turn on GPS.");
      },
      { enableHighAccuracy: true }
    );
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
          <span className={`p-dot p-${activeTask.priority.toLowerCase()}`}></span>
          {activeTask.priority}
        </div>
        <h1>{activeTask.title}</h1>
        <div className="task-meta">
          <Clock size={14} /> Deadline: {activeTask.deadline} | <Navigation size={14} /> Main Campus
        </div>
      </div>

      <div className="engine-display">
        {status === 'PENDING' && (
          <div className="centered-view">
             <div className="task-desc">{activeTask.description}</div>
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
            <button className="cta-btn camera-cta" onClick={openCamera}>
              <Camera size={32} /> Open Camera to Finish
            </button>
          </div>
        )}

        {status === 'CAPTURING' && (
          <div className="camera-view">
            <video ref={videoRef} autoPlay playsInline muted className="live-preview" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="camera-overlay">
              <button className="shutter-btn" onClick={captureProof}>
                <div className="shutter-inner"></div>
              </button>
              <p>Position the proof clearly in view</p>
            </div>
          </div>
        )}

        {status === 'COMPLETED' && (
          <div className="completion-summary">
            <img src={media} alt="Proof" className="proof-preview" />
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
            <span>{error}</span>
            <button onClick={() => setError(null)}>OK</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionEngine;
