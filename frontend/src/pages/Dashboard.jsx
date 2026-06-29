import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import OwnerDashboard from '../components/OwnerDashboard';
import StudentDashboard from '../components/StudentDashboard';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import { LogOut, User as UserIcon, Moon, Sun, Utensils } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import ConfirmationDialog from '../components/ConfirmationDialog';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-850 transition-colors duration-300 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <Utensils size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">MessHub</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold capitalize mt-0.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${user.role === 'super_admin' ? 'bg-purple-500' : user.role === 'mess_owner' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                {user.role.replace('_', ' ')} Portal
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500 dark:text-gray-400 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* User Profile Info */}
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
              <div className="bg-gray-200 dark:bg-gray-800 p-1.5 rounded-full text-gray-600 dark:text-gray-400"><UserIcon size={16} /></div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-800 dark:text-gray-200 leading-none">{user.name}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-none">{user.email}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 transition font-bold shadow-sm text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Dashboard Portal Content */}
        <div className="animate-fade-in-up">
          {user.role === 'mess_owner' && <OwnerDashboard />}
          {user.role === 'student' && <StudentDashboard />}
          {user.role === 'super_admin' && <SuperAdminDashboard />}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Sign Out"
        message="Are you sure you want to end your current session? You will need to enter your email and password to log in again."
        confirmText="Logout"
        type="danger"
      />
    </div>
  );
};

export default Dashboard;
