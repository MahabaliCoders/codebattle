import React from 'react';
import { DownloadCloud } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import './Report.css';

const performanceData = [
  { month: 'Jan', performance: 65 },
  { month: 'Feb', performance: 78 },
  { month: 'Mar', performance: 82 },
  { month: 'Apr', performance: 70 },
  { month: 'May', performance: 89 },
  { month: 'Jun', performance: 95 },
  { month: 'Jul', performance: 100 },
];

const participationData = [
  { dept: 'CS', attendees: 400 },
  { dept: 'Arts', attendees: 250 },
  { dept: 'Business', attendees: 300 },
  { dept: 'Engineering', attendees: 450 },
  { dept: 'Science', attendees: 200 },
];

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
  return (
    <div className="report-dashboard">
      <div className="report-header">
        <div>
          <h1>Analytics & Reports</h1>
          <p>Review event performance and campus engagement metrics.</p>
        </div>
        <button className="btn-export">
          <DownloadCloud size={16} />
          Export CSV
        </button>
      </div>

      <div className="report-grid">
        {/* Line Chart Card */}
        <div className="analytics-card full-width">
          <div className="card-header">
             <h2>Event Performance Over Time</h2>
             <span className="card-subtitle">Year-to-date success rate (%)</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8E93', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8E93', fontSize: 12, fontWeight: 500 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E5EA', strokeWidth: 1 }} />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  name="Performance"
                  stroke="#0071E3" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#FFFFFF', stroke: '#0071E3', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#0071E3', strokeWidth: 0, boxShadow: '0 0 10px rgba(0,113,227,0.5)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="analytics-card half-width">
          <div className="card-header">
             <h2>Participation by Department</h2>
             <span className="card-subtitle">Total attendees across all events</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                <XAxis 
                  dataKey="dept" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8E93', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8E93', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar 
                  dataKey="attendees" 
                  name="Attendees"
                  fill="#5AC8FA" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="analytics-card half-width summary-card">
          <div className="summary-item">
            <span className="summary-label">Total Events Hosted</span>
            <span className="summary-value">124</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <span className="summary-label">Average Attendance</span>
            <span className="summary-value">320</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <span className="summary-label">Total Participants</span>
            <span className="summary-value">1,600</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
