import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login/Login';
import Signup from './components/Login/Signup';
import DashboardLayout from './components/Layout/DashboardLayout';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import EventLeadDashboard from './components/Dashboards/EventLeadDashboard';
import UserDashboard from './components/Dashboards/UserDashboard';
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
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* All Dashboard routes nested under DashboardLayout for sidebar visibility */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="event-lead" element={<EventLeadDashboard />} />
            <Route path="user" element={<UserDashboard />} />
            <Route path="planning" element={<EventPlanning />} />
            <Route path="tasks" element={<TaskAssignment />} />
            <Route path="participants" element={<ParticipantRegistration />} />
            <Route path="schedule" element={<EventSchedule />} />
            <Route path="tracking" element={<ExecutionTracking />} />
            <Route path="reports" element={<Report />} />
            <Route path="alerts" element={<AlertNotification />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
