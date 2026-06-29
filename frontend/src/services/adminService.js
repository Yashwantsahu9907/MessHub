import api from './api';

const getPlatformStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

const adminService = {
  getPlatformStats,
};

export default adminService;
