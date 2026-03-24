import React, { useState, useEffect } from 'react';
import { Bell, Send, Info, AlertTriangle, CheckCircle, Clock, Trash2, ShieldAlert } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';
import './AlertNotification.css';

const AlertNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState({ title: '', message: '', type: 'info' });
  
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'user';
  const canBroadcast = ['admin', 'lead', 'event-lead'].includes(userRole);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!newAlert.title || !newAlert.message) return;

    try {
      await addDoc(collection(db, 'notifications'), {
        ...newAlert,
        senderName: auth.currentUser?.displayName || 'System Admin',
        senderEmail: auth.currentUser?.email,
        createdAt: serverTimestamp()
      });
      setNewAlert({ title: '', message: '', type: 'info' });
      toast.success("Broadcast sent successfully!");
    } catch (err) {
      toast.error("Failed to send alert: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      toast.success("Notification removed.");
    } catch (err) {
      toast.error("Error deleting: " + err.message);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-warning" size={20} />;
      case 'success': return <CheckCircle className="text-success" size={20} />;
      default: return <Info className="text-info" size={20} />;
    }
  };

  return (
    <div className="alerts-container fade-in">
      <header className="alerts-header">
        <div className="header-info">
          <h1>Campus Broadcasts</h1>
          <p>Important updates and real-time event announcements.</p>
        </div>
        <div className="live-pill">
           <Bell size={14} /> LIVE FEED
        </div>
      </header>

      <div className="alerts-layout">
        {/* Broadcaster Panel (Admin/Leads Only) */}
        {canBroadcast && (
          <aside className="broadcaster-panel glass-card">
            <div className="panel-head">
               <ShieldAlert size={18} />
               <h3>Admin Broadcaster</h3>
            </div>
            <form onSubmit={handleBroadcast} className="broadcast-form">
              <input 
                type="text" placeholder="Alert Title" 
                value={newAlert.title} onChange={e => setNewAlert({...newAlert, title: e.target.value})} 
                required 
              />
              <textarea 
                placeholder="Compose your message to all participants..." 
                value={newAlert.message} onChange={e => setNewAlert({...newAlert, message: e.target.value})} 
                required 
              />
              <div className="type-selector">
                <select value={newAlert.type} onChange={e => setNewAlert({...newAlert, type: e.target.value})}>
                  <option value="info">Information (Blue)</option>
                  <option value="warning">Urgent Warning (Yellow)</option>
                  <option value="success">Success / Celebration (Green)</option>
                </select>
              </div>
              <button type="submit" className="btn-send-broadcast">
                <Send size={16} /> Broadcast Now
              </button>
            </form>
          </aside>
        )}

        <main className="notifications-feed">
          {loading ? (
            <div className="loading-notifications">Fetching latest alerts...</div>
          ) : notifications.length > 0 ? (
            notifications.map((note) => (
              <div key={note.id} className={`notification-card border-${note.type} pop-in`}>
                <div className="note-icon-wrap">
                  {getIcon(note.type)}
                </div>
                <div className="note-content">
                  <div className="note-top">
                    <h4>{note.title}</h4>
                    <span className="note-time">
                      <Clock size={12} /> {note.createdAt?.toDate() ? note.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                    </span>
                  </div>
                  <p>{note.message}</p>
                  <div className="note-footer">
                     <span>From: {note.senderName}</span>
                     {canBroadcast && (
                       <button className="btn-delete-note" onClick={() => handleDelete(note.id)}>
                         <Trash2 size={14} />
                       </button>
                     )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-feed">
              <p>No recent announcements. Keep an eye out for updates!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AlertNotification;
