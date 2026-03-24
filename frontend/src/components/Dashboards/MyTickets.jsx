import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, QrCode as QrIcon, Download, Loader2, MapPin, X, ShieldCheck } from 'lucide-react';
import { auth, db } from '../../firebase';
import { collection, onSnapshot, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import './Dashboards.css';

const MyTickets = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeViewerTicket, setActiveViewerTicket] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const evSnap = await getDocs(collection(db, 'events'));
      const eventMap = {};
      evSnap.forEach(d => eventMap[d.id] = { id: d.id, ...d.data() });

      const unsub = onSnapshot(collection(db, 'registrations'), (snap) => {
        const myRegs = snap.docs
          .filter(d => d.data().userId === user.uid)
          .map(d => {
            const regData = d.data();
            const eventInfo = eventMap[regData.eventId] || { eventName: 'Event Details Unknown', date: 'TBA', time: 'TBA' };
            return {
              id: d.id,
              ...regData,
              ...eventInfo
            };
          });
        setUserTickets(myRegs);
        setLoading(false);
      });
      return unsub;
    };

    let unsubscriber;
    fetchData().then(u => unsubscriber = u);
    return () => { if(unsubscriber) unsubscriber(); };
  }, []);

  const handleDownloadPDF = async (ticket) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Simple Premium Ticket PDF Design
    doc.setFillColor(245, 245, 247);
    doc.rect(10, 10, 190, 80, 'F');
    doc.setFontSize(22);
    doc.setTextColor(29, 29, 31);
    doc.text(ticket.eventName, 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(134, 134, 139);
    doc.text(`Ticket ID: #${ticket.id.substring(0, 8).toUpperCase()}`, 20, 42);
    
    doc.setTextColor(81, 81, 84);
    doc.text(`Date: ${ticket.date}`, 20, 55);
    doc.text(`Time: ${ticket.time}`, 20, 65);
    doc.text(`Venue: ${ticket.venue || 'Main Campus'}`, 20, 75);
    
    doc.setDrawColor(210, 210, 215);
    doc.line(10, 100, 200, 100);
    doc.text("Official Entry Pass - CodeBattle Platform", 20, 110);
    
    doc.save(`Ticket_${ticket.id.substring(0, 5)}.pdf`);
  };

  if (loading) return (
    <div className="loading-dashboard">
      <Loader2 className="spin-icon" size={32} />
      <p>Fetching your tickets...</p>
    </div>
  );

  return (
    <div className="tickets-page-content fade-in">
      <div className="page-header">
        <h1 className="premium-header-text">My Tickets & Registrations</h1>
        <p className="premium-subtitle">Entry passes for your upcoming campus events.</p>
        <div className="live-badge-mini"><span className="live-dot"></span> Live Pass Active</div>
      </div>

      {userTickets.length > 0 ? (
        <div className="tickets-grid">
          {userTickets.map(t => (
            <div key={t.id} className="ticket-card glass-card pop-in">
              <div className="ticket-top">
                <div className="ticket-icon">
                  <Ticket className="text-primary" size={24} />
                </div>
                <div className="ticket-meta">
                  <span className="status-pill active">Confirmed</span>
                  <span className="ticket-id">#{t.id.substring(0, 8).toUpperCase()}</span>
                </div>
              </div>
              
              <div className="ticket-event-info">
                <h2 className="premium-ticket-title">{t.eventName}</h2>
                <div className="event-meta-row">
                  <div className="event-meta-item">
                    <Calendar size={14} /> <span>{t.date}</span>
                  </div>
                  <div className="event-meta-item">
                    <span className="text-secondary">@</span> <span>{t.time}</span>
                  </div>
                </div>
                <div className="event-meta-item" style={{marginTop: 8}}>
                   <MapPin size={14} /> <span>{t.venue || 'Main Campus'}</span>
                </div>
              </div>
              
              <div className="ticket-footer">
                <button className="btn-action" onClick={() => setActiveViewerTicket(t)}>
                  <QrIcon size={16} /> View QR Code
                </button>
                <button className="btn-download" title="Download Ticket PDF" onClick={() => handleDownloadPDF(t)}>
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-tickets card-glow">
          <Ticket size={48} className="text-muted" strokeWidth={1} />
          <h3>No Active Tickets</h3>
          <p>You haven't registered for any events yet. Head over to the Dashboard to join upcoming battles!</p>
        </div>
      )}

      {/* QR VIEWER MODAL */}
      {activeViewerTicket && (
        <div className="modal-overlay fade-in" onClick={() => setActiveViewerTicket(null)}>
          <div className="qr-modal-card pop-in" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveViewerTicket(null)}><X size={20}/></button>
            <div className="modal-badge"><ShieldCheck size={14}/> VERIFIED ENTRY</div>
            <h3>Digital Entry Pass</h3>
            <p className="modal-event-name">{activeViewerTicket.eventName}</p>
            
            <div className="qr-display-wrap">
               <QRCodeCanvas 
                value={activeViewerTicket.id} 
                size={200} 
                level="H" 
                includeMargin={true} 
                className="qr-actual-canvas"
               />
               <div className="scanning-line"></div>
            </div>
            
            <div className="modal-ticket-details">
               <div className="m-detail"><span>Date</span><strong>{activeViewerTicket.date}</strong></div>
               <div className="m-detail"><span>Venue</span><strong>{activeViewerTicket.venue || 'Main Campus'}</strong></div>
            </div>
            
            <div className="modal-footer-msg">Present this code at the event entrance for valid check-in.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
