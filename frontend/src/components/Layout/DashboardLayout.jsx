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
  BookOpen,
  Image as ImageIcon,
  Ticket,
  MessageSquare
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));
  const [userName, setUserName] = useState('NIT User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            const role = data.role?.toLowerCase();
            setUserRole(role);
            setUserName(data.name || 'NIT User');
            localStorage.setItem('userRole', role);
          } else {
            const fallbackRole = user.email?.includes('admin') ? 'admin' : 'user';
            setUserRole(fallbackRole);
            localStorage.setItem('userRole', fallbackRole);
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          const fallbackRole = user.email?.includes('admin') ? 'admin' : 'user';
          setUserRole(fallbackRole);
        }
        setLoading(false);
      } else {
        localStorage.removeItem('userRole');
        const isMock = sessionStorage.getItem('isMockLoggedIn') === 'true';
        if (isMock) {
          const mockRole = sessionStorage.getItem('mockUserRole') || 'admin';
          setUserRole(mockRole);
          setUserName('Mock Admin');
          setLoading(false);
          return;
        }

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
    { path: '/dashboard/event-lead', label: 'Coordinator Portal', icon: LayoutDashboard, roles: ['lead', 'event-lead'] },
    { path: '/dashboard/user', label: 'My Dashboard', icon: LayoutDashboard, roles: ['user', 'participant'] },
    { path: '/dashboard/my-tickets', label: 'My Tickets', icon: Ticket, roles: ['user', 'participant'] },
    
    // Management (Admin & Lead)
    { path: '/dashboard/planning', label: 'Event Planning', icon: CalendarDays, roles: ['lead', 'event-lead'] },
    { path: '/dashboard/tasks', label: 'Task Assignment', icon: CheckSquare, roles: ['admin', 'lead', 'event-lead'] },
    { path: '/dashboard/participants', label: 'Participant Registration', icon: Users, roles: ['admin', 'lead', 'event-lead'] },
    
    // Tracking (Admin & Lead)
    { path: '/dashboard/schedule', label: 'Event Schedule', icon: Clock, roles: ['admin', 'lead', 'event-lead'] },
    { path: '/dashboard/tracking', label: 'Execution Tracking', icon: Activity, roles: ['admin', 'lead', 'event-lead'] },
    
    // Reporting (Admin & Lead)
    { path: '/dashboard/reports', label: 'Reports', icon: FileText, roles: ['admin'] },
    { path: '/dashboard/alerts', label: 'Alerts & Notifications', icon: Bell, roles: ['admin', 'lead', 'event-lead'] },
    { path: '/dashboard/posters', label: 'Poster Studio', icon: ImageIcon, roles: ['admin', 'lead', 'event-lead'] },
    
    // Community
    { path: '/dashboard/community', label: 'Community Chat', icon: MessageSquare, roles: ['admin', 'lead', 'event-lead', 'user', 'participant'] },
  ];



  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (loading) return false; // Hide links while determining role
    const role = userRole || 'user'; // Default to user only if absolutely unknown after loading
    return item.roles.some(r => r.toLowerCase() === role.toLowerCase());
  });

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('isMockLoggedIn');
    sessionStorage.removeItem('mockUserRole');
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
          <div className="logo-square">NIT</div>
          <span className="logo-text">CodeBattle</span>
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
                <span className="user-name">{userName}</span>
                <span className="user-role-badge" style={{backgroundColor: getUserBadge().color}}>
                  {getUserBadge().label}
                </span>
              </div>
              <div className="avatar">{userName[0].toUpperCase() || 'U'}</div>
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
