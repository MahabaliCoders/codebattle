import React, { useState, useEffect } from 'react';
import { Users, Search, DownloadCloud, FileText } from 'lucide-react';
import './ParticipantRegistration.css';
import { db } from '../../firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';

const ParticipantRegistration = () => {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Users & Events for cross-referencing
      const usersSnap = await getDocs(collection(db, 'users'));
      const evSnap = await getDocs(collection(db, 'events'));
      
      const usersMap = {};
      usersSnap.forEach(d => usersMap[d.id] = d.data());
      
      const eventsMap = {};
      evSnap.forEach(d => eventsMap[d.id] = d.data());

      // 2. Stream Registrations joining references
      const unsub = onSnapshot(collection(db, 'registrations'), (snap) => {
        const enriched = snap.docs.map(doc => {
          const reg = doc.data();
          const pUser = usersMap[reg.userId] || { name: 'Unknown Data', college: 'Not Provided' };
          const pEvent = eventsMap[reg.eventId] || { eventName: 'Removed Event', eventType: 'General' };
          
          return {
            id: doc.id,
            fullName: pUser.name || 'Anonymous User',
            email: reg.userEmail || pUser.email || '--',
            college: pUser.college || '--',
            eventName: pEvent.eventName || 'Unknown',
            participationType: pEvent.eventType || 'General',
            registrationDate: reg.registeredAt?.seconds ? new Date(reg.registeredAt.seconds * 1000).toLocaleDateString() : 'Today'
          };
        });
        setParticipants(enriched);
      });
      return unsub;
    };
    
    let unsubscriber;
    fetchData().then(unsub => { unsubscriber = unsub; });
    return () => { if (unsubscriber) unsubscriber(); };
  }, []);

  const filteredParticipants = participants.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="participants-dashboard">
      <div className="participants-header">
        <div>
          <h1>Participant Directory</h1>
          <p>Manage and track all registered attendees.</p>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search participants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-export-records">
            <DownloadCloud size={16} /> Export
          </button>
        </div>
      </div>

      <div className="participants-card">
        <table className="participants-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Participant Details</th>
              <th>Event Registered</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map(participant => (
              <tr key={participant.id}>
                <td className="id-col">{participant.id}</td>
                <td>
                  <div className="participant-info">
                    <span className="p-name">{participant.fullName}</span>
                    <span className="p-email">{participant.email}</span>
                    <span className="p-college">{participant.college}</span>
                  </div>
                </td>
                <td className="event-col">{participant.eventName}</td>
                <td>
                  <span className={`type-badge ${participant.participationType.toLowerCase()}`}>
                    {participant.participationType}
                  </span>
                </td>
                <td className="date-col">{participant.registrationDate}</td>
                <td>
                  <span className="status-badge success">Registered</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredParticipants.length === 0 && (
          <div className="empty-records">
            <FileText size={48} color="#d2d2d7" />
            <h3>No participants found</h3>
            <p>Once attendees register from the User Dashboard, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantRegistration;
