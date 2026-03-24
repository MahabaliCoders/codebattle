import React, { useEffect, useRef } from 'react';
import { MapPin, Clock, CalendarDays } from 'lucide-react';
import './EventSchedule.css';

const scheduleData = [
  { id: 1, title: 'Registration & Welcome', time: '08:00 AM - 09:30 AM', location: 'Main Reception', color: 'blue' },
  { id: 2, title: 'Opening Keynote', time: '09:30 AM - 11:00 AM', location: 'Grand Auditorium', color: 'purple' },
  { id: 3, title: 'Tea & Networking Break', time: '11:00 AM - 11:30 AM', location: 'Lobby Area', color: 'orange' },
  { id: 4, title: 'Tech Symposium Panel', time: '11:30 AM - 01:00 PM', location: 'Seminar Hall A', color: 'green' },
  { id: 5, title: 'Catered Lunch', time: '01:00 PM - 02:00 PM', location: 'Dining Pavilion', color: 'orange' },
  { id: 6, title: 'Hackathon Kickoff', time: '02:00 PM - 05:00 PM', location: 'Innovation Lab', color: 'blue' },
  { id: 7, title: 'Closing Ceremony', time: '05:00 PM - 06:00 PM', location: 'Grand Auditorium', color: 'purple' },
  { id: 8, title: 'Afterparty & Dinner', time: '06:30 PM - 09:00 PM', location: 'Campus Central Gardens', color: 'orange' }
];

const EventSchedule = () => {
  const timelineRef = useRef(null);

  // Smooth mouse scroll for horizontal container
  const handleWheel = (e) => {
    if (timelineRef.current) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        timelineRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  useEffect(() => {
    const el = timelineRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, []);

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <div className="schedule-title-group">
          <h1>Event Schedule</h1>
          <p>October 15, 2026 • Main Campus</p>
        </div>
        <div className="schedule-actions">
           <button className="btn-today"><CalendarDays size={16} /> Today</button>
        </div>
      </div>

      <div className="timeline-wrapper">
        <div className="timeline-scroll-container" ref={timelineRef}>
          <div className="timeline-line"></div>
          
          {scheduleData.map((event, index) => (
            <div 
              key={event.id} 
              className={`timeline-block color-${event.color}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="time-marker"></div>
              <div className="block-content">
                <div className="block-time">
                  <Clock size={14} />
                  <span>{event.time}</span>
                </div>
                <h3 className="block-title">{event.title}</h3>
                <div className="block-location">
                  <MapPin size={14} />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="timeline-spacer"></div>
        </div>
      </div>
    </div>
  );
};

export default EventSchedule;
