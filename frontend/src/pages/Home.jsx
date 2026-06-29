import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ShieldCheck, TrendingUp, Users, Moon, Sun, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <Utensils size={20} />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              MessHub
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-500 dark:text-gray-400 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-100 dark:shadow-none transition flex items-center gap-1.5"
            >
              Log In <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center max-w-7xl mx-auto px-6 py-20 lg:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              ✨ Modern Mess Operations
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Streamline Your{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 bg-clip-text text-transparent">
                Mess Management
              </span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              An all-in-one multi-tenant system for instant QR code attendance, automated student billing, plan management, real-time alerts, and advanced platform aggregation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition text-center text-base"
              >
                Get Started Now
              </Link>
              <Link
                to="/login"
                className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 px-8 py-4 rounded-2xl font-bold transition text-center text-base"
              >
                Sign In Portal
              </Link>
            </div>
          </div>

          {/* Feature Grid / Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3.5 rounded-2xl text-indigo-600 dark:text-indigo-400 w-fit">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-extrabold text-lg text-gray-800 dark:text-gray-200">Instant Scans</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                Students scan the unique mess QR code to record attendance in milliseconds.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl text-emerald-600 dark:text-emerald-400 w-fit">
                <TrendingUp size={24} />
              </div>
              <h3 className="font-extrabold text-lg text-gray-800 dark:text-gray-200">Revenue Analytics</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                Mess owners track profit, member growth, and payments through aggregation charts.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl text-blue-600 dark:text-blue-400 w-fit">
                <Users size={24} />
              </div>
              <h3 className="font-extrabold text-lg text-gray-800 dark:text-gray-200">Multi-Tenant Isolation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                Perfect database boundaries isolate mess owners and student dashboards.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="bg-purple-50 dark:bg-purple-950/40 p-3.5 rounded-2xl text-purple-600 dark:text-purple-400 w-fit">
                <Utensils size={24} />
              </div>
              <h3 className="font-extrabold text-lg text-gray-800 dark:text-gray-200">Super Admin Panel</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                Centralized dashboard to manage settings, approve messes, and broadcast notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center text-xs text-gray-400 transition-colors">
        <p>&copy; {new Date().getFullYear()} MessHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
