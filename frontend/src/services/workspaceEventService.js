import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const workspaceEventService = {
  getEvents: async () => {
    return await api.get(ENDPOINTS.EVENTS);
  },
};
