import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { WorkspaceCard } from '../../components/cards/WorkspaceCard';
import { WorkspaceTable } from '../../components/tables/WorkspaceTable';
import { MetricCard } from '../../components/cards/MetricCard';
import { WorkspaceForm } from '../../components/forms/WorkspaceForm';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { COUNTRIES } from '../../utils/constants';
import { needsBankService } from '../../services/needsBankService';
import { offerBankService } from '../../services/offerBankService';
import { normalizeNeedsList, normalizeOffersList } from '../../utils/dataNormalizer';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  FolderGit2,
  Database,
  Briefcase,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const DashboardPage = () => {
  const { workspaces, loading, error, refetch, createWorkspace, updateWorkspace, deleteWorkspace } = useWorkspaces();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedArchetype, setSelectedArchetype] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'name'

  const [needsCount, setNeedsCount] = useState(70);
  const [offersCount, setOffersCount] = useState(87);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const needsData = await needsBankService.getNeeds();
        setNeedsCount(normalizeNeedsList(needsData).length);
      } catch (err) {
        setNeedsCount(normalizeNeedsList([]).length);
      }

      try {
        const offersData = await offerBankService.getOffers();
        setOffersCount(normalizeOffersList(offersData).length);
      } catch (err) {
        setOffersCount(normalizeOffersList([]).length);
      }
    };
    fetchCounts();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingWorkspace(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (workspace) => {
    setEditingWorkspace(workspace);
    setIsModalOpen(true);
  };

  // Delete Workspace
  const handleDeleteWorkspace = async (workspaceId) => {
    if (window.confirm('Are you sure you want to delete this commercial offer workspace?')) {
      try {
        await deleteWorkspace(workspaceId);
      } catch (err) {
        alert(err.message || 'Failed to delete workspace');
      }
    }
  };

  // Handle Workspace Form Submission (Create or Update)
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingWorkspace) {
        await updateWorkspace(editingWorkspace.workspace_id, formData);
      } else {
        await createWorkspace(formData);
      }
      setIsModalOpen(false);
      setEditingWorkspace(null);
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search & Filter Logic
  const filteredWorkspaces = useMemo(() => {
    return workspaces
      .filter((ws) => {
        const matchesSearch =
          ws.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ws.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ws.archetype?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCountry = selectedCountry === 'ALL' || ws.country === selectedCountry;
        const matchesArchetype = selectedArchetype === 'ALL' || ws.archetype === selectedArchetype;

        return matchesSearch && matchesCountry && matchesArchetype;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [workspaces, searchQuery, selectedCountry, selectedArchetype, sortBy]);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Commercial Offer Workspaces
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage European offer project spaces and execute autonomous Stage 1-3 lifecycle agents.
            </p>
          </div>
          <Button icon={Plus} onClick={handleOpenCreate} className="shadow-indigo-200 shadow-md">
            New Workspace
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Total Workspaces"
            value={workspaces.length}
            subtitle="Active European commercial projects"
            icon={FolderGit2}
          />
          <MetricCard
            title="Needs Bank Asset"
            value={needsCount}
            subtitle="Seeded customer pain points"
            icon={Database}
          />
          <MetricCard
            title="Offer Bank Library"
            value={offersCount}
            subtitle="Scored European offers"
            icon={Briefcase}
          />
          <MetricCard
            title="Active Engine"
            value="Stage 1-3"
            subtitle="Autonomous AI Lifecycle"
            icon={Layers}
          />
        </div>

        {/* Controls Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search workspaces by name, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filters & View Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Countries</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={selectedArchetype}
              onChange={(e) => setSelectedArchetype(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Archetypes</option>
              <option value="Product Plus">Product Plus</option>
              <option value="Demand Generation">Demand Generation</option>
              <option value="E2E Service">E2E Service</option>
              <option value="Outcome-Based Offer">Outcome-Based Offer</option>
              <option value="Subscription (SaaS)">Subscription (SaaS)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="name">Alphabetical</option>
            </select>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Display (Grid or Table) */}
        {loading ? (
          <LoadingSkeleton type="card" count={6} />
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-rose-900">Failed to Load Workspaces</h3>
            <p className="text-xs text-rose-700">{error}</p>
            <Button size="sm" variant="secondary" icon={RefreshCw} onClick={refetch}>
              Retry Connection
            </Button>
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No Workspaces Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No offer project spaces match your search criteria. Try resetting filters or create a new workspace.
              </p>
            </div>
            <Button icon={Plus} onClick={handleOpenCreate}>
              Create First Workspace
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.workspace_id}
                workspace={workspace}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteWorkspace}
              />
            ))}
          </div>
        ) : (
          <WorkspaceTable
            workspaces={filteredWorkspaces}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteWorkspace}
          />
        )}

        {/* Create / Edit Workspace Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingWorkspace(null);
          }}
          title={editingWorkspace ? 'Edit Commercial Offer Workspace' : 'Create Commercial Offer Workspace'}
          subtitle={
            editingWorkspace
              ? `Update configuration details for '${editingWorkspace.name}'`
              : 'Initialize a new project space to execute Stage 1-3 lifecycle agents.'
          }
        >
          <WorkspaceForm
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
            initialValues={editingWorkspace}
          />
        </Modal>
      </div>
    </MainLayout>
  );
};
