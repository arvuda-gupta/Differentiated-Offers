import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const needsBankService = {
  getNeeds: async () => {
    return await api.get(ENDPOINTS.NEEDS);
  },

  createNeed: async (payload) => {
    return await api.post(ENDPOINTS.NEEDS, payload);
  },
};
