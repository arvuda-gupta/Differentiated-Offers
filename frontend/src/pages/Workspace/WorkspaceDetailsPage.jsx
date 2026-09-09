import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { workspaceService } from '../../services/workspaceService';
import { workspaceEventService } from '../../services/workspaceEventService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { WorkspaceForm } from '../../components/forms/WorkspaceForm';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Timeline } from '../../components/layout/Timeline';
import { formatDate, getCountryFlag } from '../../utils/formatters';
import { normalizeWorkspace } from '../../utils/dataNormalizer';
import { getWorkspaceLifecycleState } from '../../utils/lifecycleManager';
import { getUpdatedMap, getCreatedList, getDeletedIds, useWorkspaces } from '../../hooks/useWorkspaces';
import {
  ArrowLeft,
  Compass,
  Lightbulb,
  Boxes,
  Lock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';

export const WorkspaceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateWorkspace, deleteWorkspace } = useWorkspaces();
  const [workspace, setWorkspace] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        let wsData = null;

        const deletedIds = new Set(getDeletedIds());
        if (deletedIds.has(String(id))) {
          throw new Error('Workspace has been deleted.');
        }

        const createdList = getCreatedList();
        const customFound = createdList.find((w) => String(w.workspace_id) === String(id));

        if (customFound) {
          wsData = customFound;
        } else {
          try {
            wsData = await workspaceService.getWorkspaceById(id);
          } catch (singleErr) {
            const allWs = await workspaceService.getWorkspaces();
            if (Array.isArray(allWs)) {
              wsData = allWs.find((w) => String(w.workspace_id) === String(id));
            }
          }
        }

        if (!wsData) {
          throw new Error('Workspace not found. Please select a workspace from the dashboard.');
        }

        let normalized = normalizeWorkspace(wsData, 0);

        const updatedMap = getUpdatedMap();
        if (updatedMap[String(id)]) {
          normalized = { ...normalized, ...updatedMap[String(id)], _edited: true };
        }

        setWorkspace(normalized);

        try {
          const eventsData = await workspaceEventService.getEvents();
          const filteredEvents = Array.isArray(eventsData)
            ? eventsData.filter((e) => String(e.workspace_id) === String(id))
            : [];
          setEvents(filteredEvents);
        } catch (evtErr) {
          setEvents([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load workspace details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const handleUpdateWorkspace = async (formData) => {
    setIsSubmitting(true);
    try {
      await updateWorkspace(id, formData);
      setWorkspace((prev) => ({ ...prev, ...formData, _edited: true }));
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to update workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (window.confirm(`Are you sure you want to delete '${workspace?.name}'?`)) {
      try {
        await deleteWorkspace(id);
      } catch (err) {
        console.warn('Backend delete note:', err);
      } finally {
        navigate('/dashboard');
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingSkeleton count={3} />
      </MainLayout>
    );
  }

  if (error || !workspace) {
    return (
      <MainLayout>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-rose-900">Workspace Not Found</h3>
          <p className="text-sm text-rose-600 max-w-md mx-auto">{error || 'Invalid workspace ID'}</p>
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const lifecycle = getWorkspaceLifecycleState(id, events);

  return (
    <MainLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Back Navigation & Status */}
        <div className="flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back to Workspaces
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit2}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={handleDeleteWorkspace}
              className="text-rose-600 hover:bg-rose-50 hover:border-rose-200"
            >
              Delete
            </Button>

            <Badge variant={lifecycle.badgeVariant}>
              {lifecycle.statusLabel}
            </Badge>
          </div>
        </div>

        {/* Workspace Overview Banner */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getCountryFlag(workspace.country)}</span>
                <Badge variant="indigo">{workspace.archetype || 'Product Plus'}</Badge>
                <Badge variant="slate">{workspace.region || 'Continental'}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {workspace.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                <span>Created: {formatDate(workspace.created_at)}</span>
                <span>•</span>
                <span>Role: {workspace.owner_role || 'Commercial Lead'}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={lifecycle.discoveryCompleted ? CheckCircle2 : Compass}
                onClick={() => navigate(`/workspaces/${id}/discovery`)}
              >
                {lifecycle.discoveryCompleted ? '✓ Discovery Completed' : '1. Discovery'}
              </Button>

              <Button
                variant={lifecycle.canAccessConcept ? 'outline' : 'ghost'}
                size="sm"
                icon={lifecycle.canAccessConcept ? (lifecycle.conceptCompleted ? CheckCircle2 : Lightbulb) : Lock}
                disabled={!lifecycle.canAccessConcept}
                onClick={() => navigate(`/workspaces/${id}/concept`)}
              >
                {lifecycle.conceptCompleted ? '✓ Concept Validated' : '2. Concept Validation'}
              </Button>

              <Button
                variant={lifecycle.canAccessPrototype ? 'primary' : 'ghost'}
                size="sm"
                icon={lifecycle.canAccessPrototype ? (lifecycle.prototypeCompleted ? CheckCircle2 : Boxes) : Lock}
                disabled={!lifecycle.canAccessPrototype}
                onClick={() => navigate(`/workspaces/${id}/prototype`)}
              >
                {lifecycle.prototypeCompleted ? '✓ Blueprint Built' : '3. Offer Blueprint'}
              </Button>
            </div>
          </div>

          {/* Sequential Stage Gate Guidance Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Next Action Guidance:</span>
              <span className="text-slate-600">
                {!lifecycle.discoveryCompleted
                  ? 'Execute Stage 1 Discovery Agent to analyze grower needs and unlock Concept Validation.'
                  : !lifecycle.conceptCompleted
                  ? 'Execute Stage 2 Concept Validation to run differentiation scoring and unlock Offer Blueprint.'
                  : 'Execute Stage 3 Offer Blueprint to build 6-component commercial offer architecture.'}
              </span>
            </div>

            {!lifecycle.discoveryCompleted && (
              <Button size="sm" icon={Compass} onClick={() => navigate(`/workspaces/${id}/discovery`)}>
                Run Discovery Agent →
              </Button>
            )}
            {lifecycle.discoveryCompleted && !lifecycle.conceptCompleted && (
              <Button size="sm" icon={Lightbulb} className="bg-purple-600 hover:bg-purple-700" onClick={() => navigate(`/workspaces/${id}/concept`)}>
                Run Concept Validation →
              </Button>
            )}
            {lifecycle.conceptCompleted && (
              <Button size="sm" icon={Boxes} className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate(`/workspaces/${id}/prototype`)}>
                Build Offer Blueprint →
              </Button>
            )}
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Parameters</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Target Country</span>
                <span className="font-semibold text-slate-900">{getCountryFlag(workspace.country)} {workspace.country}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Geographic Region</span>
                <span className="font-semibold text-slate-900">{workspace.region}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Commercial Archetype</span>
                <span className="font-semibold text-slate-900">{workspace.archetype}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Owner Role</span>
                <span className="font-semibold text-slate-900">{workspace.owner_role}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Stage Gate Progression</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${lifecycle.discoveryCompleted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200/60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Stage 1</span>
                  {lifecycle.discoveryCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Badge size="sm" variant="indigo">Unlocked</Badge>}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Discovery Agent</h4>
                <p className="text-[11px] text-slate-500">Formulate problem statement and commercial opportunity.</p>
              </div>

              <div className={`p-4 rounded-xl border ${lifecycle.conceptCompleted ? 'bg-emerald-50/50 border-emerald-200' : lifecycle.canAccessConcept ? 'bg-purple-50/30 border-purple-200' : 'bg-slate-50 border-slate-200/60 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Stage 2</span>
                  {lifecycle.conceptCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : lifecycle.canAccessConcept ? <Badge size="sm" variant="indigo">Unlocked</Badge> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Concept Validation</h4>
                <p className="text-[11px] text-slate-500">5-criteria differentiation scoring and kill filter decision.</p>
              </div>

              <div className={`p-4 rounded-xl border ${lifecycle.prototypeCompleted ? 'bg-emerald-50/50 border-emerald-200' : lifecycle.canAccessPrototype ? 'bg-emerald-50/30 border-emerald-200' : 'bg-slate-50 border-slate-200/60 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Stage 3</span>
                  {lifecycle.prototypeCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : lifecycle.canAccessPrototype ? <Badge size="sm" variant="emerald">Unlocked</Badge> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Offer Blueprint</h4>
                <p className="text-[11px] text-slate-500">6-component building block MVP offer architecture.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Event Activity Timeline */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Workspace Activity & Agent Audit Trail</h2>
          <Timeline events={events} />
        </div>

        {/* Edit Workspace Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Commercial Offer Workspace"
          subtitle={`Update configuration settings for '${workspace.name}'`}
        >
          <WorkspaceForm
            onSubmit={handleUpdateWorkspace}
            isLoading={isSubmitting}
            initialValues={workspace}
          />
        </Modal>
      </div>
    </MainLayout>
  );
};
