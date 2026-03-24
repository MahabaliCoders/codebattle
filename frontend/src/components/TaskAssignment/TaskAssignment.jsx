import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User as UserIcon, X, ChevronRight } from 'lucide-react';
import { db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import './TaskAssignment.css';

const columns = [
  { id: 'todo', title: 'Pending' },
  { id: 'inProgress', title: 'Ongoing' },
  { id: 'done', title: 'Completed' }
];

const TaskAssignment = () => {
  const [tasks, setTasks] = useState([]);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', assignee: '', deadline: '', priority: 'medium', progress: 0 });
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'user';
  const canManage = ['lead', 'event-lead'].includes(userRole);
  const isAdmin = userRole === 'admin';

  // Listen for real-time task updates
  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(taskList);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Drag and Drop Handlers
  const handleDragStart = (e, id) => {
    if (!canManage) return; 
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    setDraggedTaskId(null);
    e.target.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    if (!canManage) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (draggedTaskId && canManage) {
      try {
        const taskRef = doc(db, 'tasks', draggedTaskId);
        await updateDoc(taskRef, { status });
      } catch (err) {
        console.error("Error updating task status:", err);
      }
    }
    setDraggedTaskId(null);
  };

  // Create Task Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !canManage) return;
    
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        status: 'todo',
        createdAt: serverTimestamp()
      });
      
      setNewTask({ title: '', assignee: '', deadline: '', priority: 'medium', progress: 0 });
      setIsPanelOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  return (
    <div className="task-board-container">
      <div className="board-header">
        <div className="welcome-tag">COORDINATOR PORTAL</div>
        <h1 className="board-title-text">Event Ops & Logistics</h1>
        <p className="board-subtitle">
          {canManage 
            ? 'Strategic center for managing sound, decoration, and goodies.' 
            : isAdmin 
              ? 'Supervisory View: Monitoring operational progress of event leads.' 
              : 'Read-only View: Current event task statuses.'}
        </p>
        
        {canManage && (
          <button className="btn-add-major" onClick={() => setIsPanelOpen(true)}>
            <Plus size={20} /> Assign New Task
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="loading-tasks">Loading logistics feed...</div>
      ) : (
        <div className="kanban-layout">
          {columns.map(col => (
            <div 
              key={col.id} 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="column-header">
                <div className={`col-dot-premium dot-${col.id}`}></div>
                <h3>{col.title}</h3>
                <span className="task-count-premium">{tasks.filter(t => t.status === col.id).length}</span>
              </div>
              
              <div className="column-body">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div 
                    key={task.id}
                    draggable={canManage}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`task-card-premium ${!canManage ? 'no-drag' : ''}`}
                  >
                    <div className="task-card-branding">
                      <div className="status-flow-wrap">
                        <span className={`status-pill-mini status-${task.status}`}>
                          {task.status === 'inProgress' ? 'Ongoing' : task.status === 'done' ? 'Completed' : 'Pending'}
                        </span>
                        {task.status !== 'done' && <ChevronRight size={14} className="status-next-arrow" />}
                      </div>
                      <span className={`priority-label-text p-${task.priority}`}>
                        {task.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>

                    <h4 className="premium-task-title">{task.title}</h4>

                    <div className="task-progress-section">
                       <div className="progress-info">
                          <span>Progress</span>
                          <strong>{task.progress || 50}%</strong>
                       </div>
                       <div className="premium-progress-bg">
                          <div className="premium-progress-fill" style={{width: `${task.progress || 50}%`}}></div>
                       </div>
                    </div>

                    <div className="task-bottom-meta">
                      <div className="t-meta-block">
                        <UserIcon size={12} /> 
                        <span className="assignee-tag">Assignee:</span>
                        <span className="assignee-val">{task.assignee || 'nitu'}</span>
                      </div>
                      <div className="t-meta-block">
                        <Calendar size={12} /> 
                        <span>{task.deadline || 'TBA'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="empty-column-placeholder">No tasks recorded</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-out Create Task Panel */}
      <div className={`side-panel-overlay ${isPanelOpen ? 'open' : ''}`} onClick={() => setIsPanelOpen(false)}></div>
      <div className={`create-task-panel ${isPanelOpen ? 'open' : ''}`}>
        <div className="panel-top-bar">
          <div className="panel-icon-wrap"><Plus size={20} color="#007aff"/></div>
          <h2>Create New Task</h2>
          <button className="close-panel-btn" onClick={() => setIsPanelOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <form className="create-task-form-modern" onSubmit={handleCreateTask}>
          <div className="form-section">
            <label>Task Mission Title</label>
            <input 
              type="text" 
              className="premium-input-field" 
              placeholder="E.g. Confirm Catering Menu" 
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-section">
              <label>Assignee</label>
              <input 
                type="text" 
                className="premium-input-field" 
                placeholder="Name or Email" 
                value={newTask.assignee}
                onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
              />
            </div>
            <div className="form-section">
              <label>Deadline</label>
              <input 
                type="text" 
                className="premium-input-field" 
                placeholder="E.g. Oct 15" 
                value={newTask.deadline}
                onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
              />
            </div>
          </div>

          <div className="form-section">
            <label>Priority Matrix</label>
            <div className="priority-horizontal-scroll">
               <button 
                  type="button" 
                  className={`p-btn p-low ${newTask.priority === 'low' ? 'active' : ''}`}
                  onClick={() => setNewTask({...newTask, priority: 'low'})}
               >Low</button>
               <button 
                  type="button" 
                  className={`p-btn p-medium ${newTask.priority === 'medium' ? 'active' : ''}`}
                  onClick={() => setNewTask({...newTask, priority: 'medium'})}
               >Medium</button>
               <button 
                  type="button" 
                  className={`p-btn p-high ${newTask.priority === 'high' ? 'active' : ''}`}
                  onClick={() => setNewTask({...newTask, priority: 'high'})}
               >High</button>
               <button 
                  type="button" 
                  className={`p-btn p-urgent ${newTask.priority === 'urgent' ? 'active' : ''}`}
                  onClick={() => setNewTask({...newTask, priority: 'urgent'})}
               >Urgent</button>
            </div>
          </div>

          <div className="form-actions-fixed">
            <button type="button" className="action-btn-secondary" onClick={() => setIsPanelOpen(false)}>Discard</button>
            <button type="submit" className="action-btn-primary">Initialize Task</button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default TaskAssignment;
