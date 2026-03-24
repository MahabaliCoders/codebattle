import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, query, where, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { Calendar, Users, ListFilter, Activity, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboards.css';

const EventLeadDashboard = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [activeTasks, setActiveTasks] = useState(0);
  const [teamSize, setTeamSize] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser || { uid: 'anonymous-user', email: 'not-provided@example.com' };

    // 0. Fetch Lead's User Profile for personalization
    const fetchUser = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
      } catch (err) {
        console.warn("Could not fetch lead profile for personalization:", err);
      }
    };
    fetchUser();

    // 1. Fetch Events created by this Lead
    const qEvents = query(
      collection(db, 'events'), 
      where('createdBy', '==', user.uid)
    );
    const unsubEvents = onSnapshot(qEvents, (snap) => {
      const eventsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      eventsList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); // Avoids composite index error
      setMyEvents(eventsList);
    });

    // 2. Fetch Total Registrations
    const unsubRegs = onSnapshot(collection(db, 'registrations'), (snap) => {
      setRegistrationsCount(snap.size);
    });

    // 3. Fetch Active Tasks (In Progress)
    const unsubTasks = onSnapshot(query(collection(db, 'tasks'), where('status', '==', 'inProgress')), (snap) => {
      setActiveTasks(snap.size);
    });

    // 4. Fetch Team Size (Leads)
    const unsubTeam = onSnapshot(collection(db, 'users'), (snap) => {
      const count = snap.docs.filter(d => ['lead', 'event-lead'].includes(d.data().role?.toLowerCase())).length;
      setTeamSize(count);
      setLoading(false);
    });

    return () => { unsubEvents(); unsubRegs(); unsubTasks(); unsubTeam(); };
  }, []);

  const handleCancelEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to cancel this event? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        toast.success("Event cancelled successfully.");
      } catch (err) {
        console.error("Error cancelling event:", err);
        toast.error("Failed to cancel event: " + err.message);
      }
    }
  };

  if (loading) return <div className="loading-dashboard">Preparing coordinator view...</div>;

  return (
    <div className="lead-page-content fade-in">
      <header className="content-header">
        <div className="welcome-text">
          <h1>Welcome, {userData?.name ? userData.name.split(' ')[0] : 'Coordinator'}</h1>
          <p className="subtitle">Manage events and track student engagement.</p>
        </div>
        <div className="user-profile">
          <div className="user-details-text">
            <span className="user-email-text">{userData?.email || auth.currentUser?.email || 'Coordinator'}</span>
            <span className="user-role-text">Event Lead</span>
          </div>
          <div className="avatar-circle">
            {userData?.name ? 
              userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
              : 'LC'
            }
          </div>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-header">
            <h4>Managed Events</h4>
            <Calendar size={20} className="text-primary" />
          </div>
          <p className="stat-value text-primary">{myEvents.length}</p>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-header">
            <h4>Global Registrations</h4>
            <Users size={20} className="text-success" />
          </div>
          <p className="stat-value">{registrationsCount}</p>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-header">
            <h4>In-Progress Tasks</h4>
            <Activity size={20} className="text-warning" />
          </div>
          <p className="stat-value">{activeTasks}</p>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-header">
            <h4>Campus Team</h4>
            <ListFilter size={20} className="text-info" />
          </div>
          <p className="stat-value">{teamSize}</p>
        </div>
      </section>

      <section className="managed-events-section glass-card">
        <div className="section-header">
          <h3>My Upcoming Events</h3>
          <Link to="/dashboard/planning" className="btn-create-task" style={{textDecoration: 'none'}}>
            <Plus size={18} /> Add Event
          </Link>
        </div>
        <div className="activity-list">
          {myEvents.length > 0 ? (
            myEvents.map(event => (
              <div key={event.id} className="activity-item">
                <div className="activity-icon bg-primary">📅</div>
                <div className="activity-details">
                  <p><strong>{event.eventName}</strong> at {event.venue?.replace('_', ' ')}</p>
                  <span>{event.date} • {event.time} • Coordinator: {event.coordinatorName}</span>
                </div>
                <div className="event-actions" style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <div className="event-status upcoming">Active</div>
                  <button onClick={() => handleCancelEvent(event.id)} className="btn-icon-danger" title="Cancel Event">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">No events created yet. Use the 'Event Planning' tab to start.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventLeadDashboard;
