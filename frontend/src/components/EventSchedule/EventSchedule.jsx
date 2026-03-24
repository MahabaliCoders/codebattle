import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, CalendarDays, Loader } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import './EventSchedule.css';

const EventSchedule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const timelineRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Secondary sort by time if dates are same
      eventList.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });

      setEvents(eventList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
  }, [loading]);

  if (loading) return <div className="loading-state">Synchronizing Campus Schedule...</div>;

  return (
    <div className="schedule-container fade-in">
      <div className="schedule-header">
        <div className="schedule-title-group">
          <h1>Event Schedule</h1>
          <p>Live Timeline of Upcoming Activities</p>
        </div>
        <div className="schedule-actions">
           <div className="live-status-pill">
              <span className="live-dot"></span> Firestore Synchronized
           </div>
        </div>
      </div>

      <div className="timeline-wrapper">
        <div className="timeline-scroll-container" ref={timelineRef}>
          <div className="timeline-line"></div>
          
          {events.length > 0 ? events.map((event, index) => (
            <div 
              key={event.id} 
              className={`timeline-block color-${['blue', 'purple', 'orange', 'green'][index % 4]}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="time-marker"></div>
              <div className="block-content">
                <div className="block-time">
                  <Clock size={14} />
                  <span>{event.date} • {event.time}</span>
                </div>
                <h3 className="block-title">{event.eventName}</h3>
                <div className="block-location">
                  <MapPin size={14} />
                  <span>{event.venue || 'TBA'}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="empty-timeline-msg">
              <h3>No scheduled events.</h3>
              <p>Events added by coordinators will appear here on the master timeline.</p>
            </div>
          )}
          
          <div className="timeline-spacer"></div>
        </div>
      </div>
    </div>
  );
};

export default EventSchedule;
