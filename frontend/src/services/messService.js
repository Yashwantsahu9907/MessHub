import api from './api';

const getMessProfile = async () => {
  const response = await api.get('/mess/profile');
  return response.data;
};

const requestJoin = async (joinCode) => {
  const response = await api.post('/mess/join', { joinCode });
  return response.data;
};

const getJoinRequests = async () => {
  const response = await api.get('/mess/requests');
  return response.data;
};

const processJoinRequest = async (requestId, status) => {
  const response = await api.put(`/mess/requests/${requestId}`, { status });
  return response.data;
};

const getMessMembers = async () => {
  const response = await api.get('/mess/members');
  return response.data;
};

const removeMember = async (studentId) => {
  const response = await api.delete(`/mess/members/${studentId}`);
  return response.data;
};

const getStudentMess = async () => {
  const response = await api.get('/mess/student/active');
  return response.data;
};

const markAttendance = async (joinCode) => {
  const response = await api.post('/mess/attendance', { joinCode });
  return response.data;
};

const getNotifications = async () => {
  const response = await api.get('/mess/notifications');
  return response.data;
};

const markNotificationRead = async (id) => {
  const response = await api.put(`/mess/notifications/${id}/read`);
  return response.data;
};

const markAllNotificationsRead = async () => {
  const response = await api.put('/mess/notifications/read-all');
  return response.data;
};

const getPlans = async () => {
  const response = await api.get('/mess/plans');
  return response.data;
};

const createPlan = async (planData) => {
  const response = await api.post('/mess/plans', planData);
  return response.data;
};

const assignPlan = async (studentId, planId) => {
  const response = await api.post('/mess/payments/assign', { studentId, planId });
  return response.data;
};

const getOwnerPayments = async () => {
  const response = await api.get('/mess/payments');
  return response.data;
};

const updatePaymentStatus = async (paymentId, status) => {
  const response = await api.put(`/mess/payments/${paymentId}/status`, { status });
  return response.data;
};

const getStudentPayments = async () => {
  const response = await api.get('/mess/student/payments');
  return response.data;
};

const getAnalytics = async (params) => {
  const response = await api.get('/mess/analytics', { params });
  return response.data;
};

const submitComplaint = async (complaintData) => {
  const response = await api.post('/mess/complaints', complaintData);
  return response.data;
};

const messService = {
  getMessProfile,
  requestJoin,
  getJoinRequests,
  processJoinRequest,
  getMessMembers,
  removeMember,
  getStudentMess,
  markAttendance,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getPlans,
  createPlan,
  assignPlan,
  getOwnerPayments,
  updatePaymentStatus,
  getStudentPayments,
  getAnalytics,
  submitComplaint,
};

export default messService;
