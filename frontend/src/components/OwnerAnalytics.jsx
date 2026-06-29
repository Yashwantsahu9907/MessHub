import React, { useState, useEffect, useMemo } from 'react';
import messService from '../services/messService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Download, Calendar, Filter, Users, DollarSign, CheckCircle, Clock, FileSpreadsheet, FileText, Search
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { SkeletonCard, SkeletonTable } from './Skeleton';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

const OwnerAnalytics = () => {
  const [members, setMembers] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { isDark } = useTheme();

  // Filter states
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default last 30 days
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState('All');
  const [studentId, setStudentId] = useState('All');
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'payments'

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Presets
  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (mealType !== 'All') params.mealType = mealType;
      if (studentId !== 'All') params.studentId = studentId;

      const [data, memList] = await Promise.all([
        messService.getAnalytics(params),
        messService.getMessMembers()
      ]);
      setAnalyticsData(data);
      setMembers(memList);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to fetch analytics reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    setCurrentPage(1);
  }, [startDate, endDate, mealType, studentId]);

  // Export to Excel
  const exportToExcel = () => {
    if (!analyticsData) return;
    try {
      const wb = XLSX.utils.book_new();

      // 1. Attendance Sheet
      const attData = analyticsData.detailedAttendance.map(att => ({
        'Student Name': att.student?.name || 'N/A',
        'Email': att.student?.email || 'N/A',
        'Date': att.date,
        'Meal Type': att.mealType
      }));
      const attWs = XLSX.utils.json_to_sheet(attData);
      XLSX.utils.book_append_sheet(wb, attWs, "Attendance Report");

      // 2. Payments Sheet
      const payData = analyticsData.detailedPayments.map(pay => ({
        'Student Name': pay.student?.name || 'N/A',
        'Email': pay.student?.email || 'N/A',
        'Plan Name': pay.plan?.name || 'N/A',
        'Amount (INR)': pay.amount,
        'Status': pay.status.toUpperCase(),
        'Created Date': new Date(pay.createdAt).toLocaleDateString(),
        'Paid Date': pay.paidAt ? new Date(pay.paidAt).toLocaleDateString() : 'N/A'
      }));
      const payWs = XLSX.utils.json_to_sheet(payData);
      XLSX.utils.book_append_sheet(wb, payWs, "Payments Report");

      XLSX.writeFile(wb, `MessHub_Analytics_Report_${startDate}_to_${endDate}.xlsx`);
      addToast('Excel report generated successfully!', 'success');
    } catch (err) {
      addToast('Failed to export Excel report.', 'error');
    }
  };

  // Export to PDF
  const exportToPDF = (type) => {
    if (!analyticsData) return;
    try {
      const doc = new jsPDF();
      const isAttendance = type === 'attendance';
      const timestamp = new Date().toLocaleString();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229); // Indigo color
      doc.text("MessHub Analytics & Reports", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Report Type: ${isAttendance ? 'Attendance Detail' : 'Billing & Payments'}`, 14, 28);
      doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 34);
      doc.text(`Generated At: ${timestamp}`, 14, 40);

      doc.setFillColor(243, 244, 246);
      doc.rect(14, 46, 182, 18, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      
      if (isAttendance) {
        doc.text(`Total Attendance Scans: ${analyticsData.summary.totalAttendance}`, 18, 57);
        doc.text(`Active Registered Members: ${analyticsData.summary.activeMembersCount}`, 110, 57);
      } else {
        doc.text(`Total Revenue Collected: INR ${analyticsData.summary.totalRevenue}`, 18, 57);
        doc.text(`Pending Payments: ${analyticsData.summary.pendingPaymentsCount}`, 110, 57);
      }

      let tableHeaders = [];
      let tableRows = [];

      if (isAttendance) {
        tableHeaders = [['Student Name', 'Email Address', 'Scan Date', 'Meal Type']];
        tableRows = analyticsData.detailedAttendance.map(att => [
          att.student?.name || 'N/A',
          att.student?.email || 'N/A',
          att.date,
          att.mealType
        ]);
      } else {
        tableHeaders = [['Student Name', 'Plan Name', 'Amount (INR)', 'Status', 'Paid Date']];
        tableRows = analyticsData.detailedPayments.map(pay => [
          pay.student?.name || 'N/A',
          pay.plan?.name || 'N/A',
          `INR ${pay.amount}`,
          pay.status.toUpperCase(),
          pay.paidAt ? new Date(pay.paidAt).toLocaleDateString() : 'N/A'
        ]);
      }

      doc.autoTable({
        startY: 70,
        head: tableHeaders,
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 },
        margin: { top: 70 }
      });

      doc.save(`MessHub_${type}_report_${startDate}_to_${endDate}.pdf`);
      addToast('PDF report generated successfully!', 'success');
    } catch (err) {
      addToast('Failed to export PDF report.', 'error');
    }
  };

  // Filter logs based on search query
  const filteredAttendance = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.detailedAttendance.filter((att) => {
      const name = att.student?.name?.toLowerCase() || '';
      const email = att.student?.email?.toLowerCase() || '';
      const meal = att.mealType?.toLowerCase() || '';
      const query = searchTerm.toLowerCase();
      return name.includes(query) || email.includes(query) || meal.includes(query);
    });
  }, [analyticsData, searchTerm]);

  const filteredPayments = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.detailedPayments.filter((pay) => {
      const name = pay.student?.name?.toLowerCase() || '';
      const plan = pay.plan?.name?.toLowerCase() || '';
      const status = pay.status?.toLowerCase() || '';
      const query = searchTerm.toLowerCase();
      return name.includes(query) || plan.includes(query) || status.includes(query);
    });
  }, [analyticsData, searchTerm]);

  // Paginated outputs
  const paginatedAttendance = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAttendance.slice(start, start + itemsPerPage);
  }, [filteredAttendance, currentPage]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const totalPages = useMemo(() => {
    const count = activeTab === 'attendance' ? filteredAttendance.length : filteredPayments.length;
    return Math.max(1, Math.ceil(count / itemsPerPage));
  }, [activeTab, filteredAttendance, filteredPayments]);

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4">
          <SkeletonTable rows={3} cols={4} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const { summary, attendanceStats, mealStats, revenueStats, memberGrowthStats } = analyticsData || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm space-y-4 transition-colors duration-300">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold border-b border-gray-100 dark:border-gray-800 pb-3">
          <Filter size={18} />
          <h2 className="text-sm font-extrabold tracking-tight">Report Filters & Presets</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Start Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none"
              />
              <Calendar size={14} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">End Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none"
              />
              <Calendar size={14} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {/* Meal Type Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Meal Type</label>
            <select 
              value={mealType} 
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none"
            >
              <option value="All">All Meals</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          {/* Member Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Filter by Student</label>
            <select 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none"
            >
              <option value="All">All Students</option>
              {members.map(member => (
                <option key={member._id} value={member._id}>{member.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date presets */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => applyPreset(1)} className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-105 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-850 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition">Yesterday</button>
            <button onClick={() => applyPreset(7)} className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-105 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-850 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition">Last 7 Days</button>
            <button onClick={() => applyPreset(30)} className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 dark:border-indigo-950 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-400 transition">Last 30 Days</button>
            <button onClick={() => applyPreset(90)} className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-105 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-850 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition">Last 90 Days</button>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <FileSpreadsheet size={14} /> Export Excel
            </button>
            <button 
              onClick={() => exportToPDF(activeTab)}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <FileText size={14} /> Export Active Tab PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtered Attendance</p>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white">{summary.totalAttendance} scans</h3>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3.5 rounded-2xl text-indigo-600 dark:text-indigo-400"><Users size={22} /></div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-450">₹{summary.totalRevenue}</h3>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl text-emerald-600 dark:text-emerald-400"><DollarSign size={22} /></div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Members</p>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white">{summary.activeMembersCount}</h3>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl text-blue-600 dark:text-blue-400"><CheckCircle size={22} /></div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Invoices</p>
            <h3 className="text-2xl font-black text-amber-500">{summary.pendingPaymentsCount}</h3>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl text-amber-600 dark:text-amber-400"><Clock size={22} /></div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm transition-colors">
          <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider mb-4">Attendance Trends</h3>
          <div className="h-64">
            {attendanceStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">No attendance records in range</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceStats} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1f2937' : '#f3f4f6'} />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: isDark ? '#9ca3af' : '#4b5563'}} />
                  <YAxis tick={{fontSize: 10, fill: isDark ? '#9ca3af' : '#4b5563'}} />
                  <Tooltip contentStyle={{backgroundColor: isDark ? '#111827' : '#ffffff', border: isDark ? '1px solid #374151' : 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: 11}} />
                  <Line type="monotone" dataKey="Breakfast" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Lunch" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Dinner" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm transition-colors">
          <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider mb-4">Revenue Trends</h3>
          <div className="h-64">
            {revenueStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">No payments collected in range</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueStats} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1f2937' : '#f3f4f6'} />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: isDark ? '#9ca3af' : '#4b5563'}} />
                  <YAxis tick={{fontSize: 10, fill: isDark ? '#9ca3af' : '#4b5563'}} />
                  <Tooltip contentStyle={{backgroundColor: isDark ? '#111827' : '#ffffff', border: isDark ? '1px solid #374151' : 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="amount" name="Revenue (₹)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Meal Consumption Breakdown */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-855 shadow-sm transition-colors">
          <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider mb-4">Meal Consumption Breakdown</h3>
          <div className="h-60 flex items-center">
            {summary.totalAttendance === 0 ? (
              <div className="w-full text-center text-sm text-gray-500 italic">No consumption records</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Breakfast', count: mealStats.Breakfast, fill: '#f59e0b' },
                  { name: 'Lunch', count: mealStats.Lunch, fill: '#10b981' },
                  { name: 'Dinner', count: mealStats.Dinner, fill: '#3b82f6' }
                ]} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1f2937' : '#f3f4f6'} />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: isDark ? '#9ca3af' : '#4b5563'}} />
                  <YAxis tick={{fontSize: 11, fill: isDark ? '#9ca3af' : '#4b5563'}} />
                  <Tooltip cursor={{fill: isDark ? '#1f2937' : '#f9fafb'}} contentStyle={{backgroundColor: isDark ? '#111827' : '#ffffff', border: isDark ? '1px solid #374151' : 'none', borderRadius: '12px'}} />
                  <Bar dataKey="count" name="Meals Eaten" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Member Growth */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm transition-colors">
          <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider mb-4">Member Growth Timeline</h3>
          <div className="h-60">
            {memberGrowthStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">No growth records in range</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memberGrowthStats} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1f2937' : '#f3f4f6'} />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: isDark ? '#9ca3af' : '#4b5563'}} />
                  <YAxis tick={{fontSize: 10, fill: isDark ? '#9ca3af' : '#4b5563'}} />
                  <Tooltip contentStyle={{backgroundColor: isDark ? '#111827' : '#ffffff', border: isDark ? '1px solid #374151' : 'none', borderRadius: '12px'}} />
                  <Line type="monotone" dataKey="count" name="Total Members" stroke="#6366f1" strokeWidth={2.5} dot={{ stroke: '#6366f1', strokeWidth: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Reports Tab Container */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-850 overflow-hidden transition-colors">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
          <button 
            onClick={() => {
              setActiveTab('attendance');
              setCurrentPage(1);
              setSearchTerm('');
            }}
            className={`px-6 py-4 font-bold text-sm transition focus:outline-none flex items-center gap-2 border-b-2 ${
              activeTab === 'attendance' 
                ? 'border-indigo-600 text-indigo-650 dark:text-indigo-400 bg-white dark:bg-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850'
            }`}
          >
            Attendance Logs ({filteredAttendance.length})
          </button>
          <button 
            onClick={() => {
              setActiveTab('payments');
              setCurrentPage(1);
              setSearchTerm('');
            }}
            className={`px-6 py-4 font-bold text-sm transition focus:outline-none flex items-center gap-2 border-b-2 ${
              activeTab === 'payments' 
                ? 'border-indigo-600 text-indigo-650 dark:text-indigo-400 bg-white dark:bg-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850'
            }`}
          >
            Billing & Invoices ({filteredPayments.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          
          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <input 
              type="text"
              placeholder={`Search ${activeTab === 'attendance' ? 'by student or meal...' : 'by student, plan, or status...'}`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none focus:bg-white dark:focus:bg-gray-900 transition-colors"
            />
            <Search size={14} className="absolute left-3 top-3.5 text-gray-400" />
          </div>

          {activeTab === 'attendance' ? (
            /* Attendance Logs Table */
            <div className="space-y-4">
              {filteredAttendance.length === 0 ? (
                <EmptyState 
                  title="No Attendance Logs Found" 
                  description="We couldn't find any scans matching your criteria. Try adjusting the dates or searching for another student." 
                />
              ) : (
                <>
                  <div className="overflow-x-auto rounded-2xl border border-gray-105 dark:border-gray-850">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="p-4 rounded-l-lg">Student Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Date</th>
                          <th className="p-4 rounded-r-lg">Meal Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                        {paginatedAttendance.map(att => (
                          <tr key={att._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition">
                            <td className="p-4 text-xs font-bold text-gray-800 dark:text-gray-200">{att.student?.name || 'N/A'}</td>
                            <td className="p-4 text-xs text-gray-500 dark:text-gray-400">{att.student?.email || 'N/A'}</td>
                            <td className="p-4 text-xs font-bold text-gray-800 dark:text-gray-200">{att.date}</td>
                            <td className="p-4 text-xs">
                              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                                att.mealType === 'Breakfast' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                                att.mealType === 'Lunch' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450' :
                                'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                              }`}>
                                {att.mealType}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          ) : (
            /* Payments Logs Table */
            <div className="space-y-4">
              {filteredPayments.length === 0 ? (
                <EmptyState 
                  title="No Invoices Found" 
                  description="No payments or billing reports match the selected filters. Try broadening the start and end dates." 
                />
              ) : (
                <>
                  <div className="overflow-x-auto rounded-2xl border border-gray-105 dark:border-gray-850">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="p-4 rounded-l-lg">Student Name</th>
                          <th className="p-4">Plan</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 rounded-r-lg">Paid At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                        {paginatedPayments.map(pay => (
                          <tr key={pay._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition">
                            <td className="p-4 text-xs font-bold text-gray-800 dark:text-gray-200">{pay.student?.name || 'N/A'}</td>
                            <td className="p-4 text-xs text-gray-500 dark:text-gray-400">{pay.plan?.name || 'N/A'}</td>
                            <td className="p-4 text-xs font-bold text-indigo-650 dark:text-indigo-400">₹{pay.amount}</td>
                            <td className="p-4 text-xs">
                              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                                pay.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450' :
                                pay.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                                'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-450'
                              }`}>
                                {pay.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                              {pay.paidAt ? new Date(pay.paidAt).toLocaleString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerAnalytics;
