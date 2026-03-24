import React from 'react';
import './UserDashboard.css';

const UserDashboard = () => {
  return (
    <div className="dashboard-page fade-in">
      <div className="dashboard-header-clean">
        <h1>Welcome back, User</h1>
        <p>Explore events, track your registrations, and discover campus activities.</p>
      </div>

      <div className="content-grid">
        <div className="mock-card full-width">
          <h3>Available Events</h3>
          <p className="subtext">Browse what's happening this week on campus.</p>
        </div>
        <div className="mock-card">
          <h3>Your Tickets</h3>
          <p className="subtext">You have no upcoming ticketed events.</p>
        </div>
        <div className="mock-card">
          <h3>Following</h3>
          <p className="subtext">You aren't following any categories yet.</p>
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;
