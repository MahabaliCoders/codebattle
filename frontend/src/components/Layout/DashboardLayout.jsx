import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard/planning', label: 'Event Planning' },
    { path: '/dashboard/tasks', label: 'Task Assignment' },
    { path: '/dashboard/participants', label: 'Participant Registration' },
    { path: '/dashboard/schedule', label: 'Event Schedule' },
    { path: '/dashboard/tracking', label: 'Execution Tracking' },
    { path: '/dashboard/reports', label: 'Reports' },
    { path: '/dashboard/alerts', label: 'Alerts & Notifications' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Event Manager</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="top-header">
          <h2>College Event Management System</h2>
          <div className="user-profile">
            <span>Admin User</span>
            <div className="avatar">A</div>
          </div>
        </header>
        
        <div className="page-content">
          <div className="page-card">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
