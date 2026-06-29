import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OwnerDashboard from '../components/OwnerDashboard';
import StudentDashboard from '../components/StudentDashboard';

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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 capitalize">{user.role.replace('_', ' ')} Panel</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="font-medium bg-gray-100 px-4 py-2 rounded-full text-gray-700">
              {user.name} ({user.email})
            </span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition font-medium shadow-sm">
              Logout
            </button>
          </div>
        </header>

        {user.role === 'mess_owner' && <OwnerDashboard />}
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'super_admin' && (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <h2 className="text-2xl font-bold mb-4">Super Admin Dashboard</h2>
            <p className="text-gray-600">Platform-wide statistics and management coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
