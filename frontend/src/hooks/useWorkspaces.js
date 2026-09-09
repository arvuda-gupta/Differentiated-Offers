import { useState, useEffect, useCallback } from 'react';
import { workspaceService } from '../services/workspaceService';
import { normalizeWorkspaceList, normalizeWorkspace } from '../utils/dataNormalizer';

const DELETED_KEY = 'syngenta_deleted_workspaces';
const UPDATED_KEY = 'syngenta_updated_workspaces';
const CREATED_KEY = 'syngenta_created_workspaces';

export const getDeletedIds = () => {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY)) || [];
  } catch {
    return [];
  }
};

export const getUpdatedMap = () => {
  try {
    return JSON.parse(localStorage.getItem(UPDATED_KEY)) || {};
  } catch {
    return {};
  }
};

export const getCreatedList = () => {
  try {
    return JSON.parse(localStorage.getItem(CREATED_KEY)) || [];
  } catch {
    return [];
  }
};

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workspaceService.getWorkspaces();
      const rawList = Array.isArray(data) ? data : [];
      const normalizedList = normalizeWorkspaceList(rawList);

      const deletedIds = new Set(getDeletedIds());
      const updatedMap = getUpdatedMap();
      const createdList = getCreatedList();

      let combined = [...normalizedList];

      // Insert custom created workspaces if not already present
      for (const customWs of createdList) {
        if (!combined.some((w) => String(w.workspace_id) === String(customWs.workspace_id))) {
          combined.unshift(customWs);
        }
      }

      // Filter out deleted IDs
      combined = combined.filter((w) => !deletedIds.has(String(w.workspace_id)));

      // Apply updated properties
      combined = combined.map((w) => {
        const update = updatedMap[String(w.workspace_id)];
        return update ? { ...w, ...update, _edited: true } : w;
      });

      setWorkspaces(combined);
    } catch (err) {
      setError(err.message || 'Failed to load workspaces.');
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const createWorkspace = async (payload) => {
    try {
      let newWs = null;
      try {
        newWs = await workspaceService.createWorkspace(payload);
      } catch (e) {
        newWs = {
          workspace_id: `custom-ws-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString(),
        };
      }

      const normalized = normalizeWorkspace(newWs, 0);
      normalized._custom = true;

      const createdList = getCreatedList();
      createdList.unshift(normalized);
      localStorage.setItem(CREATED_KEY, JSON.stringify(createdList));

      setWorkspaces((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const updateWorkspace = async (id, payload) => {
    try {
      await workspaceService.updateWorkspace(id, payload);
    } catch (err) {
      console.warn('Backend update note:', err);
    }

    const updatedMap = getUpdatedMap();
    updatedMap[String(id)] = { ...(updatedMap[String(id)] || {}), ...payload, _edited: true };
    localStorage.setItem(UPDATED_KEY, JSON.stringify(updatedMap));

    // Also update in createdList if present
    const createdList = getCreatedList().map((w) =>
      String(w.workspace_id) === String(id) ? { ...w, ...payload, _edited: true } : w
    );
    localStorage.setItem(CREATED_KEY, JSON.stringify(createdList));

    setWorkspaces((prev) =>
      prev.map((ws) =>
        String(ws.workspace_id) === String(id) ? { ...ws, ...payload, _edited: true } : ws
      )
    );
  };

  const deleteWorkspace = async (id) => {
    try {
      await workspaceService.deleteWorkspace(id);
    } catch (err) {
      console.warn('Backend delete note:', err);
    }

    const deletedIds = getDeletedIds();
    if (!deletedIds.includes(String(id))) {
      deletedIds.push(String(id));
      localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
    }

    const createdList = getCreatedList().filter((w) => String(w.workspace_id) !== String(id));
    localStorage.setItem(CREATED_KEY, JSON.stringify(createdList));

    setWorkspaces((prev) => prev.filter((ws) => String(ws.workspace_id) !== String(id)));
  };

  return {
    workspaces,
    loading,
    error,
    refetch: fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  };
};
