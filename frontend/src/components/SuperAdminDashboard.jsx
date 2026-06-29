import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { 
  Users, Home, TrendingUp, Activity, ShieldAlert, Radio, Heart, Settings, 
  Search, ShieldCheck, UserX, UserCheck, MessageSquare, AlertCircle, 
  RefreshCw, CheckCircle, Cpu, HardDrive, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Jan', users: 400, messes: 2 },
  { name: 'Feb', users: 600, messes: 3 },
  { name: 'Mar', users: 800, messes: 3 },
  { name: 'Apr', users: 1200, messes: 4 },
  { name: 'May', users: 1600, messes: 4 },
  { name: 'Jun', users: 2100, messes: 5 },
];

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [messes, setMesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [settings, setSettings] = useState([]);
  const [health, setHealth] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search/Filter states
  const [messSearch, setMessSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  
  // Announcement state
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [broadcasting, setBroadcasting] = useState(false);

  // Complaint resolution state
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, messesData, usersData, complaintsData, settingsData, healthData] = await Promise.all([
        adminService.getStats(),
        adminService.getMesses(),
        adminService.getUsers(),
        adminService.getComplaints(),
        adminService.getSettings(),
        adminService.getHealth()
      ]);
      setStats(statsData);
      setMesses(messesData);
      setUsers(usersData);
      setComplaints(complaintsData);
      setSettings(settingsData);
      setHealth(healthData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Super Admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const triggerToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // 1. Toggle Mess Status (Approve / Block)
  const handleToggleMessStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'block' : 'approve';
    if (!window.confirm(`Are you sure you want to ${action} this mess?`)) return;
    
    try {
      await adminService.updateMessStatus(id, !currentStatus);
      triggerToast(`Mess ${action}ed successfully.`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating mess status');
    }
  };

  // 2. Toggle User Suspension
  const handleToggleUserSuspension = async (id, currentSuspended) => {
    const action = currentSuspended ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this user account?`)) return;

    try {
      await adminService.updateUserSuspension(id, !currentSuspended);
      triggerToast(`User account ${action}d successfully.`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user suspension status');
    }
  };

  // 3. Broadcast Announcement
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) return;
    
    setBroadcasting(true);
    try {
      await adminService.broadcastNotification(announcement);
      triggerToast('Platform-wide announcement broadcasted successfully!');
      setAnnouncement({ title: '', message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to broadcast announcement');
    } finally {
      setBroadcasting(false);
    }
  };

  // 4. Resolve Complaint
  const handleResolveComplaint = async (id) => {
    if (!resolutionText) return alert('Please enter resolution details.');
    try {
      await adminService.resolveComplaint(id, resolutionText);
      triggerToast('Complaint marked as resolved.');
      setResolvingId(null);
      setResolutionText('');
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve complaint');
    }
  };

  // 5. Update setting
  const handleUpdateSetting = async (key, val) => {
    try {
      // Parse numeric/boolean values correctly
      let parsedVal = val;
      if (val === 'true') parsedVal = true;
      if (val === 'false') parsedVal = false;
      if (!isNaN(val) && val !== '') parsedVal = Number(val);

      await adminService.updateSetting(key, parsedVal);
      triggerToast(`Setting "${key}" updated successfully.`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update setting');
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Filter computations
  const filteredMesses = messes.filter(m => 
    m.name.toLowerCase().includes(messSearch.toLowerCase()) || 
    m.owner?.name.toLowerCase().includes(messSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {successMsg && (
        <div className="fixed top-24 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle size={18} />
          <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}

      {/* Main Tab Switcher Bar */}
      <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl shadow-sm border border-gray-100">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
          { id: 'messes', label: 'Registered Messes', icon: Home },
          { id: 'users', label: 'Users & Accounts', icon: Users },
          { id: 'complaints', label: 'Complaints Panel', icon: MessageSquare },
          { id: 'broadcast', label: 'Global Broadcast', icon: Radio },
          { id: 'health_config', label: 'System Health & Settings', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition focus:outline-none ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && <div className="text-red-500 bg-red-50 border border-red-100 p-4 rounded-xl text-center">{error}</div>}

      {/* RENDER ACTIVE TAB */}

      {activeTab === 'overview' && stats && (
        /* OVERVIEW TAB */
        <div className="space-y-6">
          {/* Stats KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹{stats.totalRevenue}</h3>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600"><TrendingUp size={24} /></div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Messes</p>
                <h3 className="text-2xl font-bold text-indigo-700 mt-1">{stats.totalMesses}</h3>
              </div>
              <div className="bg-indigo-50 p-3.5 rounded-2xl text-indigo-600"><Home size={24} /></div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Students</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalStudents}</h3>
              </div>
              <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600"><Users size={24} /></div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Complaints</p>
                <h3 className="text-2xl font-bold text-orange-500 mt-1">{stats.pendingComplaints} / {stats.totalComplaints}</h3>
              </div>
              <div className="bg-orange-50 p-3.5 rounded-2xl text-orange-600"><MessageSquare size={24} /></div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-800">Platform Expansion Metrics</h3>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">Real-time stats</span>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="users" name="Active Members" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messes' && (
        /* MESSES MANAGEMENT */
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Mess Profiles & Approval Control</h3>
              <p className="text-xs text-gray-500 mt-1">Approve new mess operations or temporarily block compliance violators.</p>
            </div>
            <div className="relative w-full md:w-72">
              <input 
                type="text" 
                placeholder="Search by mess name or owner..." 
                value={messSearch}
                onChange={e => setMessSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none"
              />
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-3 text-xs font-bold text-gray-600 rounded-l-xl">Mess Name</th>
                  <th className="p-3 text-xs font-bold text-gray-600">Owner Contact</th>
                  <th className="p-3 text-xs font-bold text-gray-600">Created Date</th>
                  <th className="p-3 text-xs font-bold text-gray-600">Approval Status</th>
                  <th className="p-3 text-xs font-bold text-gray-600 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMesses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-sm text-gray-500 italic">No registered messes found matching your search.</td>
                  </tr>
                ) : (
                  filteredMesses.map(mess => (
                    <tr key={mess._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="p-3 font-semibold text-sm text-gray-800">{mess.name}</td>
                      <td className="p-3 text-sm">
                        <div className="font-medium text-gray-800">{mess.owner?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{mess.owner?.email || 'N/A'}</div>
                      </td>
                      <td className="p-3 text-sm text-gray-500">{new Date(mess.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          mess.isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {mess.isApproved ? 'Approved' : 'Blocked'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right">
                        <button
                          onClick={() => handleToggleMessStatus(mess._id, mess.isApproved)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto ${
                            mess.isApproved 
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700' 
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {mess.isApproved ? (
                            <><UserX size={13} /> Block Mess</>
                          ) : (
                            <><ShieldCheck size={13} /> Approve</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        /* USERS & SUSPENSION PANEL */
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">User Account Operations</h3>
              <p className="text-xs text-gray-500 mt-1">Suspend or activate students and owners across the platform.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <input 
                  type="text" 
                  placeholder="Search name or email..." 
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none"
                />
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              </div>

              {/* Role Filter */}
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Roles</option>
                <option value="student">Students</option>
                <option value="mess_owner">Mess Owners</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-3 text-xs font-bold text-gray-600 rounded-l-xl">User details</th>
                  <th className="p-3 text-xs font-bold text-gray-600">Role</th>
                  <th className="p-3 text-xs font-bold text-gray-600">Associated Mess</th>
                  <th className="p-3 text-xs font-bold text-gray-600">Account status</th>
                  <th className="p-3 text-xs font-bold text-gray-600 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-sm text-gray-500 italic">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="p-3 text-sm">
                        <div className="font-semibold text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="p-3 text-sm font-bold uppercase tracking-wider text-gray-500">
                        {user.role === 'student' ? 'Student' : 'Mess Owner'}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {user.activeMess?.name || <span className="text-gray-400 italic text-xs">No active mess</span>}
                      </td>
                      <td className="p-3 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          user.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right">
                        <button
                          onClick={() => handleToggleUserSuspension(user._id, user.isSuspended)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto ${
                            user.isSuspended 
                              ? 'bg-green-50 hover:bg-green-100 text-green-700' 
                              : 'bg-red-50 hover:bg-red-100 text-red-700'
                          }`}
                        >
                          {user.isSuspended ? (
                            <><UserCheck size={13} /> Activate</>
                          ) : (
                            <><UserX size={13} /> Suspend</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        /* COMPLAINTS MODERATION PANEL */
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Student Complaints Resolution</h3>
            <p className="text-xs text-gray-500 mt-1">Review student issues and input direct resolutions that alert users immediately.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-3 text-xs font-bold text-gray-600 rounded-l-xl">Student</th>
                  <th className="p-3 text-xs font-bold text-gray-600">Mess Name</th>
                  <th className="p-3 text-xs font-bold text-gray-600">Issue Description</th>
                  <th className="p-3 text-xs font-bold text-gray-600">Status</th>
                  <th className="p-3 text-xs font-bold text-gray-600 text-right rounded-r-xl">Action / Resolution</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-sm text-gray-500 italic">No complaints filed on the platform.</td>
                  </tr>
                ) : (
                  complaints.map(comp => (
                    <tr key={comp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition align-top">
                      <td className="p-3 text-sm">
                        <div className="font-semibold text-gray-800">{comp.student?.name}</div>
                        <div className="text-xs text-gray-500">{comp.student?.email}</div>
                      </td>
                      <td className="p-3 text-sm font-semibold text-gray-800">{comp.mess?.name || 'N/A'}</td>
                      <td className="p-3 text-sm max-w-xs">
                        <div className="font-bold text-gray-900">{comp.title}</div>
                        <p className="text-xs text-gray-500 mt-1">{comp.description}</p>
                      </td>
                      <td className="p-3 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          comp.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {comp.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right">
                        {comp.status === 'resolved' ? (
                          <div className="text-left text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg max-w-xs border border-emerald-100 ml-auto">
                            <span className="font-bold">Resolution:</span> {comp.resolution}
                          </div>
                        ) : resolvingId === comp._id ? (
                          <div className="space-y-2 max-w-xs ml-auto">
                            <textarea
                              value={resolutionText}
                              onChange={e => setResolutionText(e.target.value)}
                              placeholder="Write resolution..."
                              className="w-full text-xs p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows={2}
                            />
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => handleResolveComplaint(comp._id)} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-md hover:bg-emerald-700">Submit</button>
                              <button onClick={() => setResolvingId(null)} className="bg-gray-100 text-gray-700 text-[10px] font-bold px-3 py-1 rounded-md hover:bg-gray-200">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setResolvingId(comp._id);
                              setResolutionText('');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Resolve Issue
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'broadcast' && (
        /* PLATFORM BROADCAST FORM */
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5 text-indigo-600"><Radio size={20} /> Platform-wide Broadcast</h3>
            <p className="text-xs text-gray-500 mt-1">Send a direct message/announcement that reaches all registered students & mess owners instantly via real-time WebSocket push notifications and stores inside their alerts dashboard.</p>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. Schedule Maintenance Notice"
                value={announcement.title}
                onChange={e => setAnnouncement({ ...announcement, title: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message Content</label>
              <textarea
                placeholder="Write announcement body here..."
                value={announcement.message}
                onChange={e => setAnnouncement({ ...announcement, message: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                rows={5}
                required
              />
            </div>

            <button
              type="submit"
              disabled={broadcasting}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-sm disabled:bg-indigo-300"
            >
              {broadcasting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <><Radio size={16} /> Send Broadcast Now</>
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'health_config' && (
        /* SYSTEM HEALTH & GLOBAL CONFIG */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Global Config Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5 text-indigo-600"><Settings size={20} /> Global System Settings</h3>
              <p className="text-xs text-gray-500 mt-1">Configure global application variables dynamically.</p>
            </div>

            <div className="space-y-4">
              {settings.map(sett => (
                <div key={sett._id} className="border border-gray-100 p-4 rounded-xl space-y-2 bg-gray-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{sett.key}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{sett.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 items-center">
                    {typeof sett.value === 'boolean' ? (
                      <select
                        value={sett.value.toString()}
                        onChange={e => handleUpdateSetting(sett.key, e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="true">ENABLED</option>
                        <option value="false">DISABLED</option>
                      </select>
                    ) : (
                      <div className="flex gap-2 flex-1">
                        <input
                          type="text"
                          defaultValue={sett.value}
                          onBlur={e => handleUpdateSetting(sett.key, e.target.value)}
                          placeholder="Enter setting value..."
                          className="flex-1 px-3 py-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health Diagnostics */}
          {health && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5 text-emerald-600"><Heart size={20} /> Live System Diagnostics</h3>
                <p className="text-xs text-gray-500 mt-1">Monitor operational server status and platform metrics.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-100 p-4 rounded-xl flex items-center gap-3">
                  <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg"><Cpu size={18} /></div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Process Status</span>
                    <span className="text-sm font-bold text-gray-800">{health.status}</span>
                  </div>
                </div>

                <div className="border border-gray-100 p-4 rounded-xl flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg"><HardDrive size={18} /></div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">DB Status</span>
                    <span className="text-sm font-bold text-gray-800">{health.database}</span>
                  </div>
                </div>

                <div className="border border-gray-100 p-4 rounded-xl flex items-center gap-3">
                  <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg"><Clock size={18} /></div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Server Uptime</span>
                    <span className="text-sm font-bold text-gray-800">{health.uptime}</span>
                  </div>
                </div>

                <div className="border border-gray-100 p-4 rounded-xl flex items-center gap-3">
                  <div className="bg-purple-50 text-purple-600 p-2.5 rounded-lg"><Activity size={18} /></div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Heap Memory</span>
                    <span className="text-sm font-bold text-gray-800">{health.memory?.heapUsed} / {health.memory?.heapTotal}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 p-4 rounded-xl bg-gray-50/50 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Node.js Version:</span>
                  <span className="font-bold text-gray-800">{health.nodeVersion}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Server OS Platform:</span>
                  <span className="font-bold text-gray-800 capitalize">{health.platform}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>RSS Memory Allocation:</span>
                  <span className="font-bold text-gray-800">{health.memory?.rss}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
