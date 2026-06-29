import React, { useState, useEffect } from 'react';
import messService from '../services/messService';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, CreditCard, Calendar, User, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const mockAttendanceData = [
  { name: 'Attended', value: 24, color: '#10B981' },
  { name: 'Missed', value: 2, color: '#EF4444' },
  { name: 'Upcoming', value: 4, color: '#E5E7EB' },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [activeMess, setActiveMess] = useState(null);
  const [loadingMess, setLoadingMess] = useState(true);

  useEffect(() => {
    const fetchActiveMess = async () => {
      if (user?.activeMess) {
        try {
          const mess = await messService.getStudentMess();
          setActiveMess(mess);
        } catch (err) {
          console.error('No active mess or error fetching:', err);
        }
      }
      setLoadingMess(false);
    };
    fetchActiveMess();
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

  if (loadingMess) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;

  if (activeMess) {
    return (
      <div className="space-y-6">
        
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
              <h3 className="text-2xl font-bold text-gray-800">4</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-600"><UtensilsIcon size={24} /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Status</p>
              <h3 className="text-xl font-bold text-gray-800">Paid</h3>
            </div>
            <div className="bg-indigo-50 p-3 rounded-full text-indigo-600"><CreditCard size={24} /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Next Due Date</p>
              <h3 className="text-xl font-bold text-gray-800">Aug 1st</h3>
            </div>
            <div className="bg-orange-50 p-3 rounded-full text-orange-600"><Calendar size={24} /></div>
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
              <div className="mt-6 md:mt-0 bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30 text-center">
                <p className="text-sm uppercase tracking-wider font-bold text-green-100 mb-1">Today's Meal</p>
                <p className="text-2xl font-bold">Lunch</p>
                <p className="text-xs text-green-100 mt-1">12:30 PM - 2:30 PM</p>
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mockAttendanceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {mockAttendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Monthly Attendance</h3>
                <div className="space-y-3">
                  {mockAttendanceData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-gray-600 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-800">{item.value} days</span>
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
                <button className="w-full bg-green-50 text-green-700 hover:bg-green-100 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
                  <CheckCircle size={18}/> Scan Attendance QR
                </button>
                <button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
                  <CreditCard size={18}/> Make Payment
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-yellow-500"/> Notifications
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-400 pl-3 py-1">
                  <p className="text-sm font-bold text-gray-800">Special Dinner Tonight</p>
                  <p className="text-xs text-gray-500 mt-1">Chicken Biryani & Paneer Butter Masala starting 7:30 PM.</p>
                </div>
                <div className="border-l-4 border-green-400 pl-3 py-1">
                  <p className="text-sm font-bold text-gray-800">Payment Successful</p>
                  <p className="text-xs text-gray-500 mt-1">Your payment for July was received.</p>
                </div>
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

// Internal icon component for simple use
const UtensilsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);

export default StudentDashboard;
