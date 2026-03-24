import React, { useState } from 'react';
import { Plus, Calendar, User as UserIcon, X } from 'lucide-react';
import './TaskAssignment.css';

const initialTasks = [
  { id: 't1', title: 'Design Event Poster', assignee: 'Alice M.', deadline: 'Oct 10', priority: 'high', status: 'todo' },
  { id: 't2', title: 'Book Main Auditorium', assignee: 'Bob J.', deadline: 'Oct 5', priority: 'medium', status: 'todo' },
  { id: 't3', title: 'Send VIP Invitations', assignee: 'Charlie K.', deadline: 'Oct 1', priority: 'high', status: 'inProgress' },
  { id: 't4', title: 'Initial Budget Approval', assignee: 'Eve S.', deadline: 'Sep 25', priority: 'low', status: 'done' },
];

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

const TaskAssignment = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignee: '', deadline: '', priority: 'medium' });

  // Drag and Drop Handlers
  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
    // Setup for smooth visual handling
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    setDraggedTaskId(null);
    e.target.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedTaskId) {
      setTasks(tasks.map(t => 
        t.id === draggedTaskId ? { ...t, status } : t
      ));
    }
    setDraggedTaskId(null);
  };

  // Create Task Handler
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    setTasks([...tasks, {
      ...newTask,
      id: `t${Date.now()}`,
      status: 'todo'
    }]);
    
    setNewTask({ title: '', assignee: '', deadline: '', priority: 'medium' });
    setIsPanelOpen(false);
  };

  return (
    <div className="task-board-container">
      <div className="board-header">
        <div>
          <h1>Task Board</h1>
          <p>Organize and track event tasks.</p>
        </div>
        <button className="btn-create-task" onClick={() => setIsPanelOpen(true)}>
          <Plus size={18} /> New Task
        </button>
      </div>

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
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className="task-card"
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
            </div>
          </div>
        ))}
      </div>

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
