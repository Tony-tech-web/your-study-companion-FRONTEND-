import api from './api';

export const deactivateAccount = async () => {
  const { data } = await api.post('/api/account/deactivate');
  return data;
};

export const deleteAccount = async () => {
  await api.delete('/api/account');
};
