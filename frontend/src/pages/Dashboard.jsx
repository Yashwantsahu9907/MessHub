import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium">{user.email}</span>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
            Logout
          </button>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-2">Attendance</h3>
          <p className="text-gray-600">Scan QR to mark attendance.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-2">Billing</h3>
          <p className="text-gray-600">View current month bills.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-2">Announcements</h3>
          <p className="text-gray-600">Check latest mess updates.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
