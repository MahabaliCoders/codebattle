import React, { useState, useEffect } from 'react';
import { RefreshCw, PlayCircle, Loader, CheckCircle2 } from 'lucide-react';
import './ExecutionTracking.css';

const initialTasks = [
  { id: 1, title: 'Main Stage Setup', status: 'Ongoing', progress: 65, category: 'Logistics' },
  { id: 2, title: 'Registration Desk', status: 'Ongoing', progress: 32, category: 'Admin' },
  { id: 3, title: 'Catering Arrival', status: 'Pending', progress: 0, category: 'Food' },
  { id: 4, title: 'AV System Check', status: 'Completed', progress: 100, category: 'Tech' },
  { id: 5, title: 'Guest Speaker Prep', status: 'Ongoing', progress: 85, category: 'Programming' },
  { id: 6, title: 'Goodie Bags Packing', status: 'Pending', progress: 0, category: 'Logistics' },
];

const CircularProgress = ({ progress, status }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  let color = '#0071e3'; // Ongoing (Blue)
  if (status === 'Completed') color = '#34c759'; // Green
  if (status === 'Pending') color = '#ff9f0a'; // Orange
  
  return (
    <div className="circular-progress-wrapper">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle 
          cx="34" cy="34" r={radius} 
          fill="none" 
          stroke="rgba(0,0,0,0.05)" 
          strokeWidth="6" 
        />
        <circle 
          cx="34" cy="34" r={radius} 
          fill="none" 
          stroke={color} 
          strokeWidth="6" 
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="progress-ring-circle"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease' }}
        />
      </svg>
      <div className="progress-text">{Math.round(progress)}%</div>
    </div>
  );
};

const ExecutionTracking = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isSimulating, setIsSimulating] = useState(true);

  // Simulate real-time progress to create a "Live" feel
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTasks(prevTasks => prevTasks.map(task => {
        // Randomly grab one pending task if there's no ongoing to make it start
        if (task.status === 'Pending' && Math.random() > 0.8) {
           return { ...task, progress: 2, status: 'Ongoing' };
        }
        
        if (task.status === 'Ongoing' && task.progress < 100) {
          const increment = Math.random() * 8 + 2; // Random burst of 2 to 10 points
          const newProgress = Math.min(task.progress + increment, 100);
          return {
            ...task,
            progress: newProgress,
            status: newProgress === 100 ? 'Completed' : 'Ongoing'
          };
        }
        return task;
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const overallProgress = tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length;

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <PlayCircle size={14} />;
      case 'Ongoing': return <Loader size={14} className="spin-icon" />;
      case 'Completed': return <CheckCircle2 size={14} />;
      default: return null;
    }
  };

  return (
    <div className="execution-container">
      <div className="execution-header">
        <div className="header-text">
          <h1>Execution Tracking</h1>
          <p>Real-time progress monitoring for today's event operations.</p>
        </div>
        <button 
          className={`btn-simulate ${isSimulating ? 'active' : ''}`} 
          onClick={() => setIsSimulating(!isSimulating)}
        >
          <RefreshCw size={16} className={isSimulating ? 'spin-icon' : ''} />
          {isSimulating ? 'Live Syncing' : 'Paused Sync'}
        </button>
      </div>

      {/* Global Progress */}
      <div className="global-progress-card">
        <div className="global-progress-info">
          <h2>Overall Progress</h2>
          <span className="global-percentage">{Math.round(overallProgress)}%</span>
        </div>
        <div className="linear-progress-container">
          <div 
            className="linear-progress-bar global-bar" 
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="tracking-grid">
        {tasks.map(task => (
          <div key={task.id} className="task-tracking-card">
            <div className="card-top">
              <span className={`status-chip chip-${task.status.toLowerCase()}`}>
                {renderStatusIcon(task.status)}
                {task.status}
              </span>
              <span className="task-category">{task.category}</span>
            </div>
            
            <div className="card-middle">
              <CircularProgress progress={task.progress} status={task.status} />
              <h3 className="task-title">{task.title}</h3>
            </div>
            
            <div className="card-bottom">
              <div className="linear-progress-wrapper">
                <div className="linear-progress-bg">
                  <div 
                    className={`linear-progress-fill fill-${task.status.toLowerCase()}`}
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutionTracking;
