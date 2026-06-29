import React, { useState, useEffect } from 'react';
import messService from '../services/messService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { CheckCircle, Clock, CreditCard, Calendar, User, Bell, Utensils, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import QRScanner from './QRScanner';

const StudentDashboard = () => {
  const { user, fetchUser } = useAuth();
  const { notifications } = useSocket();
  const [joinCode, setJoinCode] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [activeMess, setActiveMess] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingMess, setLoadingMess] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

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
    setStatusMsg({ type: '', text: '' });

    try {
      const data = await messService.requestJoin(joinCode);
      setStatusMsg({ type: 'success', text: data.message });
      setJoinCode('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send request' });
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
      alert(`${data.message}! Meal: ${data.mealType}`);
      await fetchUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoadingMess(false);
    }
  };

  if (loadingMess) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;

  if (activeMess) {
    const mealBalance = user.mealBalance || 0;
    const planExpiry = user.planExpiry ? new Date(user.planExpiry) : null;
    const isExpired = planExpiry && planExpiry < new Date();
    const hasPendingPayment = payments.some(p => p.status === 'pending');
    
    // Simple dynamic calculation for the pie chart
    const totalMeals = 30; // Default month basis
    const attended = totalMeals - mealBalance;
    const mockAttendanceData = [
      { name: 'Attended', value: attended > 0 ? attended : 1, color: '#10B981' },
      { name: 'Remaining', value: mealBalance, color: '#E5E7EB' },
    ];

    return (
      <div className="space-y-6 relative">
        {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
        
        {/* Top Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Membership</p>
              <h3 className="text-xl font-bold text-green-600">Active</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full text-green-600"><CheckCircle size={24} /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Meals Remaining</p>
              <h3 className="text-2xl font-bold text-gray-800">{mealBalance}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Utensils size={24} /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Status</p>
              <h3 className={`text-xl font-bold ${hasPendingPayment ? 'text-orange-500' : 'text-gray-800'}`}>{hasPendingPayment ? 'Pending' : 'Paid'}</h3>
            </div>
            <div className={`${hasPendingPayment ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'} p-3 rounded-full`}><CreditCard size={24} /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Next Due Date</p>
              <h3 className={`text-xl font-bold ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>{planExpiry ? planExpiry.toLocaleDateString() : 'N/A'}</h3>
            </div>
            <div className={`${isExpired ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'} p-3 rounded-full`}><Calendar size={24} /></div>
          </div>
        </div>

        {/* Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-8 rounded-2xl shadow-sm text-white flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome to {activeMess.name}</h2>
                <p className="text-green-100 max-w-md">Your membership is fully active. Make sure to scan the QR code at the mess entrance for daily attendance.</p>
              </div>
              <div className="mt-6 md:mt-0 bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30 text-center shadow-inner">
                <p className="text-sm uppercase tracking-wider font-bold text-green-100 mb-1">Today's Meal</p>
                <p className="text-2xl font-bold">Lunch</p>
                <p className="text-xs text-green-100 mt-1">12:30 PM - 2:30 PM</p>
              </div>
            </div>

            {/* Payment History & Attendance Chart Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Payment History Widget */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Receipt size={20} className="text-indigo-500"/> Billing History</h3>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-64">
                  {payments.length === 0 ? (
                    <p className="text-gray-500 italic text-sm text-center py-8">No payment records found.</p>
                  ) : (
                    payments.map(pay => (
                      <div key={pay._id} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{pay.plan?.name}</p>
                          <p className="text-[10px] text-gray-500">{new Date(pay.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600 text-sm">₹{pay.amount}</p>
                          {pay.status === 'pending' ? (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold inline-block mt-1">Pending</span>
                          ) : (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">Paid</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Attendance Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Usage</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={mockAttendanceData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                        {mockAttendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {mockAttendanceData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-gray-600 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-800">{item.value} meals</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowScanner(true)}
                  className="w-full bg-green-50 text-green-700 hover:bg-green-100 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18}/> Scan Attendance QR
                </button>
                <button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
                  <CreditCard size={18}/> Make Payment
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 shrink-0">
                <Bell size={20} className="text-yellow-500"/> Notifications
              </h3>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                {notifications.length === 0 ? (
                   <p className="text-sm text-gray-500 italic">No recent notifications.</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif._id} className={`border-l-4 pl-3 py-1 ${notif.type === 'success' ? 'border-green-400' : 'border-blue-400'}`}>
                      <p className="text-sm font-bold text-gray-800">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <User size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome to MessHub</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't joined a mess yet. Enter the unique 8-character join code provided by your mess owner to get started.</p>
        
        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
          
          {statusMsg.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${statusMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <input 
                type="text" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter Join Code (e.g. A1B2C3D4)"
                maxLength={8}
                className="w-full px-6 py-4 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-0 uppercase placeholder-gray-300 transition-colors"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || joinCode.length < 8}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-50 text-lg mt-2"
            >
              {loading ? 'Sending Request...' : 'Request to Join Mess'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
