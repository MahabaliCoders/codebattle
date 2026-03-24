import React, { useState, useEffect } from 'react';
import { CheckCircle2, UploadCloud, ArrowRight, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import './UserDashboard.css';

const steps = [
  { id: 1, title: 'Personal Details' },
  { id: 2, title: 'Event Details' },
  { id: 3, title: 'Additional Info' },
  { id: 4, title: 'Confirmation' },
];

const mockEventData = {
  id: 'EVT-MOCK',
  eventName: 'Annual Tech Symposium 2026',
  date: 'October 15, 2026',
  venue: 'Main Campus Auditorium',
  description: 'Join the biggest technological gathering of the year. Explore AI, Web3, and future computing dynamics with leading industry experts.',
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  filled: 120,
  capacity: 200
};

const UserDashboard = () => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [availableEvents, setAvailableEvents] = useState([]);
  const [eventData, setEventData] = useState(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    participationType: 'Individual',
    whyJoin: '',
    resume: null,
    termsAgreed: false
  });

  // Load drafted data and available events
  useEffect(() => {
    const draft = localStorage.getItem('registrationDraft');
    if (draft) {
      setFormData(JSON.parse(draft));
    }

    const directory = JSON.parse(localStorage.getItem('eventsDirectory') || '[]');
    if (directory.length > 0) {
      const formattedEvents = directory.map((evt, idx) => ({
        ...evt,
        // Cycle images to make lists look nice
        image: `https://images.unsplash.com/photo-${1540575467063 + (idx * 10)}?auto=format&fit=crop&w=800&q=80`, 
        // Mock seats mapping
        filled: Math.floor(Math.random() * 50) + 50,
        capacity: 200
      }));
      setAvailableEvents(formattedEvents);
    } else {
      setAvailableEvents([mockEventData]);
    }
  }, []);

  const handleSelectEvent = (event) => {
    setEventData(event);
    setView('form');
    setCurrentStep(1);
    setShowSuccess(false);
  };

  const handleBackToList = () => {
    setView('list');
    setEventData(null);
    setCurrentStep(1);
    setShowSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
       const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
       if(name !== 'termsAgreed') localStorage.setItem('registrationDraft', JSON.stringify(updated));
       return updated;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files[0].name }));
    }
  };

  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.fullName.trim()) stepErrors.fullName = 'Full Name is required.';
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) stepErrors.email = 'Valid Email Address is required.';
      if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) stepErrors.phone = 'Valid 10-digit Phone Number is required.';
      if (!formData.college.trim()) stepErrors.college = 'College Name is required.';
    }
    if (step === 4) {
      if (!formData.termsAgreed) stepErrors.termsAgreed = 'You must agree to the terms to register.';
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      isValid = false;
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newParticipant = {
        ...formData,
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        eventName: eventData.eventName,
        date: eventData.date,
        registrationDate: new Date().toLocaleDateString()
      };

      const existingParticipants = JSON.parse(localStorage.getItem('participants') || '[]');
      localStorage.setItem('participants', JSON.stringify([...existingParticipants, newParticipant]));
      localStorage.removeItem('registrationDraft');
      
      setIsSubmitting(false);
      setShowSuccess(true);
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
    }, 1500);
  };

  // View: Event List Grid
  if (view === 'list') {
    return (
      <div className="registration-flow-wrapper fade-in">
        <div className="registration-header-area">
          <h1>Discover Events</h1>
          <p>Browse upcoming campus events and secure your spot today.</p>
        </div>

        <div className="events-grid">
          {availableEvents.map((evt) => (
            <div key={evt.id} className="event-list-card fade-in">
              <div className="event-list-image" style={{ backgroundImage: `url(${evt.image || mockEventData.image})` }}>
                <div className="slots-badge">
                   {evt.filled || 0}/{evt.capacity || 200} filling fast
                </div>
              </div>
              <div className="event-list-content">
                <h3>{evt.eventName}</h3>
                <div className="event-list-meta">
                  <span><Calendar size={14} /> {evt.date || 'TBA'}</span>
                  <span><MapPin size={14} /> {evt.venue || 'TBA'}</span>
                </div>
                <p>{evt.description ? evt.description.substring(0, 100) + '...' : 'No description provided.'}</p>
                <div className="event-card-actions">
                  <button className="apple-primary-btn outline-btn" onClick={() => handleSelectEvent(evt)}>
                    Register Now <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // View: Success Screen
  if (showSuccess) {
    return (
      <div className="registration-success-container fade-in">
        <div className="success-glass-card">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={64} className="text-green" />
          </div>
          <h1>Registration Successful 🎉</h1>
          <p>You're all set! A confirmation email has been sent to <strong>{formData.email}</strong>.</p>
          
          <div className="summary-receipt">
            <div className="receipt-row">
              <span>Event</span>
              <strong>{eventData.eventName}</strong>
            </div>
            <div className="receipt-row">
              <span>Date</span>
              <strong>{eventData.date}</strong>
            </div>
            <div className="receipt-row">
              <span>Type</span>
              <strong>{formData.participationType}</strong>
            </div>
          </div>
          
          <button className="apple-primary-btn" onClick={handleBackToList}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // View: Form Registration
  return (
    <div className="registration-flow-wrapper fade-in">
      
      <div className={`toast-notification ${showToast ? 'visible' : ''}`}>
        <CheckCircle2 size={20} color="#34c759" />
        <span>Successfully Registered</span>
      </div>

      <div className="registration-header-area quick-nav-header">
        <button className="clean-back-btn" onClick={handleBackToList}>
          <ArrowLeft size={18} /> Back to Events
        </button>
      </div>

      <div className="registration-main-grid">
        <aside className="event-banner-card">
          <div className="banner-image" style={{ backgroundImage: `url(${eventData.image || mockEventData.image})` }}>
            <div className="slots-badge">
              <span className="pulse-dot"></span> {eventData.filled}/{eventData.capacity} slots filled
            </div>
          </div>
          <div className="banner-content">
            <h2>{eventData.eventName}</h2>
            <div className="banner-meta">
              <span>📅 {eventData.date}</span>
              <span>📍 {eventData.venue}</span>
            </div>
            <p className="banner-desc">{eventData.description}</p>
          </div>
        </aside>

        <div className="form-glass-card">
          <div className="apple-progress-bar">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className={`progress-step ${currentStep >= step.id ? 'active' : ''}`}>
                  <div className="step-circle">{currentStep > step.id ? <CheckCircle2 size={14} /> : step.id}</div>
                  <span className="step-label">{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`progress-line ${currentStep > step.id ? 'active-line' : ''}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="form-content-area">
            {currentStep === 1 && (
              <div className="step-panel slide-enter">
                <h2>Personal Details</h2>
                <div className="input-row">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" name="fullName" className={`apple-input ${errors.fullName ? 'input-error' : ''}`} value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" />
                    {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" className={`apple-input ${errors.phone ? 'input-error' : ''}`} value={formData.phone} onChange={handleInputChange} placeholder="9876543210" />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" name="email" className={`apple-input ${errors.email ? 'input-error' : ''}`} value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="input-group">
                  <label>College Name</label>
                  <input type="text" name="college" className={`apple-input ${errors.college ? 'input-error' : ''}`} value={formData.college} onChange={handleInputChange} placeholder="University Name" />
                  {errors.college && <span className="error-text">{errors.college}</span>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-panel slide-enter">
                <h2>Event Details</h2>
                <div className="input-group">
                  <label>Event Name</label>
                  <input type="text" className="apple-input locked-input" value={eventData.eventName} readOnly />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>Date</label>
                    <input type="text" className="apple-input locked-input" value={eventData.date} readOnly />
                  </div>
                  <div className="input-group">
                    <label>Venue</label>
                    <input type="text" className="apple-input locked-input" value={eventData.venue} readOnly />
                  </div>
                </div>
                <div className="input-group">
                  <label>Participation Type</label>
                  <select name="participationType" className="apple-input apple-select" value={formData.participationType} onChange={handleInputChange}>
                    <option value="Individual">Individual</option>
                    <option value="Team">Team (Max 4 members)</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="step-panel slide-enter">
                <h2>Additional Info</h2>
                <div className="input-group">
                  <label>Why do you want to join? (Optional)</label>
                  <textarea name="whyJoin" className="apple-input apple-textarea" value={formData.whyJoin} onChange={handleInputChange} placeholder="Tell us your motivation..."></textarea>
                </div>
                <div className="input-group">
                  <label>Relevant Documents / Resume (Optional)</label>
                  <div className="file-upload-box">
                    <UploadCloud size={28} color="#007aff" />
                    <span>{formData.resume ? formData.resume : 'Click to upload or drag and drop'}</span>
                    <input type="file" className="file-input-hidden" onChange={handleFileUpload} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="step-panel slide-enter">
                <h2>Confirmation</h2>
                <div className="summary-box">
                  <p><strong>Name:</strong> {formData.fullName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Participation:</strong> {formData.participationType}</p>
                  <p><strong>Event:</strong> {eventData.eventName}</p>
                </div>
                <div className="checkbox-group">
                  <label className="apple-checkbox-label">
                    <input type="checkbox" name="termsAgreed" checked={formData.termsAgreed} onChange={handleInputChange} />
                    <span className="custom-checkbox"></span>
                    I agree to the terms and conditions and certify all information is correct.
                  </label>
                  {errors.termsAgreed && <span className="error-text block-error">{errors.termsAgreed}</span>}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            {currentStep > 1 ? (
              <button className="apple-secondary-btn" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div></div>}
            
            {currentStep < steps.length ? (
              <button className="apple-primary-btn" onClick={handleNext}>
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button className="apple-primary-submit-btn apple-primary-btn" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
