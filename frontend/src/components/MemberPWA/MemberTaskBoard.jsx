import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Play, Check } from 'lucide-react';
import './MemberTaskBoard.css';

/**
 * Deliverable 1: Member Fetch Logic (Frontend)
 */
const MemberTaskBoard = ({ workerId = 'w1' }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Initial Fetch logic on mount
    const fetchMemberTasks = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/tasks/member/${workerId}`);
        if (!response.ok) throw new Error("Could not load tasks.");
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberTasks();
  }, [workerId]);

  /**
   * Deliverable 2: Task Completion Logic (Frontend)
   */
  const handleMarkComplete = async (taskId) => {
    // Step A: Optimistic UI Update (Immediate visual feedback)
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED' } : t));

    try {
      // Step B: Fire the PATCH request to the backend
      const response = await fetch(`http://localhost:5001/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });

      if (!response.ok) throw new Error("Failed to sync completion status.");
      
      const resData = await response.json();
      console.log("Task Synced successfully:", resData.task);
    } catch (err) {
      console.error("Critical Sync Error:", err);
      // Revert if sync fails
      setTasks(originalTasks);
      alert(`Sync Error: ${err.message}. Reverting status.`);
    }
  };

  if (loading) return <div className="pwa-loading">Syncing secure tasks...</div>;

  return (
    <div className="member-task-board">
       <div className="board-header-pwa">
          <h2>Assigned Ops</h2>
          <span className="task-pill">{tasks.filter(t => t.status !== 'COMPLETED').length} Active</span>
       </div>

       <div className="task-list-pwa">
          {tasks.map(task => (
             <div 
               key={task.id} 
               className={`pwa-task-card ${task.status === 'COMPLETED' ? 'completed' : ''}`}
             >
                <div className="task-card-main">
                  <div className="priority-indicator" data-priority={task.priority}></div>
                  <div className="task-text">
                    <h4>{task.title}</h4>
                    <p>{task.status} | Priority: {task.priority.toUpperCase()}</p>
                  </div>
                </div>

                {task.status !== 'COMPLETED' && (
                  <button 
                    className="pwa-complete-btn" 
                    onClick={() => handleMarkComplete(task.id)}
                  >
                    <Check size={20} /> Mark Done
                  </button>
                )}
                
                {task.status === 'COMPLETED' && (
                  <div className="completed-badge">
                     <CheckCircle size={18} /> Synced
                  </div>
                )}
             </div>
          ))}

          {tasks.length === 0 && <p className="empty-tasks">No tasks assigned yet. Stay on standby.</p>}
       </div>
    </div>
  );
};

export default MemberTaskBoard;
