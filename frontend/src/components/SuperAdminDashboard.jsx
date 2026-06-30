import React, { useEffect, useState, useMemo } from 'react';
import adminService from '../services/adminService';
import { 
  Users, Home, TrendingUp, Activity, ShieldAlert, Radio, Heart, Settings, 
  Search, ShieldCheck, UserX, UserCheck, MessageSquare, AlertCircle, 
  RefreshCw, CheckCircle, Cpu, HardDrive, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import ConfirmationDialog from './ConfirmationDialog';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import { SkeletonCard, SkeletonTable } from './Skeleton';


const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [messes, setMesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [settings, setSettings] = useState([]);
  const [health, setHealth] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { isDark } = useTheme();

  // Search/Filter states
  const [messSearch, setMessSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  
  // Pagination states
  const [messPage, setMessPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [complaintPage, setComplaintPage] = useState(1);
  const itemsPerPage = 8;

  // Announcement state
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [broadcasting, setBroadcasting] = useState(false);

  // Complaint resolution state
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  // Dialog configurations
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning' });

  const fetchAllData = async () => {
    setLoading(true);
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
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to load Super Admin dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openDialog = (title, message, onConfirm, type = 'warning') => {
    setDialogConfig({ isOpen: true, title, message, onConfirm, type });
  };

  // Toggle Mess Status (Approve / Block)
  const handleToggleMessStatus = (id, currentStatus) => {
    const action = currentStatus ? 'block' : 'approve';
    openDialog(
      `Confirm ${action}`,
      `Are you sure you want to ${action} this mess account?`,
      async () => {
        try {
          await adminService.updateMessStatus(id, !currentStatus);
          addToast(`Mess successfully ${action}ed.`, 'success');
          fetchAllData();
        } catch (err) {
          addToast(err.response?.data?.message || 'Error updating mess status', 'error');
        }
      },
      currentStatus ? 'danger' : 'info'
    );
  };

  // Toggle User Suspension
  const handleToggleUserSuspension = (id, currentSuspended) => {
    const action = currentSuspended ? 'activate' : 'suspend';
    openDialog(
      `Confirm ${action}`,
      `Are you sure you want to ${action} this user account?`,
      async () => {
        try {
          await adminService.updateUserSuspension(id, !currentSuspended);
          addToast(`User account ${action}d successfully.`, 'success');
          fetchAllData();
        } catch (err) {
          addToast(err.response?.data?.message || 'Error updating user status', 'error');
        }
      },
      currentSuspended ? 'info' : 'danger'
    );
  };

  // Broadcast Announcement
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) return;
    
    setBroadcasting(true);
    try {
      await adminService.broadcastNotification(announcement);
      addToast('Platform-wide announcement broadcasted successfully!', 'success');
      setAnnouncement({ title: '', message: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to broadcast announcement', 'error');
    } finally {
      setBroadcasting(false);
    }
  };

  // Resolve Complaint
  const handleResolveComplaint = async (id) => {
    if (!resolutionText.trim()) {
      addToast('Please enter resolution details.', 'warning');
      return;
    }
    try {
      await adminService.resolveComplaint(id, resolutionText);
      addToast('Complaint marked as resolved.', 'success');
      setResolvingId(null);
      setResolutionText('');
      fetchAllData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to resolve complaint', 'error');
    }
  };

  // Update setting
  const handleUpdateSetting = async (key, val) => {
    try {
      let parsedVal = val;
      if (val === 'true') parsedVal = true;
      if (val === 'false') parsedVal = false;
      if (!isNaN(val) && val !== '') parsedVal = Number(val);

      await adminService.updateSetting(key, parsedVal);
      addToast(`Setting "${key}" updated successfully.`, 'success');
      fetchAllData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update setting', 'error');
    }
  };

  // Filter & Paginate computations
  const filteredMesses = useMemo(() => {
    return messes.filter(m => 
      m.name.toLowerCase().includes(messSearch.toLowerCase()) || 
      m.owner?.name.toLowerCase().includes(messSearch.toLowerCase())
    );
  }, [messes, messSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                            u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const paginatedMesses = useMemo(() => {
    const start = (messPage - 1) * itemsPerPage;
    return filteredMesses.slice(start, start + itemsPerPage);
  }, [filteredMesses, messPage]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, userPage]);

  const paginatedComplaints = useMemo(() => {
    const start = (complaintPage - 1) * itemsPerPage;
    return complaints.slice(start, start + itemsPerPage);
  }, [complaints, complaintPage]);

  const totalMessPages = useMemo(() => Math.max(1, Math.ceil(filteredMesses.length / itemsPerPage)), [filteredMesses]);
  const totalUserPages = useMemo(() => Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage)), [filteredUsers]);
  const totalComplaintPages = useMemo(() => Math.max(1, Math.ceil(complaints.length / itemsPerPage)), [complaints]);

  useEffect(() => { setMessPage(1); }, [messSearch]);
  useEffect(() => { setUserPage(1); }, [userSearch, userRoleFilter]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-105 dark:border-gray-850 transition-colors">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'messes', label: 'Messes', icon: Home },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'complaints', label: 'Complaints', icon: MessageSquare },
          { id: 'broadcast', label: 'Broadcast', icon: Radio },
          { id: 'health_config', label: 'System Health', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition focus:outline-none ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-150 dark:shadow-none'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-850'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-855 shadow-sm flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-2xl font-black text-emerald-650 dark:text-emerald-450">₹{stats.totalRevenue}</h3>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl text-emerald-600 dark:text-emerald-400"><TrendingUp size={22} /></div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-855 shadow-sm flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Messes</p>
                <h3 className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{stats.totalMesses}</h3>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3.5 rounded-2xl text-indigo-600 dark:text-indigo-400"><Home size={22} /></div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-855 shadow-sm flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Students</p>
                <h3 className="text-2xl font-black text-gray-805 dark:text-white">{stats.totalStudents}</h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl text-blue-600 dark:text-blue-400"><Users size={22} /></div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-855 shadow-sm flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Complaints Panel</p>
                <h3 className="text-2xl font-black text-amber-500">{stats.pendingComplaints} / {stats.totalComplaints}</h3>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/40 p-3.5 rounded-2xl text-orange-605 dark:text-orange-400"><MessageSquare size={22} /></div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Platform Expansion Metrics</h3>
              <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-xl">Real-time stats</span>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.growthStats} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke={isDark ? '#9CA3AF' : '#4B5563'} tick={{fontSize: 10}} />
                  <YAxis stroke={isDark ? '#9CA3AF' : '#4B5563'} tick={{fontSize: 10}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1f2937' : '#E5E7EB'} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#111827' : '#ffffff', border: isDark ? '1px solid #374151' : 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="users" name="Active Members" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Messes management tab */}
      {activeTab === 'messes' && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm space-y-6 transition-colors">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-800 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Mess Profiles Approval Control</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Approve new mess operations or temporarily block compliance violators.</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <input 
                type="text" 
                placeholder="Search messes..." 
                value={messSearch}
                onChange={e => setMessSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-250 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none"
              />
              <Search size={14} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {filteredMesses.length === 0 ? (
            <EmptyState 
              title="No messes found" 
              description="No registered messes match your current search query." 
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-gray-105 dark:border-gray-850">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4 rounded-l-lg">Mess Name</th>
                      <th className="p-4">Owner Contact</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4">Approval Status</th>
                      <th className="p-4 rounded-r-lg text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                    {paginatedMesses.map(mess => (
                      <tr key={mess._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition">
                        <td className="p-4 font-bold text-sm text-gray-800 dark:text-gray-205">{mess.name}</td>
                        <td className="p-4 text-xs">
                          <div className="font-bold text-gray-800 dark:text-gray-200">{mess.owner?.name || 'N/A'}</div>
                          <div className="text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{mess.owner?.email || 'N/A'}</div>
                        </td>
                        <td className="p-4 text-xs text-gray-500 dark:text-gray-400">{new Date(mess.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-xs">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            mess.isApproved ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-450' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-450'
                          }`}>
                            {mess.isApproved ? 'Approved' : 'Blocked'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-right">
                          <button
                            onClick={() => handleToggleMessStatus(mess._id, mess.isApproved)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto focus:outline-none ${
                              mess.isApproved 
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' 
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
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
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination 
                currentPage={messPage}
                totalPages={totalMessPages}
                onPageChange={setMessPage}
              />
            </>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm space-y-6 transition-colors">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-800 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">User Account Operations</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Suspend or activate students and owners across the platform.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input 
                  type="text" 
                  placeholder="Search user..." 
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-250 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none"
                />
                <Search size={14} className="absolute left-3 top-3.5 text-gray-400" />
              </div>

              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Roles</option>
                <option value="student">Students</option>
                <option value="mess_owner">Mess Owners</option>
              </select>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <EmptyState 
              title="No users found" 
              description="No user accounts match your search filters." 
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-gray-105 dark:border-gray-850">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4 rounded-l-lg">User Details</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Associated Mess</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 rounded-r-lg text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                    {paginatedUsers.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition">
                        <td className="p-4 text-xs">
                          <div className="font-bold text-gray-800 dark:text-gray-205">{user.name}</div>
                          <div className="text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{user.email}</div>
                        </td>
                        <td className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          {user.role === 'student' ? 'Student' : 'Mess Owner'}
                        </td>
                        <td className="p-4 text-xs text-gray-700 dark:text-gray-300">
                          {user.activeMess?.name || <span className="text-gray-400 dark:text-gray-600 italic text-[11px]">No active mess</span>}
                        </td>
                        <td className="p-4 text-xs">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            user.isSuspended ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' : 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-450'
                          }`}>
                            {user.isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-right">
                          <button
                            onClick={() => handleToggleUserSuspension(user._id, user.isSuspended)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ml-auto focus:outline-none ${
                              user.isSuspended 
                                ? 'bg-green-50 hover:bg-green-100 text-green-750 dark:bg-green-950/40 dark:text-green-400' 
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-750 dark:bg-rose-950/40 dark:text-rose-400'
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
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination 
                currentPage={userPage}
                totalPages={totalUserPages}
                onPageChange={setUserPage}
              />
            </>
          )}
        </div>
      )}

      {/* Complaints panel */}
      {activeTab === 'complaints' && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm space-y-6 transition-colors">
          <div>
            <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Student Complaints Resolution</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review student issues and input direct resolutions that alert users immediately.</p>
          </div>

          {complaints.length === 0 ? (
            <EmptyState 
              title="All complaints resolved" 
              description="No complaints have been reported yet on the platform." 
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-gray-105 dark:border-gray-850">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-950 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4 rounded-l-lg">Student</th>
                      <th className="p-4">Mess Name</th>
                      <th className="p-4">Issue Description</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 rounded-r-lg text-right">Action / Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                    {paginatedComplaints.map(comp => (
                      <tr key={comp._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition align-top">
                        <td className="p-4 text-xs">
                          <div className="font-bold text-gray-800 dark:text-gray-205">{comp.student?.name}</div>
                          <div className="text-gray-550 dark:text-gray-400 font-semibold mt-0.5">{comp.student?.email}</div>
                        </td>
                        <td className="p-4 text-xs font-bold text-gray-800 dark:text-gray-200">{comp.mess?.name || 'N/A'}</td>
                        <td className="p-4 text-xs max-w-xs space-y-1">
                          <div className="font-extrabold text-gray-900 dark:text-white">{comp.title}</div>
                          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{comp.description}</p>
                        </td>
                        <td className="p-4 text-xs">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            comp.status === 'resolved' ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-450' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                          }`}>
                            {comp.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-right">
                          {comp.status === 'resolved' ? (
                            <div className="text-left text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900 max-w-xs ml-auto">
                              <span className="font-extrabold">Resolution:</span> {comp.resolution}
                            </div>
                          ) : resolvingId === comp._id ? (
                            <div className="space-y-2.5 max-w-xs ml-auto animate-scale-up">
                              <textarea
                                value={resolutionText}
                                onChange={e => setResolutionText(e.target.value)}
                                placeholder="Enter resolution details..."
                                className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows={2}
                              />
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => handleResolveComplaint(comp._id)} 
                                  className="bg-emerald-600 hover:bg-emerald-705 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition"
                                >
                                  Submit
                                </button>
                                <button 
                                  onClick={() => setResolvingId(null)} 
                                  className="bg-gray-105 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setResolvingId(comp._id);
                                setResolutionText('');
                              }}
                              className="bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm focus:outline-none"
                            >
                              Resolve Issue
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination 
                currentPage={complaintPage}
                totalPages={totalComplaintPages}
                onPageChange={setComplaintPage}
              />
            </>
          )}
        </div>
      )}

      {/* Broadcast Tab */}
      {activeTab === 'broadcast' && (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-105 dark:border-gray-850 shadow-sm max-w-xl mx-auto space-y-6 transition-colors">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={18} className="text-indigo-600 dark:text-indigo-400" /> Platform-wide Broadcast
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">Send a direct message/announcement that reaches all registered students & mess owners instantly via real-time WebSocket push notifications and stores inside their alerts dashboard.</p>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. Schedule Maintenance Notice"
                value={announcement.title}
                onChange={e => setAnnouncement({ ...announcement, title: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-250 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Message Content</label>
              <textarea
                placeholder="Write announcement body here..."
                value={announcement.message}
                onChange={e => setAnnouncement({ ...announcement, message: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-250 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold focus:outline-none"
                rows={5}
                required
              />
            </div>

            <button
              type="submit"
              disabled={broadcasting}
              className="w-full bg-indigo-650 hover:bg-indigo-755 text-white py-3 rounded-2xl font-bold shadow-sm transition flex items-center justify-center gap-2 text-xs disabled:bg-indigo-305 focus:outline-none"
            >
              {broadcasting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <><Radio size={14} /> Send Broadcast Now</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* System diagnostics tab */}
      {activeTab === 'health_config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm space-y-6 transition-colors">
            <div>
              <h3 className="text-sm font-extrabold text-gray-805 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Settings size={18} className="text-indigo-600 dark:text-indigo-400" /> Global System Settings
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Configure global application variables dynamically.</p>
            </div>

            <div className="space-y-4">
              {settings.map(sett => (
                <div key={sett._id} className="border border-gray-100 dark:border-gray-800 p-4 rounded-2xl space-y-3 bg-gray-50/50 dark:bg-gray-955/20">
                  <div>
                    <h4 className="font-extrabold text-gray-800 dark:text-gray-200 text-xs">{sett.key}</h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">{sett.description}</p>
                  </div>
                  
                  <div className="flex gap-2 pt-1 items-center">
                    {typeof sett.value === 'boolean' ? (
                      <select
                        value={sett.value.toString()}
                        onChange={e => handleUpdateSetting(sett.key, e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl text-xs font-bold focus:outline-none"
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
                          className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {health && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 shadow-sm space-y-6 transition-colors">
              <div>
                <h3 className="text-sm font-extrabold text-gray-805 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Heart size={18} className="text-emerald-500" /> Live System Diagnostics
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monitor operational server status and platform metrics.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-3 bg-gray-50/50 dark:bg-gray-955/20">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl"><Cpu size={18} /></div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-550 uppercase">Process Status</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{health.status}</span>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-3 bg-gray-50/50 dark:bg-gray-955/20">
                  <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-605 dark:text-blue-400 p-2.5 rounded-xl"><HardDrive size={18} /></div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-550 uppercase">DB Connection</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{health.database}</span>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-3 bg-gray-50/50 dark:bg-gray-955/20">
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-605 dark:text-indigo-400 p-2.5 rounded-xl"><Clock size={18} /></div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-550 uppercase">Server Uptime</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{health.uptime}</span>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-3 bg-gray-50/50 dark:bg-gray-955/20">
                  <div className="bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400 p-2.5 rounded-xl"><Activity size={18} /></div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-550 uppercase">Heap Memory</span>
                    <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{health.memory?.heapUsed} / {health.memory?.heapTotal}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 dark:border-gray-800 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-950/45 space-y-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Node.js Version:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{health.nodeVersion}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Server OS Platform:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">{health.platform}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>RSS Memory Allocation:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{health.memory?.rss}</span>
                </div>
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
};

export default SuperAdminDashboard;
