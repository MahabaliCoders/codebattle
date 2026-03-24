import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { Users, Calendar, BarChart3, Settings, LogOut, ShieldCheck } from 'lucide-react';
import './Dashboards.css';

const AdminDashboard = () => {
  return (
    <div className="admin-page-content fade-in">
      <header className="content-header">
        <h1>Faculty / Superuser Overview</h1>
        <div className="user-profile">
          <span className="text-secondary">System Admin</span>
          <div className="avatar-circle">AD</div>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card glass-card">
          <h4>Total Events</h4>
          <p className="stat-value text-primary">24</p>
          <span className="stat-trend positive">+12% this month</span>
        </div>
        <div className="stat-card glass-card">
          <h4>Active Coordinators</h4>
          <p className="stat-value">15</p>
        </div>
        <div className="stat-card glass-card">
          <h4>Total Participants</h4>
          <p className="stat-value">1,240</p>
        </div>
        <div className="stat-card glass-card">
          <h4>Revenue / Budget</h4>
          <p className="stat-value">₹4.5L</p>
        </div>
      </section>

      <section className="recent-activity glass-card">
        <h3>Recent System Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon bg-info">✨</div>
            <div className="activity-details">
              <p><strong>Hackathon 2024</strong> approved by Dr. Sharma</p>
              <span>2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon bg-success">👤</div>
            <div className="activity-details">
              <p>New Student Coordinator assigned to <strong>Web Design Contest</strong></p>
              <span>5 hours ago</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


export default AdminDashboard;
