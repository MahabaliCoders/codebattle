import React, { useState } from 'react';
import './EventPlanning.css';
import { Calendar, MapPin, AlignLeft, User, CheckCircle, Target } from 'lucide-react';
import GeofenceSetup from './GeofenceSetup';

const steps = [
  { id: 1, title: 'Event Details', icon: CheckCircle },
  { id: 2, title: 'Date & Time', icon: Calendar },
  { id: 3, title: 'Venue', icon: MapPin },
  { id: 4, title: 'Geofence Setup', icon: Target },
  { id: 5, title: 'Description', icon: AlignLeft },
  { id: 6, title: 'Assign Coordinator', icon: User },
];

const EventPlanning = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    coordinator: '',
    venue_latitude: 12.9716, // Default to a central point
    venue_longitude: 77.5946,
    geofence_radius_meters: 100
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      const newEvent = { ...formData, id: `EVT-${Date.now()}` };
      const existingEvents = JSON.parse(localStorage.getItem('eventsDirectory') || '[]');
      localStorage.setItem('eventsDirectory', JSON.stringify([newEvent, ...existingEvents]));
      
      console.log('Event Created!', newEvent);
      alert('Event Created Successfully!');
      
      setFormData({
        eventName: '', eventType: '', date: '', time: '', venue: '', description: '', coordinator: '',
        venue_latitude: 12.9716, venue_longitude: 77.5946, geofence_radius_meters: 100
      });
      setCurrentStep(1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length;

  return (
    <div className="centered-container">
      <div className="event-planning-container">
        
        <div className="form-header">
          <h1>Plan an Event</h1>
          <p>Complete the steps below to setup a new college event.</p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-circle">
                  {isCompleted ? <CheckCircle size={14} /> : step.id}
                </div>
                <span className="step-title">{step.title}</span>
                {index < steps.length - 1 && <div className="step-line" />}
              </div>
            );
          })}
        </div>

        {/* Form Sections */}
        <div className="form-body">
          <div className="step-sections-wrapper" style={{ transform: `translateX(-${(currentStep - 1) * (100 / steps.length)}%)`, width: `${steps.length * 100}%` }}>
            
            {/* Step 1: Event Details */}
            <div className={`step-section ${currentStep === 1 ? 'active-section' : ''}`}>
              <h2>Event Details</h2>
              <div className="input-group">
                <label>Event Name</label>
                <input 
                  type="text" 
                  name="eventName"
                  placeholder="e.g. Annual Tech Symposium" 
                  value={formData.eventName}
                  onChange={handleChange}
                  className="modern-input"
                />
              </div>
              <div className="input-group">
                <label>Event Type</label>
                <select name="eventType" value={formData.eventType} onChange={handleChange} className="modern-input">
                  <option value="">Select Type</option>
                  <option value="cultural">Cultural</option>
                  <option value="technical">Technical</option>
                  <option value="sports">Sports</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
            </div>

            {/* Step 2: Date & Time */}
            <div className={`step-section ${currentStep === 2 ? 'active-section' : ''}`}>
              <h2>Date & Time</h2>
              <div className="input-group">
                <label>Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="modern-input"
                />
              </div>
              <div className="input-group">
                <label>Time</label>
                <input 
                  type="time" 
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="modern-input"
                />
              </div>
            </div>

            {/* Step 3: Venue */}
            <div className={`step-section ${currentStep === 3 ? 'active-section' : ''}`}>
              <h2>Venue</h2>
              <div className="input-group">
                <label>Select Venue</label>
                <select name="venue" value={formData.venue} onChange={handleChange} className="modern-input">
                  <option value="">Choose a Location</option>
                  <option value="main_auditorium">Main Auditorium</option>
                  <option value="sports_complex">Sports Complex</option>
                  <option value="seminar_hall">Seminar Hall A</option>
                  <option value="open_ground">Open Ground</option>
                </select>
              </div>
            </div>

            {/* Step 4: Geofence Setup */}
            <div className={`step-section ${currentStep === 4 ? 'active-section' : ''}`}>
              <h2>Geofence Setup</h2>
              <p className="instruction-text-light">Define the radius within which participants must be to submit proof of work.</p>
              <GeofenceSetup 
                initialValue={{ 
                  lat: formData.venue_latitude, 
                  lng: formData.venue_longitude, 
                  radius: formData.geofence_radius_meters 
                }}
                onUpdate={(data) => {
                  setFormData({ 
                    ...formData, 
                    venue_latitude: data.lat, 
                    venue_longitude: data.lng, 
                    geofence_radius_meters: data.radius 
                  });
                }}
              />
            </div>

            {/* Step 5: Description */}
            <div className={`step-section ${currentStep === 5 ? 'active-section' : ''}`}>
              <h2>Description</h2>
              <div className="input-group">
                <label>Event Overview</label>
                <textarea 
                  name="description"
                  placeholder="Provide details about the event activities, target audience, etc." 
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="modern-input textarea"
                />
              </div>
            </div>

            {/* Step 6: Assign Coordinator */}
            <div className={`step-section ${currentStep === 6 ? 'active-section' : ''}`}>
              <h2>Assign Coordinator</h2>
              <div className="input-group">
                <label>Coordinator</label>
                <select name="coordinator" value={formData.coordinator} onChange={handleChange} className="modern-input">
                  <option value="">Select Faculty/Student Coordinator</option>
                  <option value="prof_smith">Prof. Smith (CS Dept)</option>
                  <option value="dr_jones">Dr. Jones (Arts Dept)</option>
                  <option value="student_council">Student Council President</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className={`btn-secondary ${currentStep === 1 ? 'hidden' : ''}`}
            onClick={handlePrev}
          >
            Back
          </button>
          
          <button 
            type="button" 
            className="btn-primary"
            onClick={handleNext}
          >
            {isLastStep ? 'Create Event' : 'Next Step'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventPlanning;
