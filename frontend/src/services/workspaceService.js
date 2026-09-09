import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const workspaceService = {
  getWorkspaces: async () => {
    return await api.get(ENDPOINTS.WORKSPACES);
  },

  getWorkspaceById: async (id) => {
    const data = await api.get(ENDPOINTS.WORKSPACE_BY_ID(id));
    console.log("Workspace Response:", data);
    return data;
  },

  createWorkspace: async (data) => {
    return await api.post(ENDPOINTS.WORKSPACES, data);
  },

  updateWorkspace: async (id, data) => {
    return await api.patch(ENDPOINTS.WORKSPACE_BY_ID(id), data);
  },

  deleteWorkspace: async (id) => {
    return await api.delete(ENDPOINTS.WORKSPACE_BY_ID(id));
  },
};