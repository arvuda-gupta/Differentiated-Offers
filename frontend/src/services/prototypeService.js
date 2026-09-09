import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const prototypeService = {
  activatePrototype: async (conceptId) => {
    return await api.post(ENDPOINTS.ACTIVATE_PROTOTYPE(conceptId));
  },
};
