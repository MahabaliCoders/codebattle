import React from 'react';
import Login from './components/Login/Login';
import EventPlanning from './components/EventPlanning/EventPlanning';
import TaskAssignment from './components/TaskAssignment/TaskAssignment';
import ParticipantRegistration from './components/ParticipantRegistration/ParticipantRegistration';
import EventSchedule from './components/EventSchedule/EventSchedule';
import ExecutionTracking from './components/ExecutionTracking/ExecutionTracking';
import Report from './components/Report/Report';
import AlertNotification from './components/AlertNotification/AlertNotification';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>College Event Management System</h1>
      </header>
      <main className="modules-grid">
        <Login />
        <EventPlanning />
        <TaskAssignment />
        <ParticipantRegistration />
        <EventSchedule />
        <ExecutionTracking />
        <Report />
        <AlertNotification />
      </main>
    </div>
  );
}

export default App;
