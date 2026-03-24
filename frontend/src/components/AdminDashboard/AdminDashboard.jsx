import React, { useState } from 'react';
import './AdminDashboard.css';
import { Calendar, CheckCircle2, AlertCircle, Eye, Check, X } from 'lucide-react';

const AdminDashboard = () => {
  const [events, setEvents] = useState([
    { id: 'EVT-1001', name: 'Annual Tech Symposium', date: 'Oct 15, 2026', status: 'Pending' },
    { id: 'EVT-1002', name: 'Cultural Fest 2026', date: 'Nov 02, 2026', status: 'Active' },
    { id: 'EVT-1003', name: 'AI Workshop', date: 'Sep 28, 2026', status: 'Approved' },
    { id: 'EVT-1004', name: 'Sports Meet', date: 'Dec 10, 2026', status: 'Pending' },
  ]);

  const handleApprove = (id) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, status: 'Approved' } : ev));
  };

  const handleReject = (id) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, status: 'Rejected' } : ev));
  };

  const renderStatus = (status) => {
    switch(status) {
      case 'Pending': return <span className="status-badge status-pending">Pending</span>;
      case 'Active': return <span className="status-badge status-active">Active</span>;
      case 'Approved': return <span className="status-badge status-approved">Approved</span>;
      case 'Rejected': return <span className="status-badge status-rejected">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Manage and track all college events efficiently.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue-bg">
            <Calendar size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Events</h3>
            <p className="metric-value">24</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon orange-bg">
            <AlertCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>Pending Approvals</h3>
            <p className="metric-value">2</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon green-bg">
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-content">
            <h3>Active Events</h3>
            <p className="metric-value">6</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Event Approvals</h2>
          <button className="view-all-btn">View All</button>
        </div>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event ID</th>
              <th>Event Name</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td className="font-mono text-muted">{ev.id}</td>
                <td className="font-medium">{ev.name}</td>
                <td>{ev.date}</td>
                <td>{renderStatus(ev.status)}</td>
                <td>
                  <div className="action-buttons">
                    {ev.status === 'Pending' ? (
                      <>
                        <button className="action-btn btn-approve" onClick={() => handleApprove(ev.id)} title="Approve">
                          <Check size={16} /> Approve
                        </button>
                        <button className="action-btn btn-reject" onClick={() => handleReject(ev.id)} title="Reject">
                          <X size={16} /> Reject
                        </button>
                      </>
                    ) : (
                      <button className="action-btn btn-outline" title="View Details">
                        <Eye size={16} /> View
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center empty-state">No events available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
