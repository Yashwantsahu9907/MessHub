import api from './api';

const getMessProfile = async () => {
  const response = await api.get('/mess/profile');
  return response.data;
};

const requestJoin = async (joinCode) => {
  const response = await api.post('/mess/join', { joinCode });
  return response.data;
};

const messService = {
  getMessProfile,
  requestJoin,
};

export default messService;
