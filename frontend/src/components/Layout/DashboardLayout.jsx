import React, { useState, useEffect } from 'react';
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
  LayoutDashboard,
  Calendar,
  Search,
  BookOpen
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const role = docSnap.data().role?.toLowerCase();
            setUserRole(role);
          } else {
            // Check if user is the first user/admin or has a specific email
            if (user.email?.includes('admin')) setUserRole('admin');
            else setUserRole('user');
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
        setLoading(false);
      } else {
        // ONLY redirect if we are sure there's no user AFTER initial load
        setLoading(false);
        setUserRole(null);
        navigate('/');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);


  const navItems = [
    // Shared / Admin
    { path: '/dashboard/admin', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { path: '/dashboard/lead', label: 'Lead Dashboard', icon: LayoutDashboard, roles: ['lead', 'event-lead'] },
    { path: '/dashboard/user', label: 'My Dashboard', icon: LayoutDashboard, roles: ['user', 'participant'] },
    
    // Management (Admin & Lead)
    { path: '/dashboard/planning', label: 'Event Planning', icon: CalendarDays, roles: ['admin', 'lead', 'event-lead'] },
    { path: '/dashboard/tasks', label: 'Task Assignment', icon: CheckSquare, roles: ['admin', 'lead', 'event-lead'] },
    { path: '/dashboard/participants', label: 'Participant Registration', icon: Users, roles: ['admin', 'lead', 'event-lead'] },
    
    // Tracking (Admin & Lead)
    { path: '/dashboard/schedule', label: 'Event Schedule', icon: Clock, roles: ['admin', 'lead', 'event-lead'] },
    { path: '/dashboard/tracking', label: 'Execution Tracking', icon: Activity, roles: ['admin', 'lead', 'event-lead'] },
    
    // Reporting (Admin & Lead)
    { path: '/dashboard/reports', label: 'Reports', icon: FileText, roles: ['admin'] },
    { path: '/dashboard/alerts', label: 'Alerts & Notifications', icon: Bell, roles: ['admin', 'lead', 'event-lead'] },
  ];



  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (loading) return false; // Hide links while determining role
    const role = userRole || 'user'; // Default to user only if absolutely unknown after loading
    return item.roles.some(r => r.toLowerCase() === role.toLowerCase());
  });

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const getUserBadge = () => {
    if (loading) return { label: 'Loading...', color: '#86868b' };
    const role = userRole || 'user';
    if (role === 'admin') return { label: 'Admin', color: '#ef4444' };
    if (role === 'lead' || role === 'event-lead') return { label: 'Lead', color: '#f59e0b' };
    return { label: 'Participant', color: '#10b981' };
  };




  if (loading) return <div className="loading-spinner">Loading session...</div>;

  return (
    <div className="dashboard-layout fade-in">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-square">EM</div>
          <span className="logo-text">EventMaster</span>
        </div>
        
        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-link ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={18} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={18} className="nav-icon" />
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="top-header glass-header">
          <div className="header-left">
            <h2>{filteredNavItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}</h2>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{auth.currentUser?.email?.split('@')[0]}</span>
                <span className="user-role-badge" style={{backgroundColor: getUserBadge().color}}>
                  {getUserBadge().label}
                </span>
              </div>
              <div className="avatar">{auth.currentUser?.email?.[0].toUpperCase() || 'U'}</div>
            </div>
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
