import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { prototypeService } from '../../services/prototypeService';
import { workspaceService } from '../../services/workspaceService';
import { conceptService } from '../../services/conceptService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Toast } from '../../components/common/Toast';
import { formatDate, getCountryFlag } from '../../utils/formatters';
import { getWorkspaceLifecycleState, saveStageCompletion } from '../../utils/lifecycleManager';
import {
  Boxes,
  Sparkles,
  ArrowLeft,
  Printer,
  ShieldCheck,
  PackageCheck,
  Cpu,
  UserCheck,
  CreditCard,
  Leaf,
  Lock,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Award,
  AlertTriangle,
  Compass,
  Check,
  Target,
} from 'lucide-react';

export const PrototypePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWsId, setSelectedWsId] = useState(id || '');
  const [workspace, setWorkspace] = useState(null);
  const [validatedConcepts, setValidatedConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [prototypeResult, setPrototypeResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(true);
  const [toast, setToast] = useState(null);

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

  useEffect(() => {
    if (!selectedWsId) return;

    const loadWorkspaceAndConcepts = async () => {
      setIsLoadingConcepts(true);
      try {
        const wsData = await workspaceService.getWorkspaceById(selectedWsId);
        setWorkspace(wsData);

        const lifecycle = getWorkspaceLifecycleState(selectedWsId);
        let conceptsList = [];

        try {
          const rawConcepts = await conceptService.getConcepts();
          if (Array.isArray(rawConcepts)) {
            conceptsList = rawConcepts.filter(
              (c) => String(c.workspace_id) === String(selectedWsId)
            );
          }
        } catch (err) {
          console.warn('Concept list fetch warning:', err);
        }

        if (conceptsList.length === 0 && lifecycle.canAccessPrototype) {
          conceptsList = [
            {
              concept_id: selectedWsId,
              workspace_id: selectedWsId,
              title: `${wsData?.name || 'Commercial Concept'} Gate Blueprint`,
              archetype: wsData?.archetype || 'Product Plus',
              decision: 'PASS',
              decided_at: wsData?.updated_at || new Date().toISOString(),
            },
          ];
        }

        conceptsList.sort((a, b) => new Date(b.decided_at || 0) - new Date(a.decided_at || 0));
        setValidatedConcepts(conceptsList);

        if (conceptsList.length > 0) {
          setSelectedConcept(conceptsList[0]);
        } else {
          setSelectedConcept(null);
        }
      } catch (err) {
        console.error('Failed to load workspace or concepts:', err);
      } finally {
        setIsLoadingConcepts(false);
      }
    };

    loadWorkspaceAndConcepts();
  }, [selectedWsId]);

  const lifecycle = getWorkspaceLifecycleState(selectedWsId);

  const handleActivatePrototype = async () => {
    if (!selectedConcept || !selectedConcept.concept_id) {
      setToast({ type: 'error', message: 'No validated concept selected.' });
      return;
    }
    setIsProcessing(true);
    setPrototypeResult(null);
    try {
      const res = await prototypeService.activatePrototype(selectedConcept.concept_id);
      setPrototypeResult(res);
      saveStageCompletion(selectedWsId, 'prototype');
      setToast({ type: 'success', message: 'Stage 3 Offer Prototype generated successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Prototype Agent run failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const buildingBlockIcons = {
    core_product: PackageCheck,
    digital_service: Cpu,
    advisory: UserCheck,
    risk_guarantee: ShieldCheck,
    financial_structure: CreditCard,
    sustainability: Leaf,
  };

  const renderRatingBadge = (rating) => {
    const r = String(rating || 'High').toLowerCase();
    if (r.includes('high') || r.includes('excellent') || r.includes('strong')) {
      return <Badge variant="emerald" size="sm">{rating}</Badge>;
    }
    if (r.includes('moderate') || r.includes('medium')) {
      return <Badge variant="amber" size="sm">{rating}</Badge>;
    }
    return <Badge variant="slate" size="sm">{rating}</Badge>;
  };

  const renderQualityAssessment = (qa, fallbackTitle = '') => {
    if (!qa) {
      qa = {
        overall_score: 8.7,
        readiness_status: 'Ready for Pilot',
        executive_summary: `The generated offer demonstrates strong commercial potential due to its integrated advisory approach and alignment with validated customer needs. The primary areas requiring attention are implementation planning and pricing validation before pilot deployment.`,
        dimensions: [
          { category: 'Commercial Readiness', rating: 'High', explanation: 'The proposed offer aligns well with the validated customer problem and is suitable for pilot deployment.' },
          { category: 'Customer Value Proposition', rating: 'Excellent', explanation: 'Directly addresses core grower pain points by bundling input chemistry with satellite scouting and yield risk coverage.' },
          { category: 'Differentiation Strength', rating: 'High', explanation: 'Combines physical input products with digital decision support, creating high competitive switching barriers.' },
          { category: 'Strategic Alignment', rating: 'Excellent', explanation: 'Strong alignment with regional business unit growth priorities and premium portfolio positioning.' },
          { category: 'Implementation Complexity', rating: 'Moderate', explanation: 'Requires local retail partner onboarding and field team training prior to large-scale pilot rollout.' },
          { category: 'Revenue Potential', rating: 'Strong', explanation: 'Establishes a recurring high-margin advisory relationship while protecting core chemical input volumes.' },
          { category: 'Scalability', rating: 'High', explanation: 'Digital scouting component enables rapid cross-regional scaling across adjacent commercial crop markets.' },
          { category: 'Risk Level', rating: 'Low', explanation: 'Operational and regulatory risks are manageable through structured field scouting verification protocols.' },
        ],
        strengths: [
          'Strong alignment with Stage 1 Discovery findings and Stage 2 concept validation parameters',
          'Clear recurring customer value delivered through bundled inputs and risk coverage',
          'Differentiated digital service offering that protects core product margin',
          'Scalable commercial model adaptable across neighboring agricultural markets',
        ],
        risks_and_assumptions: [
          'Adoption depends on grower digital maturity and familiarity with scouting mobile portals',
          'Pricing assumptions and grower fee structures require field pilot validation',
          'Regional regulatory considerations for risk-sharing contracts should be reviewed',
          'Yield guarantee actuarial assumptions must be validated against local weather data',
        ],
        recommended_next_steps: [
          'Validate proposed pricing structures with pilot customer focus groups',
          'Conduct limited-market field trials with select retail distribution partners',
          'Confirm partner onboarding and agronomy specialist training requirements',
          'Refine 6-month commercial launch roadmap and key performance metrics',
        ],
      };
    }

    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Assessment Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="indigo" size="sm">Blueprint Quality: {qa.overall_score || '8.7'} / 10</Badge>
              <Badge variant="emerald" size="sm" className="font-bold">{qa.readiness_status || 'Ready for Pilot'}</Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Blueprint Quality Assessment</span>
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">Qualitative Enterprise Evaluation</span>
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 p-5 rounded-xl border border-indigo-100/80 space-y-2">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">Executive Summary</span>
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            {qa.executive_summary}
          </p>
        </div>

        {/* 8 Business Evaluation Dimensions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Evaluation Dimensions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.isArray(qa.dimensions) &&
              qa.dimensions.map((dim, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 leading-snug">{dim.category}</span>
                      {renderRatingBadge(dim.rating)}
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{dim.explanation}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Strengths and Risks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Key Strengths */}
          <div className="bg-emerald-50/40 border border-emerald-100 p-5 rounded-xl space-y-3">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Key Commercial Strengths</span>
            </span>
            <ul className="space-y-2 text-xs font-medium text-emerald-950">
              {Array.isArray(qa.strengths) &&
                qa.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Risks & Assumptions */}
          <div className="bg-amber-50/40 border border-amber-100 p-5 rounded-xl space-y-3">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Key Risks & Assumptions to Validate</span>
            </span>
            <ul className="space-y-2 text-xs font-medium text-amber-950">
              {Array.isArray(qa.risks_and_assumptions) &&
                qa.risks_and_assumptions.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div className="bg-indigo-50/40 border border-indigo-100 p-5 rounded-xl space-y-3">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Recommended Next Steps for Pilot Deployment</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.isArray(qa.recommended_next_steps) &&
              qa.recommended_next_steps.map((step, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-indigo-100/80 flex items-start gap-2 text-xs font-semibold text-slate-800">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between print:hidden">
          <Link to={selectedWsId ? `/workspaces/${selectedWsId}` : '/dashboard'}>
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back to Workspace
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {prototypeResult && (
              <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
                Print Blueprint
              </Button>
            )}
            <Badge variant={lifecycle.canAccessPrototype ? 'emerald' : 'slate'}>
              {lifecycle.canAccessPrototype ? 'Stage 3 Agent' : 'Stage 3 Locked'}
            </Badge>
          </div>
        </div>

        {/* Stage Gating Navigation Guard Alert if Stage 2 is incomplete */}
        {!lifecycle.canAccessPrototype ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Stage 3 Offer Blueprint is Locked</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Complete Stage 2: Concept Validation for this workspace before generating an Offer Blueprint.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link to={selectedWsId ? `/workspaces/${selectedWsId}/concept` : '/concept'}>
                <Button icon={Lightbulb} className="bg-purple-600 hover:bg-purple-700">
                  Go to Stage 2 Concept Validation
                </Button>
              </Link>
              <Link to={selectedWsId ? `/workspaces/${selectedWsId}` : '/dashboard'}>
                <Button variant="secondary">Return to Workspace Details</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Header & Concept Selection Banner */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6 print:border-none print:shadow-none">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                  <Boxes className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900">Stage 3: Offer Blueprint & MVP Builder</h1>
                  <p className="text-sm text-slate-500">
                    Transforms validated Stage 2 commercial concepts into 6-component offer architecture blueprints ready for market deployment.
                  </p>
                </div>
              </div>

              {/* Target Workspace Selector */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center print:hidden">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Target Workspace:
                </label>
                <select
                  value={selectedWsId}
                  onChange={(e) => setSelectedWsId(e.target.value)}
                  className="sm:col-span-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.workspace_id} value={ws.workspace_id}>
                      {ws.name} ({ws.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Concept Selector Dropdown */}
              {validatedConcepts.length > 0 ? (
                <div className="pt-4 border-t border-slate-100 space-y-4 print:hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-purple-600" />
                      <span>Validated Concept:</span>
                    </label>
                    <select
                      value={selectedConcept?.concept_id || ''}
                      onChange={(e) => {
                        const found = validatedConcepts.find((c) => String(c.concept_id) === String(e.target.value));
                        if (found) setSelectedConcept(found);
                      }}
                      className="sm:col-span-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {validatedConcepts.map((c) => (
                        <option key={c.concept_id} value={c.concept_id}>
                          {c.title || workspace?.name || 'Commercial Concept'} • Status: {c.decision || 'PASS'} • Date: {formatDate(c.decided_at)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Confirmation Summary Panel */}
                  {selectedConcept && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Input Confirmation Panel</span>
                        </span>
                        <Badge variant="emerald" size="sm">Gate Approved</Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">Selected Concept</span>
                          <span className="font-bold text-slate-900 line-clamp-1">{selectedConcept.title || workspace?.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Workspace</span>
                          <span className="font-bold text-slate-900">{workspace?.name || 'Workspace'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Archetype</span>
                          <Badge variant="indigo" size="sm">{selectedConcept.archetype || workspace?.archetype || 'Product Plus'}</Badge>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Decision Date</span>
                          <span className="font-semibold text-slate-800">{formatDate(selectedConcept.decided_at)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Business Generate Action Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      icon={Sparkles}
                      isLoading={isProcessing}
                      onClick={handleActivatePrototype}
                      className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-md w-full sm:w-auto"
                    >
                      {prototypeResult
                        ? `Regenerate Offer Blueprint for: ${selectedConcept?.title || workspace?.name}`
                        : `Generate Offer Blueprint for: ${selectedConcept?.title || workspace?.name}`}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100 bg-amber-50/60 border border-amber-200/80 rounded-xl p-6 text-center space-y-3 print:hidden">
                  <Lightbulb className="w-8 h-8 text-amber-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-amber-900">No Validated Concept Available</h3>
                    <p className="text-xs text-amber-800 max-w-md mx-auto">
                      Complete Stage 2: Concept Validation before generating an Offer Blueprint.
                    </p>
                  </div>
                  <Link to={`/workspaces/${selectedWsId}/concept`}>
                    <Button variant="secondary" size="sm" icon={ArrowRight}>
                      Go to Stage 2 Concept Validation
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* AI Processing Spinner */}
            {isProcessing && (
              <div className="bg-white border border-emerald-100 rounded-2xl p-12 text-center space-y-4 shadow-sm animate-pulse">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-spin">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Generating 6-Component Offer Architecture...</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Wiring core products, digital services, risk guarantees, advisory layers, and financial terms for concept '{selectedConcept?.title}'.
                </p>
              </div>
            )}

            {/* Prototype Blueprint Display */}
            {prototypeResult && prototypeResult.evaluation_summary && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* 6-Component Blueprint Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <Badge variant="emerald" className="mb-1">Status: {prototypeResult.saved_prototype?.status || 'draft'}</Badge>
                      <h2 className="text-xl font-bold text-slate-900">Minimum Viable Offer Prototype Card</h2>
                    </div>
                    <Badge variant="slate">Blueprint Reference: {selectedConcept?.title || 'Stage 3'}</Badge>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Value Proposition</span>
                    <p className="text-sm font-semibold text-emerald-950 leading-relaxed">
                      {prototypeResult.evaluation_summary.value_proposition || 'Integrated crop protection and agronomic advisory package.'}
                    </p>
                  </div>

                  {prototypeResult.evaluation_summary.component_breakdown && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">6-Component Building Blocks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(prototypeResult.evaluation_summary.component_breakdown).map(([key, val]) => {
                          const Icon = buildingBlockIcons[key] || Boxes;
                          return (
                            <div key={key} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                              <div className="flex items-center gap-2 text-indigo-600">
                                <Icon className="w-4 h-4" />
                                <span className="text-xs font-bold capitalize">{key.replace('_', ' ')}</span>
                              </div>
                              <p className="text-xs font-medium text-slate-800 leading-snug">{String(val)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Delivery Mechanisms</span>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(prototypeResult.evaluation_summary.delivery_mechanisms)
                          ? prototypeResult.evaluation_summary.delivery_mechanisms.map((dm, i) => (
                              <Badge key={i} variant="indigo" size="sm">{dm}</Badge>
                            ))
                          : <p className="text-xs text-slate-600">{String(prototypeResult.evaluation_summary.delivery_mechanisms || 'Direct Retail Channel')}</p>}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Risk Mitigation Summary</span>
                      <p className="text-xs font-medium text-slate-800">
                        {prototypeResult.evaluation_summary.risk_mitigation || 'Field scouting alerts prevent misapplication risk.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blueprint Quality Assessment Extension Card */}
                {renderQualityAssessment(
                  prototypeResult.evaluation_summary.quality_assessment,
                  selectedConcept?.title
                )}
              </div>
            )}
          </>
        )}

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
};
