import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from './pages/AdminDashboard';
import AdminMovies from './pages/AdminMovies';
import AdminAddMovie from './pages/AdminAddMovie';
import AdminEditMovie from './pages/AdminEditMovie';
import AdminSettings from './pages/AdminSettings';
import './styles/admin.css';

export default function AdminApp() {
  return (
    <div className="admin">
      <AdminSidebar />
      <div className="admin__main">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/movies" element={<AdminMovies />} />
          <Route path="/add" element={<AdminAddMovie />} />
          <Route path="/edit/:id" element={<AdminEditMovie />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
}
