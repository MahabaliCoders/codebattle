import React, { useState, useEffect } from 'react';
import { DownloadCloud, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import './Report.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">
          <span className="tooltip-dot" style={{ backgroundColor: payload[0].color }}></span>
          {payload[0].name}: <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const Report = () => {
  const [stats, setStats] = useState({ events: 0, participants: 0, chartData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get Events for names mapping
      const evSnap = await getDocs(collection(db, 'events'));
      const eventMap = {};
      evSnap.forEach(d => eventMap[d.id] = d.data().eventName || 'Unnamed Event');
      
      const eventCounts = {};
      evSnap.forEach(d => eventCounts[d.id] = 0);

      // 2. Listen to Registrations for live count & chart
      const unsub = onSnapshot(collection(db, 'registrations'), (snap) => {
        const totalParticipants = snap.size;
        
        // Reset counts
        Object.keys(eventCounts).forEach(k => eventCounts[k] = 0);
        
        snap.forEach(doc => {
          const reg = doc.data();
          if (eventCounts[reg.eventId] !== undefined) {
             eventCounts[reg.eventId]++;
          }
        });

        const barData = Object.entries(eventCounts).map(([id, count]) => ({
          name: eventMap[id] || 'Event',
          attendees: count
        })).slice(0, 5); // top 5 for cleaner chart

        setStats({
          events: evSnap.size,
          participants: totalParticipants,
          chartData: barData
        });
        setLoading(false);
      });
      return unsub;
    };

    let unsubscriber;
    fetchData().then(u => unsubscriber = u);
    return () => { if(unsubscriber) unsubscriber(); };
  }, []);

  const performanceMock = [
    { month: 'Jan', performance: 65 },
    { month: 'Feb', performance: 78 },
    { month: 'Mar', performance: 82 },
    { month: 'Current', performance: 95 },
  ];

  if (loading) return <div className="loading-state"><Loader2 className="spin-icon" /> Computing Campus Metrics...</div>;

  return (
    <div className="report-dashboard fade-in">
      <div className="report-header">
        <div>
          <h1>Analytics & Reports</h1>
          <p>Real-time campus engagement metrics from live database.</p>
        </div>
        <button className="btn-export">
          <DownloadCloud size={16} /> Export Data
        </button>
      </div>

      <div className="report-grid">
        <div className="analytics-card full-width">
          <div className="card-header">
             <h2>Success Momentum</h2>
             <span className="card-subtitle">Platform performance trend (%)</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceMock} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E5EA', strokeWidth: 1 }} />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#0071E3" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#FFFFFF', stroke: '#0071E3', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card half-width">
          <div className="card-header">
             <h2>Participation by Event</h2>
             <span className="card-subtitle">Real-time attendee distribution</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="attendees" name="Attendees" fill="#5AC8FA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="analytics-card half-width summary-card">
          <div className="summary-item">
            <span className="summary-label">Total Events Hosted</span>
            <span className="summary-value">{stats.events}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <span className="summary-label">Average Engagement</span>
            <span className="summary-value">{stats.events > 0 ? Math.round(stats.participants / stats.events) : 0} per event</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <span className="summary-label">Platform Participants</span>
            <span className="summary-value">{stats.participants}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
