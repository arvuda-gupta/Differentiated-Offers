import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const offerBankService = {
  getOffers: async () => {
    return await api.get(ENDPOINTS.OFFERS);
  },

  createOffer: async (payload) => {
    return await api.post(ENDPOINTS.OFFERS, payload);
  },
};
