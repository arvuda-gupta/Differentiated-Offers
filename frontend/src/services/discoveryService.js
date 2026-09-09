import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const discoveryService = {
  activateDiscovery: async (workspaceId) => {
    return await api.post(ENDPOINTS.ACTIVATE_DISCOVERY(workspaceId));
  },
};
