import React, { useEffect, useState, useMemo } from 'react';
import messService from '../services/messService';
import { Users, CheckCircle, Clock, CreditCard, Utensils, TrendingUp, Plus, Receipt, Search, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import OwnerAnalytics from './OwnerAnalytics';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import ConfirmationDialog from './ConfirmationDialog';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import { SkeletonCard, SkeletonTable } from './Skeleton';

const mockAttendanceData = [
  { day: 'Mon', count: 45 },
  { day: 'Tue', count: 52 },
  { day: 'Wed', count: 49 },
  { day: 'Thu', count: 60 },
  { day: 'Fri', count: 55 },
  { day: 'Sat', count: 30 },
  { day: 'Sun', count: 20 },
];

const OwnerDashboard = () => {
  const [messProfile, setMessProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { isDark } = useTheme();

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals & Confirmation States
  const [dashboardTab, setDashboardTab] = useState('overview'); // 'overview' | 'analytics'
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', durationDays: 30, mealsIncluded: 60, price: 3000 });
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Dialog configurations
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning' });

  const fetchData = async () => {
    try {
      const [profileData, reqsData, memsData, plansData, payData] = await Promise.all([
        messService.getMessProfile(),
        messService.getJoinRequests(),
        messService.getMessMembers(),
        messService.getPlans(),
        messService.getOwnerPayments()
      ]);
      setMessProfile(profileData);
      setRequests(reqsData);
      setMembers(memsData);
      setPlans(plansData);
      setPayments(payData);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleNewNotification = () => {
      fetchData();
    };
    window.addEventListener('new_notification', handleNewNotification);
    return () => window.removeEventListener('new_notification', handleNewNotification);
  }, []);

  const openDialog = (title, message, onConfirm, type = 'warning') => {
    setDialogConfig({ isOpen: true, title, message, onConfirm, type });
  };

  const handleProcessRequest = async (id, status) => {
    try {
      await messService.processJoinRequest(id, status);
      addToast(`Join request successfully ${status}!`, 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error processing request', 'error');
    }
  };

  const triggerRemoveMember = (member) => {
    openDialog(
      'Remove Member',
      `Are you sure you want to remove ${member.name} from your mess? All plan benefits and histories will be detached.`,
      async () => {
        try {
          await messService.removeMember(member._id);
          addToast('Member removed successfully.', 'success');
          fetchData();
        } catch (err) {
          addToast(err.response?.data?.message || 'Error removing member', 'error');
        }
      },
      'danger'
    );
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await messService.createPlan(newPlan);
      addToast('New subscription plan created!', 'success');
      setShowPlanForm(false);
      setNewPlan({ name: '', durationDays: 30, mealsIncluded: 60, price: 3000 });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error creating plan', 'error');
    }
  };

  const triggerAssignPlanModal = (student) => {
    if (plans.length === 0) {
      addToast('Please create at least one plan first.', 'warning');
      return;
    }
    setAssigningStudent(student);
    setSelectedPlanId(plans[0]._id);
  };

  const handleAssignPlanSubmit = async (e) => {
    e.preventDefault();
    if (!assigningStudent || !selectedPlanId) return;

    try {
      await messService.assignPlan(assigningStudent._id, selectedPlanId);
      addToast(`Plan assigned to ${assigningStudent.name}! Payment invoice generated.`, 'success');
      setAssigningStudent(null);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error assigning plan', 'error');
    }
  };

  const triggerMarkPaid = (payment) => {
    openDialog(
      'Confirm Payment',
      `Mark the payment of ₹${payment.amount} by ${payment.student?.name} as PAID? This will instantly credit meals to the student's account.`,
      async () => {
        try {
          await messService.updatePaymentStatus(payment._id, 'paid');
          addToast('Payment marked as paid and balance credited!', 'success');
          fetchData();
        } catch (err) {
          addToast(err.response?.data?.message || 'Error updating payment', 'error');
        }
      },
      'info'
    );
  };

  // Memoized Search & Paginated Members
  const filteredMembers = useMemo(() => {
    return members.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  }, [filteredMembers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={3} cols={4} />
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 rounded-3xl shadow-sm gap-2 transition-colors duration-300">
        <button 
          onClick={() => setDashboardTab('overview')}
          className={`px-5 py-2.5 font-bold text-sm rounded-2xl transition ${
            dashboardTab === 'overview' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none' 
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          Dashboard Overview
        </button>
        <button 
          onClick={() => setDashboardTab('analytics')}
          className={`px-5 py-2.5 font-bold text-sm rounded-2xl transition ${
            dashboardTab === 'analytics' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none' 
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          Analytics & Reports
        </button>
      </div>

      {dashboardTab === 'analytics' ? (
        <OwnerAnalytics />
      ) : (
        <>
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Members</p>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white">{members.length}</h3>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3.5 rounded-2xl text-indigo-650 dark:text-indigo-405"><Users size={22} /></div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Attendance</p>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white">45</h3>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl text-emerald-600 dark:text-emerald-400"><CheckCircle size={22} /></div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Requests</p>
                <h3 className="text-2xl font-black text-gray-850 dark:text-white">{requests.length}</h3>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl text-amber-600 dark:text-amber-400"><Clock size={22} /></div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Payments</p>
                <h3 className="text-2xl font-black text-rose-500">{pendingPayments.length}</h3>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-2xl text-rose-600 dark:text-rose-400"><CreditCard size={22} /></div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (QR & Chart) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Setup / QR */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl shadow-md text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black">{messProfile.name}</h3>
                  <p className="text-indigo-100 text-xs max-w-sm leading-relaxed font-medium">Share your unique join code or display the QR code in your dining hall so students can request access to your mess.</p>
                  <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-6 py-3">
                    <p className="text-[10px] text-indigo-150 uppercase tracking-wider font-extrabold mb-0.5">Join Code</p>
                    <p className="text-2xl font-mono font-bold tracking-widest">{messProfile.joinCode}</p>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0">
                  <img src={messProfile.qrCode} alt="Mess QR Code" className="w-32 h-32" />
                </div>
              </div>

              {/* Attendance Chart */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-605"/> Weekly Scan Volume
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockAttendanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1f2937' : '#f3f4f6'} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11}} />
                      <Tooltip cursor={{fill: isDark ? '#1f2937' : '#f9fafb'}} contentStyle={{backgroundColor: isDark ? '#111827' : '#ffffff', border: isDark ? '1px solid #374151' : 'none', borderRadius: '12px'}} />
                      <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Plans Section */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Receipt size={18} className="text-emerald-500"/> Subscription Plans
                  </h3>
                  <button 
                    onClick={() => setShowPlanForm(!showPlanForm)} 
                    className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition"
                  >
                    <Plus size={14} /> New Plan
                  </button>
                </div>

                {showPlanForm && (
                  <form onSubmit={handleCreatePlan} className="bg-gray-50 dark:bg-gray-950 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end animate-scale-up">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Plan Name</label>
                      <input 
                        type="text" 
                        value={newPlan.name} 
                        onChange={e => setNewPlan({...newPlan, name: e.target.value})} 
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none" 
                        required 
                        placeholder="e.g. 30 Days Premium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Days</label>
                      <input 
                        type="number" 
                        value={newPlan.durationDays} 
                        onChange={e => setNewPlan({...newPlan, durationDays: e.target.value})} 
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none" 
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Meals</label>
                      <input 
                        type="number" 
                        value={newPlan.mealsIncluded} 
                        onChange={e => setNewPlan({...newPlan, mealsIncluded: e.target.value})} 
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none" 
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Price (₹)</label>
                      <input 
                        type="number" 
                        value={newPlan.price} 
                        onChange={e => setNewPlan({...newPlan, price: e.target.value})} 
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none" 
                        required
                      />
                    </div>
                    <div className="sm:col-span-4 flex justify-end gap-2 mt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowPlanForm(false)} 
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-750 transition"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-indigo-650 hover:bg-indigo-755 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
                      >
                        Save Plan
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.length === 0 ? (
                    <div className="md:col-span-2">
                      <EmptyState 
                        title="No subscription plans" 
                        description="You haven't configured any plans yet. Create one to assign meal limits to students." 
                      />
                    </div>
                  ) : (
                    plans.map(plan => (
                      <div key={plan._id} className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20 shadow-sm space-y-2">
                        <h4 className="font-extrabold text-gray-800 dark:text-gray-200 text-base">{plan.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{plan.durationDays} Days • {plan.mealsIncluded} Meals</p>
                        <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg">₹{plan.price}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Column (Requests & Activity) */}
            <div className="space-y-6">
              
              {/* Join Requests */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm h-[320px] flex flex-col transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Pending Requests</h3>
                  <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-405 px-2.5 py-0.5 rounded-full text-xs font-bold">{requests.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  {requests.length === 0 ? (
                    <EmptyState 
                      title="No Join Requests" 
                      description="No pending student requests found." 
                    />
                  ) : (
                    requests.map(req => (
                      <div key={req._id} className="p-3.5 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-850/20 transition bg-white dark:bg-gray-900 shadow-sm space-y-3">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">{req.student.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{req.student.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleProcessRequest(req._id, 'approved')} 
                            className="flex-1 bg-indigo-650 hover:bg-indigo-755 text-white py-1.5 rounded-xl text-xs font-bold shadow-sm transition"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleProcessRequest(req._id, 'rejected')} 
                            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-1.5 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-750 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Recent Payments Widget */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm h-[380px] flex flex-col transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Recent Payments</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  {payments.length === 0 ? (
                    <EmptyState 
                      title="No Payments Logged" 
                      description="No payment records registered yet." 
                    />
                  ) : (
                    payments.slice(0, 5).map(pay => (
                      <div key={pay._id} className="p-3.5 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/20 shadow-sm">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">{pay.student?.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">{pay.plan?.name}</p>
                        </div>
                        <div className="text-right space-y-1.5">
                          <p className="font-black text-indigo-650 dark:text-indigo-400 text-xs">₹{pay.amount}</p>
                          {pay.status === 'pending' ? (
                            <button 
                              onClick={() => triggerMarkPaid(pay)} 
                              className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-705 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-bold hover:bg-amber-100 transition focus:outline-none"
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450 px-2.5 py-0.5 rounded-full font-bold inline-block">Paid</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Members Section */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm transition-colors">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 border-b border-gray-50 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Utensils size={18} className="text-blue-500"/> Member Management
                </h3>
              </div>
              
              <div className="relative w-full md:w-72">
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-250 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none"
                />
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            {members.length === 0 ? (
              <EmptyState 
                title="No active members yet" 
                description="Share your join code with students to build up your active member roster." 
              />
            ) : filteredMembers.length === 0 ? (
              <EmptyState 
                title="No members match search" 
                description="We couldn't find any active members matching that name or email address." 
              />
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-gray-105 dark:border-gray-850">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="p-4 rounded-l-lg">Student Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Balance</th>
                        <th className="p-4 rounded-r-lg text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                      {paginatedMembers.map(member => (
                        <tr key={member._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition">
                          <td className="p-4 text-xs font-bold text-gray-800 dark:text-gray-200">{member.name}</td>
                          <td className="p-4 text-xs text-gray-500 dark:text-gray-400">{member.email}</td>
                          <td className="p-4 text-xs font-bold text-indigo-650 dark:text-indigo-400">{member.mealBalance || 0} meals</td>
                          <td className="p-4 text-right flex items-center justify-end gap-3">
                            <button 
                              onClick={() => triggerAssignPlanModal(member)} 
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-805 dark:hover:text-indigo-305 text-xs font-bold transition flex items-center gap-1 focus:outline-none"
                            >
                              <Plus size={12}/> Assign Plan
                            </button>
                            <button 
                              onClick={() => triggerRemoveMember(member)} 
                              className="text-rose-500 hover:text-rose-700 text-xs font-bold transition focus:outline-none"
                            >
                              Remove
                            </button>
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
        </>
      )}

      {/* Global Dialog Component */}
      <ConfirmationDialog
        isOpen={dialogConfig.isOpen}
        onClose={() => setDialogConfig({ ...dialogConfig, isOpen: false })}
        onConfirm={dialogConfig.onConfirm}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
      />

      {/* Assign Plan Modal */}
      {assigningStudent && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAssigningStudent(null)}></div>
          <form 
            onSubmit={handleAssignPlanSubmit} 
            className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-5 animate-scale-up"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-850">
              <h3 className="text-base font-extrabold text-gray-805 dark:text-white uppercase tracking-wider">Assign Meal Plan</h3>
              <button 
                type="button" 
                onClick={() => setAssigningStudent(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-850">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigning to student</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{assigningStudent.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{assigningStudent.email}</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Select Subscription Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none"
                >
                  {plans.map(plan => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} - {plan.mealsIncluded} Meals (₹{plan.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setAssigningStudent(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-750 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Assign & Invoice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
