import React, { useState, useEffect, useMemo } from 'react';
import messService from '../services/messService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle, Clock, CreditCard, Calendar, User, Bell, Utensils, Receipt, MessageSquare, AlertCircle, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import QRScanner from './QRScanner';
import { SkeletonCard, SkeletonTable } from './Skeleton';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import ConfirmationDialog from './ConfirmationDialog';

const StudentDashboard = () => {
  const { user, fetchUser } = useAuth();
  const { notifications } = useSocket();
  const { addToast } = useToast();
  const { isDark } = useTheme();

  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMess, setActiveMess] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingMess, setLoadingMess] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '' });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Pagination for Payments Table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning' });

  useEffect(() => {
    const initDashboard = async () => {
      await fetchUser();
    };
    initDashboard();
  }, []);

  const fetchPaymentsAndMess = async () => {
    if (user?.activeMess) {
      try {
        const [messData, payData] = await Promise.all([
          messService.getStudentMess(),
          messService.getStudentPayments()
        ]);
        setActiveMess(messData);
        setPayments(payData);
      } catch (err) {
        console.error('No active mess or error fetching:', err);
      }
    }
    setLoadingMess(false);
  };

  useEffect(() => {
    fetchPaymentsAndMess();
  }, [user]);

  useEffect(() => {
    const handleNewNotification = () => {
      fetchUser();
      fetchPaymentsAndMess();
    };
    window.addEventListener('new_notification', handleNewNotification);
    return () => window.removeEventListener('new_notification', handleNewNotification);
  }, [user]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setLoading(true);
    try {
      const data = await messService.requestJoin(joinCode);
      addToast(data.message || 'Join request sent successfully!', 'success');
      setJoinCode('');
      fetchUser();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send request. Check your join code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (scannedCode) => {
    setShowScanner(false);
    setLoadingMess(true);
    
    let codeToSend = scannedCode;
    try {
      const parsed = JSON.parse(scannedCode);
      if (parsed.code) codeToSend = parsed.code;
    } catch (e) {}

    try {
      const data = await messService.markAttendance(codeToSend);
      addToast(`${data.message}! Registered meal: ${data.mealType}`, 'success');
      await fetchUser();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to record attendance', 'error');
    } finally {
      setLoadingMess(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintForm.title || !complaintForm.description) return;
    setSubmittingComplaint(true);
    try {
      await messService.submitComplaint(complaintForm);
      addToast('Your complaint was filed and routed to the Super Admin.', 'success');
      setComplaintForm({ title: '', description: '' });
      setShowComplaintModal(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit complaint', 'error');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Memoized Paginated Payments
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return payments.slice(start, start + itemsPerPage);
  }, [payments, currentPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(payments.length / itemsPerPage));
  }, [payments]);

  const triggerMakePayment = () => {
    addToast('Payment gateway is ready to receive integration.', 'info');
  };

  if (loadingMess) {
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

  if (activeMess) {
    const mealBalance = user.mealBalance || 0;
    const planExpiry = user.planExpiry ? new Date(user.planExpiry) : null;
    const isExpired = planExpiry && planExpiry < new Date();
    const hasPendingPayment = payments.some(p => p.status === 'pending');
    
    // Pie Chart Data
    const totalMeals = 30; // Default base limit
    const attended = Math.max(0, totalMeals - mealBalance);
    const mockPieData = [
      { name: 'Attended', value: attended > 0 ? attended : 1, color: '#10B981' },
      { name: 'Remaining', value: mealBalance, color: isDark ? '#1f2937' : '#E5E7EB' },
    ];

    return (
      <div className="space-y-6 relative">
        {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
        
        {/* Top Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex items-center justify-between transition-colors">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Membership</p>
              <h3 className="text-xl font-black text-green-600 dark:text-green-455">Active</h3>
            </div>
            <div className="bg-green-50 dark:bg-green-950/40 p-3.5 rounded-2xl text-green-600 dark:text-green-400"><CheckCircle size={22} /></div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex items-center justify-between transition-colors">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meals Remaining</p>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white">{mealBalance}</h3>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl text-blue-600 dark:text-blue-400"><Utensils size={22} /></div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-855 shadow-sm flex items-center justify-between transition-colors">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</p>
              <h3 className={`text-xl font-black ${hasPendingPayment ? 'text-orange-500' : 'text-gray-800 dark:text-gray-200'}`}>
                {hasPendingPayment ? 'Pending' : 'Paid'}
              </h3>
            </div>
            <div className={`${hasPendingPayment ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'} p-3.5 rounded-2xl`}>
              <CreditCard size={22} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-855 shadow-sm flex items-center justify-between transition-colors">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Due Date</p>
              <h3 className={`text-sm font-black ${isExpired ? 'text-rose-500' : 'text-gray-800 dark:text-gray-200'}`}>
                {planExpiry ? planExpiry.toLocaleDateString() : 'N/A'}
              </h3>
            </div>
            <div className={`${isExpired ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-605' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'} p-3.5 rounded-2xl`}>
              <Calendar size={22} />
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-8 rounded-3xl shadow-md text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black">Welcome to {activeMess.name}</h2>
                <p className="text-emerald-100 text-xs max-w-md leading-relaxed font-medium">Your membership is fully active. Make sure to scan the QR code at the mess entrance for daily attendance confirmation.</p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 text-center shadow-inner shrink-0">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-100 mb-0.5">Active Cycle</p>
                <p className="text-xl font-bold">Standard plan</p>
                <p className="text-[10px] text-emerald-100 font-semibold mt-1">Automatic renewals enabled</p>
              </div>
            </div>

            {/* Payment History & Attendance Chart Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Payment History Widget */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm flex flex-col transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Receipt size={18} className="text-indigo-500"/> Billing History
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-64">
                  {payments.length === 0 ? (
                    <EmptyState 
                      title="No Billing Logs" 
                      description="You don't have any plan transactions recorded." 
                    />
                  ) : (
                    paginatedPayments.map(pay => (
                      <div key={pay._id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/20">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">{pay.plan?.name}</p>
                          <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">{new Date(pay.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-black text-indigo-650 dark:text-indigo-400 text-xs">₹{pay.amount}</p>
                          {pay.status === 'pending' ? (
                            <span className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-705 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold inline-block">Pending</span>
                          ) : (
                            <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450 px-2 py-0.5 rounded-full font-bold inline-block">Paid</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {totalPages > 1 && (
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>

              {/* Attendance Chart */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm transition-colors">
                <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider mb-4">Monthly Meal Usage</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={mockPieData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                        {mockPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: isDark ? '#111827' : '#ffffff', border: isDark ? '1px solid #374151' : 'none', borderRadius: '12px'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {mockPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-gray-500 dark:text-gray-400 font-semibold">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{item.value} meals</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-855 shadow-sm transition-colors">
              <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowScanner(true)}
                  className="w-full bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 focus:outline-none"
                >
                  <CheckCircle size={16}/> Scan Attendance QR
                </button>
                <button 
                  onClick={triggerMakePayment}
                  className="w-full bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 focus:outline-none"
                >
                  <CreditCard size={16}/> Make Payment
                </button>
                <button 
                  onClick={() => setShowComplaintModal(true)}
                  className="w-full bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-405 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 focus:outline-none"
                >
                  <MessageSquare size={16}/> Raise Complaint
                </button>
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm h-96 flex flex-col transition-colors">
              <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
                <Bell size={18} className="text-amber-500"/> Activity Notifications
              </h3>
              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                {notifications.length === 0 ? (
                  <EmptyState 
                    title="No Activity Alerts" 
                    description="You are all caught up!" 
                  />
                ) : (
                  notifications.map(notif => (
                    <div key={notif._id} className="border-l-4 border-indigo-650 pl-3 py-1 bg-gray-50/50 dark:bg-gray-950/20 rounded-r-xl">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{notif.title}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1.5 font-bold">{new Date(notif.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Complaint Modal */}
        {showComplaintModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[11000] p-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 animate-scale-up">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-base">
                <AlertCircle size={20} />
                <h3>Raise a Mess Complaint</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed font-semibold">Your complaint will be forwarded directly to the Platform Super Admin for verification and resolution.</p>
              
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Issue Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Unhygienic food quality"
                    value={complaintForm.title}
                    onChange={e => setComplaintForm({ ...complaintForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-rose-500 text-xs font-bold focus:outline-none focus:bg-white dark:focus:bg-gray-900 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Elaborate Details</label>
                  <textarea
                    placeholder="Describe your issue with dates or details..."
                    value={complaintForm.description}
                    onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-rose-500 text-xs font-bold focus:outline-none focus:bg-white dark:focus:bg-gray-900 transition-colors"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-750 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingComplaint}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    {submittingComplaint ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl border border-gray-100 dark:border-gray-850 text-center space-y-6 transition-colors duration-300">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
          <User size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-800 dark:text-white">Welcome to MessHub</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto font-medium">You haven't joined a mess yet. Enter the unique 8-character join code provided by your mess owner to request access.</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-3xl border border-gray-200 dark:border-gray-850">
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <input 
                type="text" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ENTER JOIN CODE"
                maxLength={8}
                className="w-full px-6 py-4 text-center text-2xl font-mono font-bold tracking-widest border-2 border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-0 uppercase placeholder-gray-300 transition"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || joinCode.length < 8}
              className="w-full bg-indigo-650 hover:bg-indigo-755 text-white font-bold py-3.5 rounded-2xl shadow-md transition disabled:bg-indigo-300 dark:disabled:bg-indigo-850 text-base"
            >
              {loading ? 'Sending Join Request...' : 'Request to Join Mess'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
