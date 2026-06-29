import React, { useState, useEffect } from 'react';
import messService from '../services/messService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Download, Calendar, Filter, Users, DollarSign, CheckCircle, Clock, FileSpreadsheet, FileText, ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OwnerAnalytics = () => {
  const [members, setMembers] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    setError('');
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
      setError(err.response?.data?.message || 'Failed to fetch analytics reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate, mealType, studentId]);

  // Export to Excel (multiple sheets)
  const exportToExcel = () => {
    if (!analyticsData) return;
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

    // Save Workbook
    XLSX.writeFile(wb, `MessHub_Analytics_Report_${startDate}_to_${endDate}.xlsx`);
  };

  // Export to PDF (specific to active tab)
  const exportToPDF = (type) => {
    if (!analyticsData) return;
    const doc = jsPDF();
    const isAttendance = type === 'attendance';
    const timestamp = new Date().toLocaleString();

    // PDF Styling
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

    // Summary box
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

    // Table Data
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
  };

  if (loading && !analyticsData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { summary, attendanceStats, mealStats, revenueStats, memberGrowthStats, detailedAttendance, detailedPayments } = analyticsData || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold border-b border-gray-100 pb-3">
          <Filter size={18} />
          <h2>Report Filters & Presets</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Start Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none"
              />
              <Calendar size={14} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">End Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none"
              />
              <Calendar size={14} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Meal Type Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Meal Type</label>
            <select 
              value={mealType} 
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none appearance-none bg-no-repeat bg-[right_12px_center]"
            >
              <option value="All">All Meals</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          {/* Member Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Filter by Student</label>
            <select 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none"
            >
              <option value="All">All Students</option>
              {members.map(member => (
                <option key={member._id} value={member._id}>{member.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date presets */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => applyPreset(1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-xs font-semibold text-gray-600 transition">Yesterday</button>
            <button onClick={() => applyPreset(7)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-xs font-semibold text-gray-600 transition">Last 7 Days</button>
            <button onClick={() => applyPreset(30)} className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg text-xs font-semibold text-indigo-700 transition">Last 30 Days</button>
            <button onClick={() => applyPreset(90)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-xs font-semibold text-gray-600 transition">Last 90 Days</button>
            <button onClick={() => applyPreset(365)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-xs font-semibold text-gray-600 transition">Last 1 Year</button>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
            >
              <FileSpreadsheet size={14} /> Export Excel
            </button>
            <button 
              onClick={() => exportToPDF(activeTab)}
              className="flex items-center gap-1.5 bg-rose-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-700 transition"
            >
              <FileText size={14} /> Export Active Tab PDF
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 bg-red-50 border border-red-100 p-4 rounded-xl text-center">{error}</div>}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Filtered Attendance</p>
            <h3 className="text-2xl font-bold text-gray-800">{summary.totalAttendance} scans</h3>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Users size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-emerald-600">₹{summary.totalRevenue}</h3>
          </div>
          <div className="bg-emerald-50 p-3 rounded-full text-emerald-600"><DollarSign size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Members</p>
            <h3 className="text-2xl font-bold text-gray-800">{summary.activeMembersCount}</h3>
          </div>
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-600"><CheckCircle size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
            <h3 className="text-2xl font-bold text-orange-500">{summary.pendingPaymentsCount}</h3>
          </div>
          <div className="bg-orange-50 p-3 rounded-full text-orange-600"><Clock size={24} /></div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Trends */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4">Attendance Trends</h3>
          <div className="h-64">
            {attendanceStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">No attendance records in range</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceStats} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: 12}} />
                  <Line type="monotone" dataKey="Breakfast" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Lunch" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Dinner" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4">Revenue Trends</h3>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="amount" name="Revenue (₹)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Meal Consumption Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4">Meal Consumption Statistics</h3>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="count" name="Meals Eaten" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Member Growth */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4">Member Growth Timeline</h3>
          <div className="h-60">
            {memberGrowthStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">No growth records in range</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memberGrowthStats} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Line type="monotone" dataKey="count" name="Total Members" stroke="#6366f1" strokeWidth={2.5} dot={{ stroke: '#6366f1', strokeWidth: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Reports Tab Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`px-6 py-4 font-bold text-sm transition focus:outline-none flex items-center gap-2 border-b-2 ${
              activeTab === 'attendance' 
                ? 'border-indigo-600 text-indigo-600 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Attendance Logs ({detailedAttendance.length})
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-4 font-bold text-sm transition focus:outline-none flex items-center gap-2 border-b-2 ${
              activeTab === 'payments' 
                ? 'border-indigo-600 text-indigo-600 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Billing & Invoices ({detailedPayments.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'attendance' ? (
            /* Attendance Logs Table */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-800 text-sm">Attendance Logs ({detailedAttendance.length} scans found)</h4>
              </div>

              {detailedAttendance.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">No attendance records found for current filters.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="p-3 text-xs font-bold text-gray-600 rounded-l-lg">Student Name</th>
                        <th className="p-3 text-xs font-bold text-gray-600">Email</th>
                        <th className="p-3 text-xs font-bold text-gray-600">Date</th>
                        <th className="p-3 text-xs font-bold text-gray-600 rounded-r-lg">Meal Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedAttendance.map(att => (
                        <tr key={att._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                          <td className="p-3 text-sm font-medium text-gray-800">{att.student?.name || 'N/A'}</td>
                          <td className="p-3 text-sm text-gray-500">{att.student?.email || 'N/A'}</td>
                          <td className="p-3 text-sm font-bold text-gray-800">{att.date}</td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              att.mealType === 'Breakfast' ? 'bg-amber-100 text-amber-700' :
                              att.mealType === 'Lunch' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {att.mealType}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Payments Logs Table */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-800 text-sm">Billing & Payments logs ({detailedPayments.length} records found)</h4>
              </div>

              {detailedPayments.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">No payment records found for current filters.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="p-3 text-xs font-bold text-gray-600 rounded-l-lg">Student Name</th>
                        <th className="p-3 text-xs font-bold text-gray-600">Plan</th>
                        <th className="p-3 text-xs font-bold text-gray-600">Amount</th>
                        <th className="p-3 text-xs font-bold text-gray-600">Status</th>
                        <th className="p-3 text-xs font-bold text-gray-600 rounded-r-lg">Paid At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedPayments.map(pay => (
                        <tr key={pay._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                          <td className="p-3 text-sm font-medium text-gray-800">{pay.student?.name || 'N/A'}</td>
                          <td className="p-3 text-sm text-gray-500">{pay.plan?.name || 'N/A'}</td>
                          <td className="p-3 text-sm font-bold text-indigo-600">₹{pay.amount}</td>
                          <td className="p-3 text-sm">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              pay.status === 'paid' ? 'bg-green-100 text-green-700' :
                              pay.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {pay.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-500">
                            {pay.paidAt ? new Date(pay.paidAt).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerAnalytics;
