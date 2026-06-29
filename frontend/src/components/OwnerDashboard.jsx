import React, { useEffect, useState } from 'react';
import messService from '../services/messService';
import { Users, CheckCircle, Clock, CreditCard, Utensils, TrendingUp, Plus, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import OwnerAnalytics from './OwnerAnalytics';

// Mock data for visually rich UI as requested
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
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Plan creation state
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', durationDays: 30, mealsIncluded: 60, price: 3000 });
  const [dashboardTab, setDashboardTab] = useState('overview'); // 'overview' | 'analytics'

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
      setError(err.response?.data?.message || 'Failed to load dashboard data');
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

  const handleProcessRequest = async (id, status) => {
    try {
      await messService.processJoinRequest(id, status);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await messService.removeMember(studentId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing member');
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await messService.createPlan(newPlan);
      setShowPlanForm(false);
      setNewPlan({ name: '', durationDays: 30, mealsIncluded: 60, price: 3000 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating plan');
    }
  };

  const handleAssignPlan = async (studentId) => {
    if (plans.length === 0) return alert('Please create a plan first.');
    const planId = window.prompt(`Enter Plan number to assign:\n${plans.map((p, i) => `${i + 1}. ${p.name} (₹${p.price})`).join('\n')}`);
    if (!planId) return;
    const selectedPlan = plans[parseInt(planId) - 1];
    if (!selectedPlan) return alert('Invalid selection');
    
    try {
      await messService.assignPlan(studentId, selectedPlan._id);
      alert('Plan assigned! Payment is pending.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning plan');
    }
  };

  const handleMarkPaid = async (paymentId) => {
    if (!window.confirm('Mark this payment as paid? This will add meals to the student account.')) return;
    try {
      await messService.updatePaymentStatus(paymentId, 'paid');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating payment');
    }
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 bg-white p-2 rounded-2xl shadow-sm gap-2">
        <button 
          onClick={() => setDashboardTab('overview')}
          className={`px-5 py-2.5 font-bold text-sm rounded-xl transition ${
            dashboardTab === 'overview' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Dashboard Overview
        </button>
        <button 
          onClick={() => setDashboardTab('analytics')}
          className={`px-5 py-2.5 font-bold text-sm rounded-xl transition ${
            dashboardTab === 'analytics' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Members</p>
            <h3 className="text-2xl font-bold text-gray-800">{members.length}</h3>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Users size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Today's Attendance</p>
            <h3 className="text-2xl font-bold text-gray-800">45 <span className="text-xs text-green-500 font-normal">+12%</span></h3>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-600"><CheckCircle size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Requests</p>
            <h3 className="text-2xl font-bold text-gray-800">{requests.length}</h3>
          </div>
          <div className="bg-orange-50 p-3 rounded-full text-orange-600"><Clock size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Payments</p>
            <h3 className="text-2xl font-bold text-gray-800">{pendingPayments.length}</h3>
          </div>
          <div className="bg-red-50 p-3 rounded-full text-red-600"><CreditCard size={24} /></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (QR & Chart) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Setup / QR */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">{messProfile.name}</h3>
              <p className="text-indigo-100 mb-4 max-w-sm">Share your unique join code with students to allow them to request access to your mess.</p>
              <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-6 py-3">
                <p className="text-sm text-indigo-100 uppercase tracking-wider font-bold mb-1">Join Code</p>
                <p className="text-3xl font-mono font-bold tracking-widest">{messProfile.joinCode}</p>
              </div>
            </div>
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src={messProfile.qrCode} alt="Mess QR Code" className="w-32 h-32" />
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><TrendingUp size={20} className="text-indigo-500"/> Weekly Attendance</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAttendanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Plans Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Receipt size={20} className="text-green-500"/> Subscription Plans</h3>
              <button onClick={() => setShowPlanForm(!showPlanForm)} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-100 transition">
                <Plus size={16} /> New Plan
              </button>
            </div>

            {showPlanForm && (
              <form onSubmit={handleCreatePlan} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Plan Name</label>
                  <input type="text" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required placeholder="e.g. 30 Days Premium"/>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Days</label>
                  <input type="number" value={newPlan.durationDays} onChange={e => setNewPlan({...newPlan, durationDays: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required/>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Meals</label>
                  <input type="number" value={newPlan.mealsIncluded} onChange={e => setNewPlan({...newPlan, mealsIncluded: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required/>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Price (₹)</label>
                  <input type="number" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required/>
                </div>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">Save</button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No plans created yet.</p>
              ) : (
                plans.map(plan => (
                  <div key={plan._id} className="border border-gray-100 p-4 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 text-lg">{plan.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{plan.durationDays} Days • {plan.mealsIncluded} Meals</p>
                    <p className="font-extrabold text-indigo-600 text-xl mt-2">₹{plan.price}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Requests & Activity) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Pending Requests</h3>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">{requests.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {requests.length === 0 ? (
                <p className="text-gray-500 italic text-sm text-center py-8">No pending requests.</p>
              ) : (
                requests.map(req => (
                  <div key={req._id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition bg-white shadow-sm">
                    <p className="font-bold text-gray-800 text-sm">{req.student.name}</p>
                    <p className="text-xs text-gray-500 mb-3">{req.student.email}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleProcessRequest(req._id, 'approved')} className="flex-1 bg-indigo-600 text-white py-1.5 rounded-lg hover:bg-indigo-700 text-xs font-medium transition">
                        Approve
                      </button>
                      <button onClick={() => handleProcessRequest(req._id, 'rejected')} className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg hover:bg-gray-200 text-xs font-medium transition">
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Recent Payments Widget */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[380px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Payments</h3>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {payments.length === 0 ? (
                 <p className="text-gray-500 italic text-sm text-center py-8">No payment records.</p>
              ) : (
                payments.slice(0, 5).map(pay => (
                  <div key={pay._id} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{pay.student?.name}</p>
                      <p className="text-xs text-gray-500">{pay.plan?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600 text-sm">₹{pay.amount}</p>
                      {pay.status === 'pending' ? (
                        <button onClick={() => handleMarkPaid(pay._id)} className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold hover:bg-orange-200 mt-1">Mark Paid</button>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">Paid</span>
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Utensils size={20} className="text-blue-500"/> Member Management</h3>
          </div>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        
        {members.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">No active members yet.</p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">No members match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-sm font-semibold text-gray-600">Student Name</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Email</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Balance</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-4 text-sm font-medium text-gray-800">{member.name}</td>
                    <td className="py-4 text-sm text-gray-500">{member.email}</td>
                    <td className="py-4 text-sm font-bold text-indigo-600">{member.mealBalance || 0} meals</td>
                    <td className="py-4 text-right flex items-center justify-end gap-3">
                      <button onClick={() => handleAssignPlan(member._id)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition flex items-center gap-1">
                        <Plus size={14}/> Assign Plan
                      </button>
                      <button onClick={() => handleRemoveMember(member._id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
