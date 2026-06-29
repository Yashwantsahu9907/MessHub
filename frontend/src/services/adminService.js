import api from './api';

const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

const getMesses = async () => {
  const response = await api.get('/admin/messes');
  return response.data;
};

const updateMessStatus = async (id, isApproved) => {
  const response = await api.put(`/admin/messes/${id}/status`, { isApproved });
  return response.data;
};

const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

const updateUserSuspension = async (id, isSuspended) => {
  const response = await api.put(`/admin/users/${id}/suspend`, { isSuspended });
  return response.data;
};

const broadcastAnnouncement = async (announcementData) => {
  const response = await api.post('/admin/broadcast', announcementData);
  return response.data;
};

const getComplaints = async () => {
  const response = await api.get('/admin/complaints');
  return response.data;
};

const resolveComplaint = async (id, resolution) => {
  const response = await api.put(`/admin/complaints/${id}/resolve`, { resolution });
  return response.data;
};

const getSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

const updateSetting = async (key, value) => {
  const response = await api.put('/admin/settings', { key, value });
  return response.data;
};

const getHealth = async () => {
  const response = await api.get('/admin/health');
  return response.data;
};

const adminService = {
  getStats,
  getMesses,
  updateMessStatus,
  getUsers,
  updateUserSuspension,
  broadcastAnnouncement,
  getComplaints,
  resolveComplaint,
  getSettings,
  updateSetting,
  getHealth
};

export default adminService;
