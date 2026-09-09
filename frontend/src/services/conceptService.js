import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const conceptService = {
  activateConcept: async (workspaceId, payload = null) => {
    return await api.post(ENDPOINTS.ACTIVATE_CONCEPT(workspaceId), payload);
  },

  getConcepts: async () => {
    return await api.get(ENDPOINTS.CONCEPTS);
  },
};
