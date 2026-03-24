const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

// Mock database (In production, this would be MongoDB/Firestore)
let tasks = [
  { id: 't1', title: 'Design Event Poster', assigned_to: 'w1', attendee: 'Admin', priority: 'high', status: 'TODO', createdAt: new Date() },
  { id: 't2', title: 'Setup Stage Lighting', assigned_to: 'w2', attendee: 'Lead', priority: 'medium', status: 'IN_PROGRESS', createdAt: new Date() },
];

/**
 * Deliverable 1: Member Fetch Logic (GET /api/tasks/member/:worker_id)
 */
app.get('/api/tasks/member/:worker_id', (req, res) => {
  const { worker_id } = req.params;
  const filteredTasks = tasks.filter(t => t.assigned_to === worker_id);
  res.status(200).json(filteredTasks);
});

/**
 * Deliverable 2: Task Completion Logic (PATCH /api/tasks/:task_id/status)
 */
app.patch('/api/tasks/:task_id/status', (req, res) => {
  const { task_id } = req.params;
  const { status } = req.body;
  
  const taskIndex = tasks.findIndex(t => t.id === task_id);
  
  if (taskIndex !== -1) {
    tasks[taskIndex] = { 
      ...tasks[taskIndex], 
      status: status.toUpperCase(),
      completed_at: status.toUpperCase() === 'COMPLETED' ? new Date().toISOString() : null
    };

    const updatedTask = tasks[taskIndex];

    // Deliverable 3: Socket.io Emit Success
    io.emit('task_status_updated', updatedTask);
    
    return res.status(200).json({ success: true, task: updatedTask });
  }
  
  res.status(404).json({ error: 'Task not found' });
});

// Broadcast simple connection logs
io.on('connection', (socket) => {
  console.log(`Lead Dashboard Connected: ${socket.id}`);
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Project Antigravity Sync Server active on port ${PORT}`);
});
