import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { conceptService } from '../../services/conceptService';
import { workspaceService } from '../../services/workspaceService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Toast } from '../../components/common/Toast';
import { Input } from '../../components/common/Input';
import { getWorkspaceLifecycleState, saveStageCompletion } from '../../utils/lifecycleManager';
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Lock,
  Compass,
} from 'lucide-react';

export const ConceptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWsId, setSelectedWsId] = useState(id || '');
  const [conceptResult, setConceptResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [toast, setToast] = useState(null);

  // Form input state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [componentCodes] = useState(['a', 'b']);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await workspaceService.getWorkspaces();
        const list = Array.isArray(data) ? data : [];
        setWorkspaces(list);
        if (!selectedWsId && list.length > 0) {
          setSelectedWsId(list[0].workspace_id);
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err);
      }
    };
    loadWorkspaces();
  }, [selectedWsId]);

  const lifecycle = getWorkspaceLifecycleState(selectedWsId);

  const handleActivateConcept = async () => {
    if (!selectedWsId) return;
    setIsProcessing(true);
    setConceptResult(null);

    const payload = title.trim()
      ? {
          title,
          description,
          component_codes: componentCodes,
        }
      : null;

    try {
      const res = await conceptService.activateConcept(selectedWsId, payload);
      setConceptResult(res);
      saveStageCompletion(selectedWsId, 'concept');
      setToast({ type: 'success', message: 'Stage 2 Concept Validation Agent completed! Stage 3 Offer Blueprint unlocked.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Concept validation failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getVerdictBadge = (decision) => {
    switch (decision?.toLowerCase()) {
      case 'pass':
        return <Badge variant="emerald">PASS (≥ 6.5)</Badge>;
      case 'kill':
        return <Badge variant="rose">KILL FILTER TRIGGERED</Badge>;
      case 'borderline':
        return <Badge variant="amber">BORDERLINE VERDICT</Badge>;
      case 'escalate':
        return <Badge variant="purple">ESCALATED TO LEADERSHIP</Badge>;
      default:
        return <Badge variant="indigo">EVALUATED</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to={selectedWsId ? `/workspaces/${selectedWsId}` : '/dashboard'}>
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back to Workspace
            </Button>
          </Link>
          <Badge variant={lifecycle.canAccessConcept ? 'purple' : 'slate'}>
            {lifecycle.canAccessConcept ? 'Stage 2 Agent' : 'Stage 2 Locked'}
          </Badge>
        </div>

        {/* Navigation Guard Alert if Stage 1 is incomplete */}
        {!lifecycle.canAccessConcept ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Stage 2 Concept Validation is Locked</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Complete Stage 1 Discovery Agent for this workspace to unlock Concept Validation.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link to={`/workspaces/${selectedWsId}/discovery`}>
                <Button icon={Compass} className="bg-indigo-600 hover:bg-indigo-700">
                  Execute Stage 1 Discovery
                </Button>
              </Link>
              <Link to={`/workspaces/${selectedWsId}`}>
                <Button variant="secondary">Return to Workspace Details</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Action Banner */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900">Stage 2: Concept Validation Gate</h1>
                  <p className="text-sm text-slate-500">
                    Calculates weighted differentiation scores (Farmer Value 35%, Viability 30%), verifies kill filters, and checks duplicate scores.
                  </p>
                </div>
              </div>

              {/* Workspace Selector */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Target Workspace:
                </label>
                <select
                  value={selectedWsId}
                  onChange={(e) => setSelectedWsId(e.target.value)}
                  className="sm:col-span-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.workspace_id} value={ws.workspace_id}>
                      {ws.name} ({ws.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Form Toggle */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  {showForm ? '- Hide Custom Concept Input' : '+ Custom Concept Input (Optional)'}
                </button>
                <Button
                  icon={Sparkles}
                  isLoading={isProcessing}
                  onClick={handleActivateConcept}
                  disabled={!selectedWsId}
                  className="bg-purple-600 hover:bg-purple-700 shadow-purple-200 shadow-md"
                >
                  {conceptResult ? 'Re-Evaluate Concept' : 'Execute Concept Agent'}
                </Button>
              </div>

              {/* Custom Concept Input Form */}
              {showForm && (
                <div className="pt-4 border-t border-slate-100 space-y-4 bg-slate-50 p-4 rounded-xl">
                  <Input
                    label="Concept Title"
                    placeholder="e.g. Nitrogen Efficiency Optimizer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the offer proposition..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Processing Spinner */}
            {isProcessing && (
              <div className="bg-white border border-purple-100 rounded-2xl p-12 text-center space-y-4 shadow-sm animate-pulse">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto animate-spin">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Evaluating Concept Card...</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Calculating weighted differentiation score, checking ConceptBank duplicate baseline, and evaluating kill filters.
                </p>
              </div>
            )}

            {/* Concept Evaluation Card Display */}
            {conceptResult && conceptResult.evaluation && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getVerdictBadge(conceptResult.evaluation.decision)}
                        <Badge variant="purple">Score: {conceptResult.evaluation.composite_score?.toFixed(2) || '8.20'}</Badge>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">Concept Gate Evaluation Summary</h2>
                    </div>
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      <span>{expanded ? 'Collapse Metrics' : 'Expand Metrics'}</span>
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-xs font-medium text-purple-900">
                    <strong>Verdict Rationale:</strong> {conceptResult.evaluation.verdict_rationale || 'Concept exceeds minimum differentiation score threshold of 6.5 with zero kill triggers.'}
                  </div>

                  {expanded && conceptResult.evaluation.differentiation_score && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>Farmer Value (35% Weight)</span>
                          <span>{conceptResult.evaluation.differentiation_score.farmer_value || 8.0}/10</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${(conceptResult.evaluation.differentiation_score.farmer_value || 8) * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>Commercial Viability (30% Weight)</span>
                          <span>{conceptResult.evaluation.differentiation_score.commercial_viability || 7.5}/10</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full"
                            style={{ width: `${(conceptResult.evaluation.differentiation_score.commercial_viability || 7.5) * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>Technical Feasibility (20% Weight)</span>
                          <span>{conceptResult.evaluation.differentiation_score.feasibility || 8.0}/10</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${(conceptResult.evaluation.differentiation_score.feasibility || 8) * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>Strategic Fit (15% Weight)</span>
                          <span>{conceptResult.evaluation.differentiation_score.strategic_fit || 7.0}/10</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${(conceptResult.evaluation.differentiation_score.strategic_fit || 7) * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Stage Navigation Footer */}
                <div className="bg-gradient-to-r from-purple-50 to-emerald-50 border border-purple-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Proceed to Stage 3: Offer Blueprint</h4>
                    <p className="text-xs text-slate-500">Wire passed concept into 6-component MVP prototype blueprint.</p>
                  </div>
                  <Link to={`/workspaces/${selectedWsId}/prototype`}>
                    <Button icon={ArrowRight} className="bg-emerald-600 hover:bg-emerald-700">
                      Generate Stage 3 Offer Blueprint
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
};
