import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, query, where, getDoc, doc } from 'firebase/firestore';
import { Users, Calendar, BarChart3, Settings, ShieldCheck } from 'lucide-react';
import './Dashboards.css';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({ events: 0, leads: 0, participants: 0 });
  const [adminName, setAdminName] = useState('System Admin');
  const [loading, setLoading] = useState(true);

  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    const user = auth.currentUser || { uid: 'anonymous-user', email: 'admin@example.com' };

    // Fetch Admin Profile
    const fetchAdmin = async () => {
      try {
        const d = await getDoc(doc(db, 'users', user.uid));
        if (d.exists() && d.data().name) setAdminName(d.data().name);
      } catch (e) { }
    };
    fetchAdmin();

    // Listen to full platform metrics
    const unsubEvents = onSnapshot(collection(db, 'events'), (snap) => {
      const evList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      evList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAllEvents(evList);
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

  if (loading) return <div className="loading-dashboard">Loading central administration data...</div>

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
          <div className="avatar-circle" style={{ background: '#ef4444' }}>
            {adminName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
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
          <p className="stat-value text-info" style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>Online & Syncing</p>
        </div>
      </section>

      <div className="admin-content-layout">
        <section className="events-monitoring glass-card">
          <div className="section-header-row">
            <h3>Recent Platform Events</h3>

          </div>
          <div className="activity-list">
            {allEvents.length === 0 ? (
              <p className="empty-msg">No events have been initialized yet.</p>
            ) : (
              allEvents.map(event => (
                <div key={event.id} className="activity-item">
                  <div className="activity-icon bg-primary">📅</div>
                  <div className="activity-details">
                    <p><span>{event.eventName}</span> ({event.eventType})</p>
                    <span>{event.date} • {event.time} • Coordinator: {event.coordinatorName}</span>
                  </div>
                  <div className={`status-badge-mini ${event.status || 'upcoming'}`}>
                    {event.status?.toUpperCase() || 'UPCOMING'}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="recent-activity glass-card">
          <h3>Live System Tracking</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon bg-success">✓</div>
              <div className="activity-details">
                <p>Platform operating with real-time Firebase Sync Protocol</p>
                <span style={{ color: '#10b981' }}>Live</span>
              </div>
            </div>
            {allEvents.length > 0 && (
              <div className="activity-item">
                <div className="activity-icon bg-info">i</div>
                <div className="activity-details">
                  <p>New event "{allEvents[0].eventName}" synced from cloud</p>
                  <span>Recently Updated</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
