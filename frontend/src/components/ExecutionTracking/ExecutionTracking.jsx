import React, { useState, useEffect } from 'react';
import { RefreshCw, PlayCircle, Loader, CheckCircle2, Minus, Plus } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import './ExecutionTracking.css';

const CircularProgress = ({ progress, status }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  let color = '#0071e3'; // Ongoing (Blue)
  if (status === 'done') color = '#34c759'; // Green
  if (status === 'todo') color = '#ff9f0a'; // Orange
  
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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'user';
  const canEdit = ['lead', 'event-lead', 'event lead'].includes(userRole);
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(d => ({
        id: d.id,
        progress: d.data().progress || 0,
        ...d.data()
      }));
      setTasks(taskList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProgress = async (taskId, currentProgress, increment) => {
    if (!canEdit) return;
    const newProgress = Math.min(Math.max(currentProgress + increment, 0), 100);
    const status = newProgress === 100 ? 'done' : (newProgress === 0 ? 'todo' : 'inProgress');
    
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        progress: newProgress,
        status: status
      });
    } catch (err) {
      console.error("Error updating task progress:", err);
    }
  };

  const getOverallProgress = () => {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    return Math.round(totalProgress / tasks.length);
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <PlayCircle size={14} />;
      case 'inProgress': return <Loader size={14} className="spin-icon" />;
      case 'done': return <CheckCircle2 size={14} />;
      default: return null;
    }
  };

  const statusMap = {
    'todo': 'Pending',
    'inProgress': 'Ongoing',
    'done': 'Completed'
  };

  if (loading) return <div className="loading-state">Syncing live operations...</div>;

  return (
    <div className="execution-container fade-in">
      <div className="execution-header">
        <div className="header-text">
          <h1>Execution Tracking</h1>
          <p>{isAdmin ? 'Supervisory Oversight: Real-time progress monitoring (Read-only).' : 'Real-time progress monitoring matched with live Firestore data.'}</p>
        </div>
        <div className="header-badges">
          {isAdmin && <span className="admin-view-tag">Supervisory View</span>}
          <div className="live-badge">
             <span className="live-dot"></span> Live Sync Active
          </div>
        </div>
      </div>

      <div className="global-progress-card">
        <div className="global-progress-info">
          <h2>Overall Completion</h2>
          <span className="global-percentage">{getOverallProgress()}%</span>
        </div>
        <div className="linear-progress-container">
          <div 
            className="linear-progress-bar global-bar" 
            style={{ width: `${getOverallProgress()}%` }}
          ></div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-tracking">
          <p>No tasks found. Add tasks in the Task Board to track them here.</p>
        </div>
      ) : (
        <div className="tracking-grid">
          {tasks.map(task => (
            <div key={task.id} className="task-tracking-card project-card">
              <div className="card-top">
                <span className={`status-chip chip-${task.status}`}>
                  {renderStatusIcon(task.status)}
                  {statusMap[task.status] || 'Unknown'}
                </span>
                <span className="task-category">{task.priority?.toUpperCase()} PRIORITY</span>
              </div>
              
              <div className="card-middle">
                <CircularProgress progress={task.progress || 0} status={task.status} />
                <h3 className="task-title-execution">{task.title}</h3>
              </div>
              
              <div className="card-bottom-premium">
                 <div className="progress-controls-modern">
                    {canEdit && (
                      <div className="stepper-controls">
                        <button className="stepper-btn" onClick={() => handleUpdateProgress(task.id, task.progress || 0, -10)} disabled={(task.progress || 0) <= 0}>
                           <Minus size={16} />
                        </button>
                        <button className="stepper-btn" onClick={() => handleUpdateProgress(task.id, task.progress || 0, 10)} disabled={(task.progress || 0) >= 100}>
                           <Plus size={16} />
                        </button>
                      </div>
                    )}
                    
                    <div className="linear-progress-wrapper-premium" style={{flex: 1}}>
                      <div className="linear-progress-bg-premium">
                        <div 
                          className={`linear-progress-fill fill-${task.status}`}
                          style={{ width: `${task.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="linear-percentage-text">{task.progress || 0}%</div>
                    </div>
                 </div>
                 <div className="assignee-footer-text">
                   <div className="assignee-label">Assignee:</div>
                   <div className="assignee-name-val">{task.assignee || 'nitu'}</div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExecutionTracking;
