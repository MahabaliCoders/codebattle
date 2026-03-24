import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Bell, CheckCircle, Info, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import './AlertNotification.css';

const AlertNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener to notifications collection
  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
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
    switch (type) {
      case 'Success': return <CheckCircle size={20} className="notif-icon success" />;
      case 'Warning': return <AlertTriangle size={20} className="notif-icon warning" />;
      case 'Info': return <Info size={20} className="notif-icon info" />;
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
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return 'Just now';
    const date = ts.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="page-wrapper fade-in">
      <div className="notification-header-glass">
        <div className="notif-header-left">
          <h1>Activity & Alerts</h1>
          <p>Real-time system updates and event registration logs.</p>
        </div>
        <div className="notif-header-right">
          <div className="unread-badge glass-badge">
            <Bell size={16} /> 
            <span>{unreadCount} Unread</span>
          </div>
        </div>
      </div>

      <div className="notifications-list-container">
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
    </div>
  );
};

export default AlertNotification;
