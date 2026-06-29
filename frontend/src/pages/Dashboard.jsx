import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OwnerDashboard from '../components/OwnerDashboard';
import StudentDashboard from '../components/StudentDashboard';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import { LogOut, User as UserIcon } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

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
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 font-medium capitalize mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user.role === 'super_admin' ? 'bg-purple-500' : user.role === 'mess_owner' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
              {user.role.replace('_', ' ')} Portal
            </p>
          </div>
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <NotificationBell />
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <div className="bg-gray-200 p-1.5 rounded-full"><UserIcon size={18} className="text-gray-600"/></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-none">{user.name}</span>
                <span className="text-xs text-gray-500 mt-1 leading-none">{user.email}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition font-medium shadow-sm">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Dashboard Rendering */}
        <div className="animate-fade-in-up">
          {user.role === 'mess_owner' && <OwnerDashboard />}
          {user.role === 'student' && <StudentDashboard />}
          {user.role === 'super_admin' && <SuperAdminDashboard />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
