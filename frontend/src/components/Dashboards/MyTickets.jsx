import React from 'react';
import { Ticket, Calendar, QrCode, Download } from 'lucide-react';

const MyTickets = () => {
  const tickets = [
    { id: 'TKT-102', event: 'Cultural Fest 2026', date: 'Nov 02, 2026', time: '10:00 AM', status: 'Active' },
    { id: 'TKT-103', event: 'Web Development Bootcamp', date: 'Sep 30, 2026', time: '02:00 PM', status: 'Waitlist' },
  ];

  return (
    <div className="tickets-page-content fade-in">
      <div className="page-header">
        <h1>My Tickets & Registrations</h1>
        <p>Manage your entry passes for upcoming campus events.</p>
      </div>

      <div className="tickets-grid">
        {tickets.map(t => (
          <div key={t.id} className="ticket-card glass-card">
            <div className="ticket-top">
              <div className="ticket-icon">
                <Ticket className="text-primary" size={24} />
              </div>
              <div className="ticket-meta">
                <span className={`status-pill ${t.status.toLowerCase()}`}>{t.status}</span>
                <span className="ticket-id">{t.id}</span>
              </div>
            </div>
            
            <div className="ticket-event-info">
              <h2>{t.event}</h2>
              <div className="event-meta-row">
                <div className="event-meta-item">
                  <Calendar size={14} /> <span>{t.date}</span>
                </div>
                <div className="event-meta-item">
                  <span className="text-secondary">@</span> <span>{t.time}</span>
                </div>
              </div>
            </div>
            
            <div className="ticket-footer">
              {t.status === 'Active' ? (
                <button className="btn-action">
                  <QrCode size={16} /> View QR Code
                </button>
              ) : (
                <button className="btn-action disabled" disabled>
                  Waiting for Approval
                </button>
              )}
              <button className="btn-download" title="Download PDF"><Download size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTickets;
