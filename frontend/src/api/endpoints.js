export const ENDPOINTS = {
  WORKSPACES: '/v1/workspaces',
  WORKSPACE_BY_ID: (id) => `/v1/workspaces/${id}`,
  ACTIVATE_DISCOVERY: (id) => `/v1/workspace/${id}/activate-discovery`,
  ACTIVATE_CONCEPT: (id) => `/v1/concepts/activate/${id}`,
  ACTIVATE_PROTOTYPE: (id) => `/v1/prototypes/activate/${id}`,
  CONCEPTS: '/v1/concepts',
  NEEDS: '/v1/needs',
  OFFERS: '/v1/offers',
  EVENTS: '/v1/events',
};
