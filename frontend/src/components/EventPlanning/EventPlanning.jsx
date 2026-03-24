import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './EventPlanning.css';
import { Calendar, MapPin, AlignLeft, User, CheckCircle, Loader2, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Event Details', icon: CheckCircle },
  { id: 2, title: 'Date & Time', icon: Calendar },
  { id: 3, title: 'Venue', icon: MapPin },
  { id: 4, title: 'Poster / Image', icon: Upload },
  { id: 5, title: 'Description', icon: AlignLeft },
  { id: 6, title: 'Assign Coordinator', icon: User },
];

const EventPlanning = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    eventImage: '',
    coordinatorName: '',
    coordinatorPhone: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit for proof of concept
      toast.error("Image too large. Please select an image under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, eventImage: reader.result });
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    // Validation for phone number
    if (currentStep === 6) {
      if (!formData.coordinatorName.trim()) {
        toast.error("Please enter coordinator name");
        return;
      }
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.coordinatorPhone)) {
        toast.error("Please enter a valid 10-digit phone number");
        return;
      }
    }

    if (currentStep === 4 && !formData.eventImage) {
        toast.error("Please upload an event poster/image");
        return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
      try {
        const eventData = {
          ...formData,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser?.uid || 'anonymous-user',
          creatorEmail: auth.currentUser?.email || 'not-provided@example.com',
          status: 'upcoming'
        };
        
        await addDoc(collection(db, 'events'), eventData);
        
        toast.success('Event Created Successfully in Cloud!');
        
        setFormData({
          eventName: '', eventType: '', date: '', time: '', venue: '', description: '', eventImage: '', coordinatorName: '', coordinatorPhone: ''
        });
        setCurrentStep(1);
      } catch (error) {
        console.error("Error creating event:", error);
        toast.error("Failed to store event: " + error.message);
      } finally {
        setIsLoading(false);
      }
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
          <div className="step-sections-wrapper" style={{ 
            transform: `translateX(-${(currentStep - 1) * (100 / steps.length)}%)`,
            width: `${steps.length * 100}%`
          }}>
            
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

            {/* Step 4: Poster Image */}
            <div className={`step-section ${currentStep === 4 ? 'active-section' : ''}`}>
              <h2>Event Media</h2>
              <div className="media-upload-container">
                <div className="image-preview-box">
                  {formData.eventImage ? (
                    <div className="preview-wrap">
                      <img src={formData.eventImage} alt="Poster Preview" />
                      <button className="remove-img-btn" onClick={() => setFormData({...formData, eventImage: ''})}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={40} opacity={0.3} />
                      <p>Upload Event Poster / Cover Image</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="file-input-hidden"
                        id="poster-upload"
                      />
                      <label htmlFor="poster-upload" className="btn-upload-label">Browse Files</label>
                    </div>
                  )}
                </div>
              </div>
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
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="coordinatorName"
                  placeholder="E.g. Dr. John Doe" 
                  value={formData.coordinatorName}
                  onChange={handleChange}
                  className="modern-input"
                  required
                />
              </div>
              <div className="input-group">
                <label>Phone Number (10 digits)</label>
                <input 
                  type="tel" 
                  name="coordinatorPhone"
                  placeholder="E.g. 9876543210" 
                  value={formData.coordinatorPhone}
                  onChange={handleChange}
                  className="modern-input"
                  maxLength="10"
                  required
                />
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className={`btn-secondary ${currentStep === 1 || isLoading ? 'hidden' : ''}`}
            onClick={handlePrev}
            disabled={isLoading}
          >
            Back
          </button>
          
          <button 
            type="button" 
            className="btn-primary"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isLastStep ? 'Create Event' : 'Next Step')}
          </button>
        </div>

      </div>
    </div>
  );
};
export default EventPlanning;
