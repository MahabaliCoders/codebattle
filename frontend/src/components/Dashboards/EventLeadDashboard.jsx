import React from 'react';
import './Dashboards.css';

const EventLeadDashboard = () => {
  return (
    <div className="lead-page-content fade-in">
      <header className="content-header">
        <h1>Student Coordinator Dashboard</h1>
        <div className="user-profile">
          <span className="text-secondary">Lead Coordinator</span>
          <div className="avatar-circle">LC</div>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card glass-card">
          <h4>My Managed Events</h4>
          <p className="stat-value text-primary">4</p>
        </div>
        <div className="stat-card glass-card">
          <h4>Assigned Tasks</h4>
          <p className="stat-value">12</p>
          <span className="stat-trend">8 completed</span>
        </div>
        <div className="stat-card glass-card">
          <h4>Team Members</h4>
          <p className="stat-value">8</p>
        </div>
        <div className="stat-card glass-card">
          <h4>Budget Status</h4>
          <p className="stat-value">₹50K</p>
          <span className="stat-trend positive">On track</span>
        </div>
      </section>

      <section className="task-overview glass-card">
        <h3>Current Focus</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon bg-warning">📋</div>
            <div className="activity-details">
              <p>Assign tasks for <strong>Web Design Contest</strong></p>
              <span>High Priority</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon bg-info">🤝</div>
            <div className="activity-details">
              <p>Follow up with guest speakers for <strong>Tech Symposium</strong></p>
              <span>Next 24 hours</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventLeadDashboard;
