import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { Calendar, Users, ClipboardList, TrendingUp, LogOut, Award } from 'lucide-react';
import './Dashboards.css';

const EventLeadDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Award size={32} color="#f59e0b" />
          <h3>Coordinator Panel</h3>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="active"><TrendingUp size={20} /> My Events</a>
          <a href="#"><Users size={20} /> Managed Participants</a>
          <a href="#"><ClipboardList size={20} /> Tasks & Assignments</a>
          <a href="#"><Calendar size={20} /> Schedule</a>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      <main className="dashboard-content">
        <header className="content-header">
          <h1>Student Coordinator Dashboard</h1>
          <div className="user-profile">
            <span>Welcome, Event Lead</span>
            <div className="avatar">EL</div>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <h4>My Events</h4>
            <p className="stat-value">3</p>
          </div>
          <div className="stat-card">
            <h4>Registrations</h4>
            <p className="stat-value">124</p>
            <span className="stat-trend positive">+8% vs yesterday</span>
          </div>
          <div className="stat-card">
            <h4>Pending Tasks</h4>
            <p className="stat-value">12</p>
          </div>
          <div className="stat-card">
            <h4>Team Size</h4>
            <p className="stat-value">8</p>
          </div>
        </section>

        <section className="recent-activity">
          <h3>Upcoming Items</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📍</div>
              <div className="activity-details">
                <p>Main Venue booking confirmation for <strong>AI Seminar</strong></p>
                <span>Tomorrow at 10 AM</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📋</div>
              <div className="activity-details">
                <p>Send registration link to departmental groups</p>
                <span>Due in 3 hours</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EventLeadDashboard;
