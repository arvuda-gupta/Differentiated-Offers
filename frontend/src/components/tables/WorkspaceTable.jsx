import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { formatDate, getCountryFlag } from '../../utils/formatters';
import { getWorkspaceLifecycleState } from '../../utils/lifecycleManager';
import { ChevronRight, Edit2, Trash2 } from 'lucide-react';

export const WorkspaceTable = ({ workspaces, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Workspace Name</th>
              <th className="py-3.5 px-4">Country & Region</th>
              <th className="py-3.5 px-4">Lifecycle State</th>
              <th className="py-3.5 px-4">Archetype</th>
              <th className="py-3.5 px-4">Owner Role</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workspaces.map((ws) => {
              const lifecycle = getWorkspaceLifecycleState(ws.workspace_id);
              return (
                <tr
                  key={ws.workspace_id}
                  onClick={() => navigate(`/workspaces/${ws.workspace_id}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 font-semibold text-slate-900 group-hover:text-indigo-600">
                    {ws.name}
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>{getCountryFlag(ws.country)}</span>
                      <span className="font-medium text-slate-800">{ws.country}</span>
                      <span className="text-slate-400">({ws.region})</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={lifecycle.badgeVariant} size="sm">
                      {lifecycle.statusLabel}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="indigo" size="sm">
                      {ws.archetype || 'Product Plus'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {ws.owner_role || 'Commercial Lead'}
                  </td>
                  <td className="py-4 px-4 text-slate-500 text-xs">
                    {formatDate(ws.created_at)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(ws)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Workspace"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(ws.workspace_id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Workspace"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="inline-flex items-center text-xs font-medium text-indigo-600 group-hover:translate-x-1 transition-transform ml-1">
                        <span>View</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
