import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { Users, Calendar, BarChart3, Settings, LogOut, ShieldCheck } from 'lucide-react';
import './Dashboards.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <ShieldCheck size={32} color="#4f46e5" />
          <h3>Admin Panel</h3>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="active"><BarChart3 size={20} /> Overview</a>
          <a href="#"><Users size={20} /> Manage Faculty</a>
          <a href="#"><Calendar size={20} /> All Events</a>
          <a href="#"><Settings size={20} /> System Config</a>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      <main className="dashboard-content">
        <header className="content-header">
          <h1>Faculty / Superuser Dashboard</h1>
          <div className="user-profile">
            <span>Welcome, Admin</span>
            <div className="avatar">AD</div>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <h4>Total Events</h4>
            <p className="stat-value">24</p>
            <span className="stat-trend positive">+12% this month</span>
          </div>
          <div className="stat-card">
            <h4>Active Coordinators</h4>
            <p className="stat-value">15</p>
          </div>
          <div className="stat-card">
            <h4>Total Participants</h4>
            <p className="stat-value">1,240</p>
          </div>
          <div className="stat-card">
            <h4>Revenue / Budget</h4>
            <p className="stat-value">₹4.5L</p>
          </div>
        </section>

        <section className="recent-activity">
          <h3>Recent System Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">✨</div>
              <div className="activity-details">
                <p><strong>Hackathon 2024</strong> approved by Dr. Sharma</p>
                <span>2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">👤</div>
              <div className="activity-details">
                <p>New Student Coordinator assigned to <strong>Web Design Contest</strong></p>
                <span>5 hours ago</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
