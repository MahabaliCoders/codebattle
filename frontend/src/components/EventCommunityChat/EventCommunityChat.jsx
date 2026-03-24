import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, query, where, orderBy, getDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, Megaphone, Send, Users, ShieldCheck, LogOut, Settings, X, MoreVertical, CheckCircle2, Lock } from 'lucide-react';
import './EventCommunityChat.css';

const EventCommunityChat = () => {
  const [currentUser, setCurrentUser] = useState({ id: 'mock', name: 'User', role: 'participant' });
  const [events, setEvents] = useState([]);
  const [activeEventId, setActiveEventId] = useState(null);
  const [activeChannel, setActiveChannel] = useState('general'); // 'announcements' | 'general'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  // 1. Initial User Fetch
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }

    const fetchUser = async () => {
      const d = await getDoc(doc(db, 'users', user.uid));
      if (d.exists()) {
        setCurrentUser({ id: user.uid, name: d.data().name, role: d.data().role || 'participant' });
      } else {
        setCurrentUser({ id: user.uid, name: user.email, role: 'participant' });
      }
    };
    fetchUser();
  }, []);

  // 2. Stream Real Events
  useEffect(() => {
    if (currentUser.id === 'mock') return;
    
    // For simplicity, stream all events, but in a real massive app we filter by registered events.
    const unsub = onSnapshot(collection(db, 'events'), (snap) => {
      const evs = snap.docs.map(d => ({ id: d.id, ...d.data(), members: [] }));
      setEvents(evs);
      if (evs.length > 0 && !activeEventId) setActiveEventId(evs[0].id);
      setLoading(false);
    });
    return unsub;
  }, [currentUser.id]);

  // 3. Stream Live Messages for Active Event & Channel
  useEffect(() => {
    if (!activeEventId) return;
    
    const messagesRef = collection(db, `events/${activeEventId}/messages`);
    const qMsg = query(messagesRef, where('channel', '==', activeChannel), orderBy('timestamp', 'asc'));
    
    const unsubMsg = onSnapshot(qMsg, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.warn("Message index not built yet or permissions issue. Falling back to naive sort.", err);
      // Fallback if composite index missing: fetch all channel msgs without orderBy, sort locally
      const qFallback = query(messagesRef, where('channel', '==', activeChannel));
      onSnapshot(qFallback, (fsnap) => {
        const msgs = fsnap.docs.map(d => ({ id: d.id, ...d.data() }));
        msgs.sort((a,b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        setMessages(msgs);
      })
    });
    return () => unsubMsg();
  }, [activeEventId, activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeEvent = events.find(e => e.id === activeEventId);
  const isOrganizer = ['event-lead', 'admin', 'lead'].includes(currentUser.role);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeEventId) return;

    const payload = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      role: currentUser.role,
      text: newMessage,
      channel: activeChannel,
      timestamp: serverTimestamp()
    };
    
    setNewMessage(''); // optimistic clear
    try {
      await addDoc(collection(db, `events/${activeEventId}/messages`), payload);
    } catch (err) {
      console.error("Failed to send msg:", err);
    }
  };

  if(loading) return <div style={{padding: '2rem'}}>Loading community modules...</div>;

  return (
    <div className="chat-module-container fade-in">
      <div className="chat-sidebar-modern">
        <div className="sidebar-header-premium">
           <Users size={18} />
           <h3 className="sidebar-title-text">Explore Communities</h3>
        </div>
        <ul className="event-list-modern">
          {events.map(ev => (
            <li 
              key={ev.id} 
              className={`event-item-modern ${activeEventId === ev.id ? 'active' : ''}`}
              onClick={() => setActiveEventId(ev.id)}
            >
              <div className="event-icon-circle">
                 {ev.eventName?.charAt(0) || 'E'}
              </div>
              <div className="event-info-modern">
                <span className="ev-name-text">{ev.eventName || ev.name}</span>
                <div className="ev-status-tag">
                   <span className="pulse-dot"></span> LIVE
                </div>
              </div>
            </li>
          ))}
          {events.length === 0 && <li className="empty-sidebar-msg">Looking for communities...</li>}
        </ul>
      </div>

      <div className="chat-main-premium">
        {activeEvent ? (
          <>
            <div className="chat-header-glass">
              <div className="header-info-wrap">
                <h2 className="chat-title-main">{activeEvent.eventName || activeEvent.name}</h2>
                <div className="channel-navigation-pills">
                  <button 
                    className={`nav-pill ${activeChannel === 'announcements' ? 'active' : ''}`}
                    onClick={() => setActiveChannel('announcements')}
                  >
                    <Megaphone size={14} /> Announcements
                  </button>
                  <button 
                    className={`nav-pill ${activeChannel === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveChannel('general')}
                  >
                    <MessageSquare size={14} /> Community Loop
                  </button>
                </div>
              </div>
            </div>

            <div className="message-list">
              {messages.length === 0 ? (
                <div className="empty-state">No messages yet. Say hello!</div>
              ) : (
                messages.map((msg) => {
                  const showBadge = ['event-lead', 'admin', 'lead'].includes(msg.role);
                  const isMe = msg.senderId === currentUser.id;
                  
                  let timeStr = '';
                  if(msg.timestamp?.seconds) {
                    timeStr = new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }

                  return (
                    <div key={msg.id} className={`message-wrapper ${isMe ? 'message-mine' : 'message-other'}`}>
                      <div className="message-bubble">
                        {!isMe && (
                          <div className="message-sender">
                            {msg.senderName}
                            {showBadge && (
                              <span className="role-badge" title="Organizer">
                                <ShieldCheck size={14} className="badge-icon" /> Lead
                              </span>
                            )}
                          </div>
                        )}
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">{timeStr}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-area-premium">
              {activeChannel === 'announcements' && !isOrganizer ? (
                <div className="announcement-lock-msg">
                  <Lock size={14} /> This channel is broadcasting only.
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="chat-input-row">
                  <input 
                    type="text" 
                    placeholder={`Write to ${activeChannel}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="premium-chat-input"
                  />
                  <button type="submit" className="send-action-btn" disabled={!newMessage.trim()}>
                    <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="no-event-selected-msg">Select a battle community to join the mission logs.</div>
        )}
      </div>
    </div>
  );
};

export default EventCommunityChat;
