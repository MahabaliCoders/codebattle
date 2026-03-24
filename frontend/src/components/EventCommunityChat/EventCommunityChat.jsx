import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Megaphone, 
  Send, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  X,
  MoreVertical,
  CheckCircle2,
  Lock
} from 'lucide-react';
import './EventCommunityChat.css';

// Mocked Data for demonstration
const currentUser = {
  id: 'u1',
  name: 'Alex Developer',
  role: 'PARTICIPANT', // try changing to 'MANAGER' or 'EVENT_LEAD'
};

const initialEvents = [
  { id: 'e1', name: 'Annual Tech Symposium', status: 'LIVE', members: [
    { id: 'u1', name: 'Alex Developer', role: 'PARTICIPANT' },
    { id: 'u2', name: 'Sarah Lead', role: 'EVENT_LEAD' },
    { id: 'u3', name: 'Mike Manager', role: 'MANAGER' },
    { id: 'u4', name: 'Disruptive Dan', role: 'PARTICIPANT' }
  ] },
  { id: 'e2', name: 'Workshop Series', status: 'CLOSED', members: [
    { id: 'u1', name: 'Alex Developer', role: 'PARTICIPANT' },
  ] },
];

const initialMessages = {
  e1: {
    announcements: [
      { id: 'm1', senderId: 'u2', senderName: 'Sarah Lead', role: 'EVENT_LEAD', text: 'Welcome to the Tech Symposium! Make sure to check the schedule.', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
    general: [
      { id: 'm2', senderId: 'u1', senderName: 'Alex Developer', role: 'PARTICIPANT', text: 'Hi everyone! Excited for the event.', timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: 'm3', senderId: 'u3', senderName: 'Mike Manager', role: 'MANAGER', text: 'Glad to have you here, Alex!', timestamp: new Date(Date.now() - 900000).toISOString() },
    ]
  },
  e2: {
    announcements: [],
    general: []
  }
};

const EventCommunityChat = () => {
  const [events, setEvents] = useState(initialEvents);
  const [activeEventId, setActiveEventId] = useState(initialEvents[0].id);
  const [activeChannel, setActiveChannel] = useState('general'); // 'announcements' | 'general'
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  
  const messagesEndRef = useRef(null);

  const activeEvent = events.find(e => e.id === activeEventId) || events[0];
  const isOrganizer = ['EVENT_LEAD', 'MANAGER', 'WORKER'].includes(currentUser.role);
  const isEventLead = currentUser.role === 'EVENT_LEAD';

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeEventId, activeChannel]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      role: currentUser.role,
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [activeEventId]: {
        ...prev[activeEventId],
        [activeChannel]: [...prev[activeEventId][activeChannel], newMsg]
      }
    }));
    setNewMessage('');
  };

  const handleKickMember = (memberId) => {
    if (!isEventLead) return;
    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEventId) {
        return { ...ev, members: ev.members.filter(m => m.id !== memberId) };
      }
      return ev;
    }));
  };

  const handleCloseEvent = () => {
    if (!isEventLead) return;
    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEventId) {
        return { ...ev, status: 'CLOSED' };
      }
      return ev;
    }));
  };

  const handleLeaveGroup = () => {
    if (currentUser.role === 'PARTICIPANT' && activeEvent.status !== 'CLOSED') {
      alert("You cannot leave this group while the event is UPCOMING or LIVE.");
      return;
    }
    alert("You have left the group.");
    // Implementation to remove user from event
  };

  const activeMessages = messages[activeEventId]?.[activeChannel] || [];

  return (
    <div className="chat-module-container fade-in">
      {/* Sidebar: Event List */}
      <div className="chat-sidebar">
        <h3 className="sidebar-title">Your Communities</h3>
        <ul className="event-list">
          {events.map(ev => (
            <li 
              key={ev.id} 
              className={`event-item ${activeEventId === ev.id ? 'active' : ''}`}
              onClick={() => setActiveEventId(ev.id)}
            >
              <div className="event-info">
                <span className="event-name">{ev.name}</span>
                <span className={`event-status badge-${ev.status.toLowerCase()}`}>{ev.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="header-info">
            <h2>{activeEvent.name}</h2>
            <div className="channel-tabs">
              <button 
                className={`channel-tab ${activeChannel === 'announcements' ? 'active' : ''}`}
                onClick={() => setActiveChannel('announcements')}
              >
                <Megaphone size={16} /> Announcements
              </button>
              <button 
                className={`channel-tab ${activeChannel === 'general' ? 'active' : ''}`}
                onClick={() => setActiveChannel('general')}
              >
                <MessageSquare size={16} /> General Q&A
              </button>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setShowMembers(!showMembers)} title="Members">
              <Users size={20} />
            </button>
            {isEventLead && activeEvent.status !== 'CLOSED' && (
               <button className="close-event-btn" onClick={handleCloseEvent} title="Close Event">
                 End Event
               </button>
            )}
            <button 
              className={`leave-btn ${(currentUser.role === 'PARTICIPANT' && activeEvent.status !== 'CLOSED') ? 'disabled' : ''}`}
              onClick={handleLeaveGroup}
              disabled={currentUser.role === 'PARTICIPANT' && activeEvent.status !== 'CLOSED'}
              title={(currentUser.role === 'PARTICIPANT' && activeEvent.status !== 'CLOSED') ? "Membership locked until event closed" : "Leave Group"}
            >
              <LogOut size={18} />
              {(currentUser.role === 'PARTICIPANT' && activeEvent.status !== 'CLOSED') && <Lock size={14} className="lock-icon" />}
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="message-list">
          {activeMessages.length === 0 ? (
            <div className="empty-state">No messages yet.</div>
          ) : (
            activeMessages.map((msg, idx) => {
              const showBadge = ['EVENT_LEAD', 'MANAGER', 'WORKER'].includes(msg.role);
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`message-wrapper ${isMe ? 'message-mine' : 'message-other'}`}>
                  <div className="message-bubble">
                    {!isMe && (
                      <div className="message-sender">
                        {msg.senderName}
                        {showBadge && (
                          <span className="role-badge" title="Organizer">
                            <ShieldCheck size={14} className="badge-icon" /> Organizer
                          </span>
                        )}
                      </div>
                    )}
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="message-input-area">
          {activeChannel === 'announcements' && !isOrganizer ? (
            <div className="restricted-input">
              <Megaphone size={16} /> Only organizers can post in Announcements.
            </div>
          ) : activeEvent.status === 'CLOSED' ? (
            <div className="restricted-input">
              <Lock size={16} /> Event is closed. Chat is read-only.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="input-form">
              <input 
                type="text" 
                placeholder={`Message #${activeChannel}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="msg-input"
              />
              <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Members Sidebar (Slide-out or inline) */}
      {showMembers && (
        <div className="members-sidebar slide-in">
          <div className="members-header">
            <h3>Community Members</h3>
            <button className="icon-btn" onClick={() => setShowMembers(false)}>
              <X size={20} />
            </button>
          </div>
          <ul className="members-list">
            {activeEvent.members.map(member => {
              const showBadge = ['EVENT_LEAD', 'MANAGER', 'WORKER'].includes(member.role);
              return (
                <li key={member.id} className="member-item">
                  <div className="member-info">
                    <span className="member-name">{member.name} {member.id === currentUser.id ? '(You)' : ''}</span>
                    {showBadge && (
                      <span className="role-badge" title="Organizer">
                        <ShieldCheck size={14} /> Organizer
                      </span>
                    )}
                  </div>
                  {isEventLead && member.id !== currentUser.id && (
                    <button className="kick-btn" onClick={() => handleKickMember(member.id)} title="Remove Participant">
                      <X size={16} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EventCommunityChat;
