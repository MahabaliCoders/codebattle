import React from 'react';
import { Search, Calendar, MapPin, Tag } from 'lucide-react';

const BrowseEvents = () => {
  const events = [
    { id: 1, title: 'Annual Tech Symposium', date: 'Oct 15, 2026', venue: 'Main Auditorium', category: 'Technical' },
    { id: 2, title: 'Cultural Fest 2026', date: 'Nov 02, 2026', venue: 'Open Ground', category: 'Cultural' },
    { id: 3, title: 'AI Workshop', date: 'Sep 28, 2026', venue: 'Seminar Hall A', category: 'Workshop' },
  ];

  return (
    <div className="browse-events-page fade-in">
      <div className="page-header-section">
        <h1>Browse Events</h1>
        <p>Find and register for upcoming campus activities.</p>
        <div className="search-bar-container glass-card">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Search events, workshops, or clubs..." />
        </div>
      </div>

      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="event-card glass-card">
            <div className="event-category-badge">{event.category}</div>
            <h3>{event.title}</h3>
            <div className="event-info-item">
              <Calendar size={16} /> <span>{event.date}</span>
            </div>
            <div className="event-info-item">
              <MapPin size={16} /> <span>{event.venue}</span>
            </div>
            <button className="apple-primary-btn" style={{marginTop: '20px', minHeight: '44px'}}>Register Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseEvents;
