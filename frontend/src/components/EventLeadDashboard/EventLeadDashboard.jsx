import React from 'react';
import './EventLeadDashboard.css';

const EventLeadDashboard = () => {
  return (
    <div className="dashboard-page fade-in">
      <div className="dashboard-header-clean">
        <h1>Event Lead Dashboard</h1>
        <p>Manage your specific events, tasks, and team coordination here.</p>
      </div>

      <div className="content-grid">
        <div className="mock-card full-width">
          <h3>Your Upcoming Events</h3>
          <p className="subtext">You have no upcoming events assigned at the moment.</p>
        </div>
        <div className="mock-card">
          <h3>Pending Action Items</h3>
          <p className="subtext">You're all caught up on your responsibilities!</p>
        </div>
        <div className="mock-card">
          <h3>Recent Communications</h3>
          <p className="subtext">No new messages from Admin.</p>
        </div>
      </div>
    </div>
  );
};
export default EventLeadDashboard;
