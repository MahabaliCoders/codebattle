import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, query, where, getDoc, doc } from 'firebase/firestore';
import { Users, Calendar, BarChart3, Settings, ShieldCheck } from 'lucide-react';
import './Dashboards.css';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({ events: 0, leads: 0, participants: 0 });
  const [adminName, setAdminName] = useState('System Admin');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser || { uid: 'anonymous-user', email: 'admin@example.com' };

    // Fetch Admin Profile
    const fetchAdmin = async () => {
      try {
        const d = await getDoc(doc(db, 'users', user.uid));
        if (d.exists() && d.data().name) setAdminName(d.data().name);
      } catch(e) {}
    };
    fetchAdmin();

    // Listen to full platform metrics
    const unsubEvents = onSnapshot(collection(db, 'events'), (snap) => {
      setMetrics(prev => ({ ...prev, events: snap.size }));
    });
    
    // Listen to active leads specifically
    const qLeads = query(collection(db, 'users'), where('role', '==', 'event-lead'));
    const unsubLeads = onSnapshot(qLeads, (snap) => {
      setMetrics(prev => ({ ...prev, leads: snap.size }));
    });

    const unsubRegs = onSnapshot(collection(db, 'registrations'), (snap) => {
      setMetrics(prev => ({ ...prev, participants: snap.size }));
      setLoading(false);
    });

    return () => { unsubEvents(); unsubLeads(); unsubRegs(); };
  }, []);

  if(loading) return <div className="loading-dashboard">Loading central administration data...</div>

  return (
    <div className="admin-page-content fade-in">
      <header className="content-header">
        <div className="welcome-text">
          <h1>Welcome, {adminName.split(' ')[0]}</h1>
          <p className="subtitle">Platform Overview & Metrics</p>
        </div>
        <div className="user-profile">
          <div className="user-details-text">
            <span className="user-email-text">System Administrator</span>
          </div>
          <div className="avatar-circle" style={{background: '#ef4444'}}>
            {adminName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
          </div>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card glass-card">
           <div className="stat-header">
            <h4>Total Events</h4>
            <Calendar size={20} className="text-primary" />
          </div>
          <p className="stat-value text-primary">{metrics.events}</p>
        </div>
        <div className="stat-card glass-card">
           <div className="stat-header">
            <h4>Active Coordinators</h4>
            <ShieldCheck size={20} className="text-warning" />
          </div>
          <p className="stat-value">{metrics.leads}</p>
        </div>
        <div className="stat-card glass-card">
           <div className="stat-header">
            <h4>Total Participants</h4>
            <Users size={20} className="text-success" />
          </div>
          <p className="stat-value">{metrics.participants}</p>
        </div>
        <div className="stat-card glass-card">
           <div className="stat-header">
            <h4>Platform Status</h4>
            <BarChart3 size={20} className="text-info" />
          </div>
          <p className="stat-value text-info" style={{fontSize: '1.2rem', marginTop:'0.5rem'}}>Online & Syncing</p>
        </div>
      </section>

      <section className="recent-activity glass-card">
        <h3>Live System Tracking</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon bg-success">✓</div>
            <div className="activity-details">
              <p>Platform operating with real-time Firebase Sync Protocol</p>
              <span style={{color: '#10b981'}}>Live</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
