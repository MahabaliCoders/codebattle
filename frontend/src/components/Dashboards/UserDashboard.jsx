import React from 'react';
import './Dashboards.css';

const UserDashboard = () => {
  return (
    <div className="user-page-content fade-in">
      <header className="content-header">
        <h1>Welcome, Participant</h1>
        <div className="user-profile">
          <span className="text-secondary">Student User</span>
          <div className="avatar-circle">ST</div>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card glass-card">
          <h4>Registered Events</h4>
          <p className="stat-value text-primary">3</p>
        </div>
        <div className="stat-card glass-card">
          <h4>Certificates Earned</h4>
          <p className="stat-value">5</p>
        </div>
        <div className="stat-card glass-card">
          <h4>Badges</h4>
          <p className="stat-value">2</p>
        </div>
        <div className="stat-card glass-card">
          <h4>Event Credits</h4>
          <p className="stat-value">150</p>
        </div>
      </section>

      <section className="events-overview glass-card">
        <h3>My Upcoming Events</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon bg-info">🎭</div>
            <div className="activity-details">
              <p><strong>Cultural Fest 2024</strong> - Main Stage</p>
              <span>March 28, 10:00 AM</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon bg-warning">💻</div>
            <div className="activity-details">
              <p><strong>Coding Marathon</strong> - CS Lab 3</p>
              <span>April 5, 09:00 AM</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
