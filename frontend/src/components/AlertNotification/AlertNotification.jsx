import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { Bell, CheckCircle, Info, AlertTriangle, Clock, Trash2, Send, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import './AlertNotification.css';

const AlertNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState({ title: '', message: '', type: 'info' });
  
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'user';
  const canBroadcast = ['admin', 'lead', 'event-lead'].includes(userRole);

  useEffect(() => {
    // Limits the stack depth to prevent huge unread blobs
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getIcon = (type) => {
    // Account for both the other developer's string matches and my TitleCase matches securely
    const lowerType = (type || '').toLowerCase();
    switch (lowerType) {
      case 'success': return <CheckCircle size={20} className="notif-icon success" />;
      case 'warning': return <AlertTriangle size={20} className="notif-icon warning" />;
      case 'info': return <Info size={20} className="notif-icon info" />;
      default: return <Bell size={20} className="notif-icon default" />;
    }
  };

  const markAsRead = async (id, currentStatus) => {
    if (currentStatus) return; // Already read
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error("Mark as read failed:", err);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'notifications', id));
      toast.success("Notification removed.");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Error deleting: " + err.message);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!newAlert.title || !newAlert.message) return;

    try {
      await addDoc(collection(db, 'notifications'), {
        ...newAlert,
        senderName: auth.currentUser?.displayName || 'System Admin',
        senderEmail: auth.currentUser?.email,
        createdAt: serverTimestamp(),
        read: false
      });
      setNewAlert({ title: '', message: '', type: 'info' });
      toast.success("Broadcast sent successfully!");
    } catch (err) {
      toast.error("Failed to send alert: " + err.message);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return 'Just now';
    if (!ts.toDate) return 'Just now';
    const date = ts.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="page-wrapper fade-in">
      <div className="notification-header-glass">
        <div className="notif-header-left">
          <h1>Campus Broadcasts & Alerts</h1>
          <p>Important updates and real-time event registration logs.</p>
        </div>
        <div className="notif-header-right">
          <div className="unread-badge glass-badge">
            <Bell size={16} /> 
            <span>{unreadCount} Unread Logs</span>
          </div>
        </div>
      </div>

      <div className="alerts-layout" style={{ display: 'flex', gap: 24 }}>
        
        {/* Main Feed Container */}
        <div className="notifications-list-container" style={{ flexGrow: 1 }}>
          {loading ? (
            <div className="loading-state">Syncing real-time alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={40} opacity={0.3} />
              <p>You're all caught up! No active notifications.</p>
            </div>
          ) : (
            <div className="notif-stack">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notif-card glass-card-solid ${!notif.read ? 'unread-glow' : ''}`}
                  onClick={() => markAsRead(notif.id, notif.read)}
                >
                  <div className="notif-icon-wrap">
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="notif-content-block">
                    <div className="notif-top-row">
                      <h4 className="notif-title">{notif.title}</h4>
                      <span className="notif-time"><Clock size={12}/> {formatTime(notif.createdAt)}</span>
                    </div>
                    <p className="notif-message">{notif.message}</p>
                    {notif.senderName && <span style={{ fontSize: '0.75rem', color: '#86868b', marginTop: 4, display: 'block' }}>Broadcast from: {notif.senderName}</span>}
                  </div>

                  <div className="notif-actions">
                    {!notif.read && <div className="blue-dot-indicator"></div>}
                    <button className="del-btn" onClick={(e) => deleteNotification(e, notif.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Broadcaster UI Panel integrated alongside history */}
        {canBroadcast && (
          <aside className="broadcaster-panel glass-card" style={{ width: 340, flexShrink: 0, padding: 24, borderRadius: 16 }}>
            <div className="panel-head" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
               <ShieldAlert size={18} color="#f59e0b" />
               <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Admin Broadcaster</h3>
            </div>
            <form onSubmit={handleBroadcast} className="broadcast-form" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input 
                type="text" placeholder="Alert Title" 
                value={newAlert.title} onChange={e => setNewAlert({...newAlert, title: e.target.value})} 
                required 
                style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e5ea', width: '100%' }}
              />
              <textarea 
                placeholder="Compose your message to all participants..." 
                value={newAlert.message} onChange={e => setNewAlert({...newAlert, message: e.target.value})} 
                required 
                style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e5ea', minHeight: 120, width: '100%', resize: 'none' }}
              />
              <div className="type-selector">
                <select 
                  value={newAlert.type} 
                  onChange={e => setNewAlert({...newAlert, type: e.target.value})}
                  style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e5ea', width: '100%' }}
                >
                  <option value="info">Information (Blue)</option>
                  <option value="warning">Urgent Warning (Yellow)</option>
                  <option value="success">Success / Celebration (Green)</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="btn-send-broadcast"
                style={{ padding: 14, borderRadius: 8, border: 'none', background: '#007aff', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginTop: 8 }}
              >
                <Send size={16} /> Broadcast Now
              </button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
};

export default AlertNotification;
