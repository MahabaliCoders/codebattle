import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { Calendar as CalendarIcon, MapPin, User as UserIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboards.css';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser || { uid: 'anonymous-user', email: 'not-provided@example.com' };

    // 1. Fetch User Profile
    const fetchUser = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
      } catch (err) {
        console.warn("Mocking user profile or fetch failed:", err);
      }
    };
    fetchUser();

    // 2. Fetch All Events
    const qEvents = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsubEvents = onSnapshot(qEvents, (snap) => {
      setAllEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Fetch User's registrations
    const unsubRegs = onSnapshot(query(collection(db, 'registrations')), (snap) => {
      const myRegs = snap.docs
        .filter(d => d.data().userId === user.uid)
        .map(d => d.data().eventId);
      setUserRegistrations(myRegs);
      setLoading(false);
    });

    return () => { unsubEvents(); unsubRegs(); };
  }, []);

  const handleParticipate = async (eventId) => {
    const user = auth.currentUser || { uid: 'anonymous-user', email: 'not-provided@example.com' };

    try {
      const regId = `${user.uid}_${eventId}`;
      await setDoc(doc(db, 'registrations', regId), {
        userId: user.uid,
        eventId: eventId,
        userEmail: user.email,
        registeredAt: serverTimestamp()
      });
      toast.success("Successfully registered for the event!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed: " + error.message);
    }
  };

  if (loading) return (
    <div className="loading-dashboard">
      <div className="spinner"></div>
      <p>Loading your event hub...</p>
    </div>
  );

  return (
    <div className="user-page-content fade-in">
      <header className="content-header">
        <div className="welcome-text">
          <h1>Welcome, {userData?.name || 'Participant'}</h1>
          <p className="subtitle">Ready to join your next battle?</p>
        </div>
        <div className="user-profile">
          <div className="user-details-text">
            <span className="user-email-text">{userData?.email || auth.currentUser?.email}</span>
            <span className="user-role-text">Participant</span>
          </div>
          <div className="avatar-circle">
            {userData?.name ? userData.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card glass-card">
          <h4>Active Registrations</h4>
          <p className="stat-value text-primary">{userRegistrations.length}</p>
        </div>
        <div className="stat-card glass-card">
          <h4>Total Events</h4>
          <p className="stat-value">{allEvents.length}</p>
        </div>
        <div className="stat-card glass-card">
          <h4>Profile Status</h4>
          <p className="stat-value" style={{fontSize: '1.2rem', color: '#10b981'}}>Verified</p>
        </div>
      </section>

      <section className="events-hub glass-card">
        <div className="section-header">
          <h3>Available Events</h3>
          <span className="badge">{allEvents.length} Open</span>
        </div>
        
        <div className="events-grid">
          {allEvents.length > 0 ? (
            allEvents.map(event => {
              const isRegistered = userRegistrations.includes(event.id);
              return (
                <div key={event.id} className="event-card-modern">
                  <div className="event-card-header">
                    <span className={`event-type-tag ${event.eventType}`}>{event.eventType}</span>
                    {isRegistered && <span className="registered-tag"><Check size={14} /> Registered</span>}
                  </div>
                  <h3>{event.eventName}</h3>
                  <div className="event-meta-info">
                    <div className="meta-item"><CalendarIcon size={14} /> {event.date} at {event.time}</div>
                    <div className="meta-item"><MapPin size={14} /> {event.venue?.replace('_', ' ')}</div>
                    <div className="meta-item"><UserIcon size={14} /> {event.coordinatorName}</div>
                  </div>
                  <p className="event-desc-short">{event.description}</p>
                  
                  <button 
                    className={`btn-participate ${isRegistered ? 'registered' : ''}`}
                    onClick={() => !isRegistered && handleParticipate(event.id)}
                    disabled={isRegistered}
                  >
                    {isRegistered ? 'Already Joined' : 'Participate Now'}
                  </button>
                </div>
              )
            })
          ) : (
            <div className="empty-events">
              <p>No upcoming events at the moment. Check back later!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
