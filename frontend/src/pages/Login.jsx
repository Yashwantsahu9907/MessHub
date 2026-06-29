import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Utensils, Moon, Sun, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await login({ email, password });
      addToast('Welcome back to MessHub!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col justify-center items-center p-4 relative">
      {/* Header theme button on top-right */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-500 dark:text-gray-400 transition"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Login Card */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-xl max-w-md w-full space-y-6 transition-colors duration-300">
        
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-md shadow-indigo-200 dark:shadow-none w-fit mx-auto animate-bounce">
            <Utensils size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white">Sign In to MessHub</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Multi-tenant mess attendance & billing portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-gray-900 transition-colors"
                required
              />
              <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-gray-900 transition-colors"
                required
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-bold transition shadow-lg shadow-indigo-100 dark:shadow-none text-sm disabled:bg-indigo-300 dark:disabled:bg-indigo-850 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
