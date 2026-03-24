import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User as UserIcon, X } from 'lucide-react';
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
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

const TaskAssignment = () => {
  const [tasks, setTasks] = useState([]);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', assignee: '', deadline: '', priority: 'medium' });
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'user';
  const canManage = ['admin', 'lead', 'event-lead'].includes(userRole);

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
    if (!canManage) return; // Only leads can move tasks
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
      
      setNewTask({ title: '', assignee: '', deadline: '', priority: 'medium' });
      setIsPanelOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  return (
    <div className="task-board-container">
      <div className="board-header">
        <div>
          <h1>Task Board</h1>
          <p>{canManage ? 'Organize and track event tasks.' : 'View your assigned tasks and progress.'}</p>
        </div>
        {canManage && (
          <button className="btn-create-task" onClick={() => setIsPanelOpen(true)}>
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="loading-tasks">Loading board...</div>
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
                <h3>{col.title}</h3>
                <span className="task-count">{tasks.filter(t => t.status === col.id).length}</span>
              </div>
              
              <div className="column-body">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div 
                    key={task.id}
                    draggable={canManage}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`task-card ${!canManage ? 'no-drag' : ''}`}
                  >
                    <div className="task-card-header">
                      <span className={`priority-dot priority-${task.priority}`} title={`Priority: ${task.priority}`}></span>
                    </div>
                    <h4 className="task-title">{task.title}</h4>
                    <div className="task-footer">
                      <div className="task-meta">
                        <UserIcon size={14} />
                        <span>{task.assignee || 'Unassigned'}</span>
                      </div>
                      <div className="task-meta">
                        <Calendar size={14} />
                        <span>{task.deadline || 'No date'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="empty-column-placeholder">No tasks here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-out Create Task Panel */}
      <div className={`side-panel-overlay ${isPanelOpen ? 'open' : ''}`} onClick={() => setIsPanelOpen(false)}></div>
      <div className={`create-task-panel ${isPanelOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <h2>Create New Task</h2>
          <button className="close-panel-btn" onClick={() => setIsPanelOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <form className="create-task-form" onSubmit={handleCreateTask}>
          <div className="form-group">
            <label>Task Title</label>
            <input 
              type="text" 
              className="clean-input" 
              placeholder="E.g. Confirm Catering Menu" 
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Assign To</label>
            <input 
              type="text" 
              className="clean-input" 
              placeholder="Name or Email" 
              value={newTask.assignee}
              onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Deadline</label>
            <input 
              type="text" 
              className="clean-input" 
              placeholder="E.g. Oct 15" 
              value={newTask.deadline}
              onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <div className="priority-selector">
              <label className="radio-label">
                <input type="radio" value="low" checked={newTask.priority === 'low'} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} />
                <span className="dot dot-low"></span> Low
              </label>
              <label className="radio-label">
                <input type="radio" value="medium" checked={newTask.priority === 'medium'} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} />
                <span className="dot dot-medium"></span> Medium
              </label>
              <label className="radio-label">
                <input type="radio" value="high" checked={newTask.priority === 'high'} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} />
                <span className="dot dot-high"></span> High
              </label>
            </div>
          </div>

          <div className="panel-footer">
            <button type="button" className="btn-cancel" onClick={() => setIsPanelOpen(false)}>Cancel</button>
            <button type="submit" className="btn-submit">Add Task</button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default TaskAssignment;
