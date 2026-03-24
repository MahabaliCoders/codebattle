import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckSquare,
  Users,
  Clock,
  Activity,
  FileText,
  Bell,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/planning', label: 'Event Planning', icon: CalendarDays },
    { path: '/dashboard/tasks', label: 'Task Assignment', icon: CheckSquare },
    { path: '/dashboard/participants', label: 'Participant Registration', icon: Users },
    { path: '/dashboard/schedule', label: 'Event Schedule', icon: Clock },
    { path: '/dashboard/tracking', label: 'Execution Tracking', icon: Activity },
    { path: '/dashboard/reports', label: 'Reports', icon: FileText },
    { path: '/dashboard/alerts', label: 'Alerts & Notifications', icon: Bell },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>EM</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-link ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={20} className="nav-icon" />
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="top-header glass-header">
          <h2>College Event Management</h2>
          <div className="user-profile">
            <span>Admin</span>
            <div className="avatar">A</div>
          </div>
        </header>
        
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
