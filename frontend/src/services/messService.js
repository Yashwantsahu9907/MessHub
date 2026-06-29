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
};

export default messService;
