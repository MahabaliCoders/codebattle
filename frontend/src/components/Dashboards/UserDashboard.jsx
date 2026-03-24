import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { Calendar, UserCircle, Award, Layout, LogOut, Ticket } from 'lucide-react';
import './Dashboards.css';

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Ticket size={32} color="#10b981" />
          <h3>Participant Panel</h3>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="active"><Layout size={20} /> My Dashboard</a>
          <a href="#"><Calendar size={20} /> Browse Events</a>
          <a href="#"><Award size={20} /> My Achievements</a>
          <a href="#"><UserCircle size={20} /> My Profile</a>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      <main className="dashboard-content">
        <header className="content-header">
          <h1>Participant Dashboard</h1>
          <div className="user-profile">
            <span>Welcome, User</span>
            <div className="avatar">PU</div>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <h4>Registered Events</h4>
            <p className="stat-value">5</p>
          </div>
          <div className="stat-card">
            <h4>Certificates</h4>
            <p className="stat-value">2</p>
          </div>
          <div className="stat-card">
            <h4>Rank / Points</h4>
            <p className="stat-value">12th</p>
            <span className="stat-trend positive">Top 5% overall</span>
          </div>
          <div className="stat-card">
            <h4>Profile Score</h4>
            <p className="stat-value">84%</p>
          </div>
        </section>

        <section className="recent-activity">
          <h3>Your Upcoming Activities</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🔥</div>
              <div className="activity-details">
                <p>Coding Round for <strong>Code Battle 2024</strong></p>
                <span>Tonight at 8 PM</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📚</div>
              <div className="activity-details">
                <p>Submit project proposal for <strong>Open Source Fest</strong></p>
                <span>Due by midnight</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
