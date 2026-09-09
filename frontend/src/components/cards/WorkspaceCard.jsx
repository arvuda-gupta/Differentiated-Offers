import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatDate, getCountryFlag } from '../../utils/formatters';
import { getWorkspaceLifecycleState } from '../../utils/lifecycleManager';
import { ArrowRight, User, Globe, Edit2, Trash2 } from 'lucide-react';

export const WorkspaceCard = ({ workspace, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const lifecycle = getWorkspaceLifecycleState(workspace.workspace_id);

  return (
    <Card
      hoverable
      onClick={() => navigate(`/workspaces/${workspace.workspace_id}`)}
      className="flex flex-col justify-between h-full group border-slate-200/90 hover:border-indigo-200 transition-all duration-200 relative"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{getCountryFlag(workspace.country)}</span>
            <Badge variant="slate" size="sm">{workspace.region || 'Europe'}</Badge>
          </div>

          <div className="flex items-center gap-1">
            <Badge variant="indigo" size="sm">
              {workspace.archetype || 'Product Plus'}
            </Badge>

            {/* Quick Action Icons */}
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(workspace);
                }}
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit Workspace"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(workspace.workspace_id);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Workspace"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
          {workspace.name}
        </h3>

        {/* Current Lifecycle State Badge */}
        <div className="mt-2 mb-3">
          <Badge variant={lifecycle.badgeVariant} size="sm">
            {lifecycle.statusLabel}
          </Badge>
        </div>

        <div className="space-y-2 mt-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{workspace.owner_role || 'Commercial Lead'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Target Country: <strong className="text-slate-700">{workspace.country || 'FR'}</strong></span>
          </div>
        </div>
      </div>

      <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Created {formatDate(workspace.created_at)}</span>
        <div className="flex items-center gap-1 font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
          <span>Open Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Card>
  );
};
