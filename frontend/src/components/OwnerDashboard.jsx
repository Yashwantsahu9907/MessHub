import React, { useEffect, useState } from 'react';
import messService from '../services/messService';
import { Users, CheckCircle, Clock, CreditCard, Utensils, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [profileData, reqsData, memsData] = await Promise.all([
        messService.getMessProfile(),
        messService.getJoinRequests(),
        messService.getMessMembers(),
      ]);
      setMessProfile(profileData);
      setRequests(reqsData);
      setMembers(memsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessRequest = async (id, status) => {
    try {
      await messService.processJoinRequest(id, status);
      fetchData(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await messService.removeMember(studentId);
      fetchData(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing member');
    }
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="space-y-6">
      
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
            <h3 className="text-2xl font-bold text-gray-800">12</h3>
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
        </div>

        {/* Right Column (Requests & Activity) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full max-h-[600px] flex flex-col">
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
                  <th className="pb-3 text-sm font-semibold text-gray-600">Joined Date</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-4 text-sm font-medium text-gray-800">{member.name}</td>
                    <td className="py-4 text-sm text-gray-500">{member.email}</td>
                    <td className="py-4 text-sm text-gray-500">{new Date(member.createdAt).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Active</span>
                    </td>
                    <td className="py-4 text-right">
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
    </div>
  );
};

export default OwnerDashboard;
