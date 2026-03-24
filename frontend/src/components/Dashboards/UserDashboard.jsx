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
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { Calendar as CalendarIcon, MapPin, User as UserIcon, Check, Image as ImageIcon, Sparkles, Zap, ArrowRight } from 'lucide-react';
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

  const handleParticipate = async (event) => {
    const user = auth.currentUser || { uid: 'anonymous-user', email: 'not-provided@example.com' };

    try {
      const regId = `${user.uid}_${event.id}`;
      await setDoc(doc(db, 'registrations', regId), {
        userId: user.uid,
        eventId: event.id,
        userEmail: user.email,
        registeredAt: serverTimestamp()
      });
      
      // Broadcast real-time notification natively
      await addDoc(collection(db, 'notifications'), {
        type: 'Success',
        title: 'New Event Registration',
        message: `${user.email?.split('@')[0]} just registered for ${event.eventName}!`,
        createdAt: serverTimestamp(),
        read: false,
        eventId: event.id
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
      <header className="dashboard-hero-immersive">
        <div className="hero-overlay-glass">
          <div className="hero-left-content">
            <span className="hero-badge-pill"><Sparkles size={14} /> NEW EVENTS LIVE</span>
            <h1 className="hero-title">Discover Your Next <span className="text-gradient">Battle</span>, {userData?.name?.split(' ')[0] || 'Explorer'}</h1>
            <p className="hero-subtitle">The ultimate hub for college tech, culture, and sports events. Join the movement now.</p>
            <div className="hero-actions-row">
              <button className="hero-primary-btn" onClick={() => document.getElementById('events-explorer').scrollIntoView({ behavior: 'smooth' })}>
                Explore Events <ArrowRight size={18} />
              </button>
              <div className="live-participants-stack">
                <div className="mini-avatars">
                  <div className="mini-avatar"></div>
                  <div className="mini-avatar"></div>
                  <div className="mini-avatar"></div>
                </div>
                <span>40+ participants active</span>
              </div>
            </div>
          </div>
          <div className="hero-right-visual">
            <div className="floating-card-ui card-1">
               <Zap size={24} color="#f59e0b" />
               <strong>Top Rated</strong>
            </div>
            <div className="floating-card-ui card-2">
               <CalendarIcon size={24} color="#007aff" />
               <strong>Upcoming</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="stats-grid-immersive">
        <div className="stat-card-glass">
          <div className="stat-icon-circ blue"><Zap size={20} /></div>
          <div className="stat-text-wrap">
            <p className="stat-label">My Participations</p>
            <h4 className="stat-value">{userRegistrations.length}</h4>
          </div>
        </div>
        <div className="stat-card-glass">
          <div className="stat-icon-circ purple"><ImageIcon size={20} /></div>
          <div className="stat-text-wrap">
            <p className="stat-label">Available Events</p>
            <h4 className="stat-value">{allEvents.length}</h4>
          </div>
        </div>
        <div className="stat-card-glass">
          <div className="stat-icon-circ green"><Check size={20} /></div>
          <div className="stat-text-wrap">
            <p className="stat-label">Status Verified</p>
            <h4 className="stat-value" style={{fontSize: '1rem', color: '#10b981'}}>Active Account</h4>
          </div>
        </div>
      </section>

      <section id="events-explorer" className="events-hub-scenery">
        <div className="section-header-scenery">
          <div className="header-left">
            <h3>Event Gallery</h3>
            <p>Curated list of the most exciting battles on campus.</p>
          </div>
          <div className="filters-pill-group">
            <button className="active">All</button>
            <button>Tech</button>
            <button>Cultural</button>
          </div>
        </div>
        
        <div className="events-grid">
          {allEvents.length > 0 ? (
            allEvents.map(event => {
              const isRegistered = userRegistrations.includes(event.id);
              return (
                <div key={event.id} className="event-scenery-card pop-in">
                  <div className="card-media-top">
                    {event.eventImage ? (
                      <img src={event.eventImage} alt={event.eventName} className="event-gallery-img" />
                    ) : (
                      <div className="event-img-fallback">
                        <ImageIcon size={40} opacity={0.2} />
                      </div>
                    )}
                    <div className="card-type-overlay">
                      <span className={`scenery-tag ${event.eventType}`}>{event.eventType}</span>
                    </div>
                  </div>
                  
                  <div className="card-body-scenery">
                    <div className="card-title-row">
                      <h3>{event.eventName}</h3>
                      {isRegistered && <span className="status-dot green" title="Registered"></span>}
                    </div>
                    
                    <div className="scenery-meta-grid">
                      <div className="meta-pill"><CalendarIcon size={14} /> {event.date}</div>
                      <div className="meta-pill"><MapPin size={14} /> {event.venue?.split('_').join(' ')}</div>
                    </div>
                    
                    <p className="scenery-desc">{event.description}</p>
                    
                    <div className="card-footer-scenery">
                      <div className="coordinator-mini">
                        <div className="c-avatar">{event.coordinatorName?.[0]}</div>
                        <span>By {event.coordinatorName}</span>
                      </div>
                      
                      <button 
                        className={`btn-action-scenery ${isRegistered ? 'disabled' : ''}`}
                        onClick={() => !isRegistered && handleParticipate(event)}
                        disabled={isRegistered}
                      >
                        {isRegistered ? 'Registered' : 'Join Event'}
                      </button>
                    </div>
                  </div>
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
