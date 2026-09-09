import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { discoveryService } from '../../services/discoveryService';
import { workspaceService } from '../../services/workspaceService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Toast } from '../../components/common/Toast';
import { saveStageCompletion } from '../../utils/lifecycleManager';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
  TrendingUp,
  Target,
  ShieldAlert,
  Lightbulb,
  Award,
} from 'lucide-react';

export const DiscoveryPage = () => {
  const { id } = useParams();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWsId, setSelectedWsId] = useState(id || '');
  const [workspace, setWorkspace] = useState(null);
  const [discoveryResult, setDiscoveryResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    const loadWsDetails = async () => {
      if (!selectedWsId) return;
      try {
        const data = await workspaceService.getWorkspaceById(selectedWsId);
        setWorkspace(data);
      } catch (err) {
        console.error('Failed to load workspace details:', err);
      }
    };
    loadWsDetails();
  }, [selectedWsId]);

  const handleActivateDiscovery = async () => {
    if (!selectedWsId) return;
    setIsProcessing(true);
    setDiscoveryResult(null);
    try {
      const res = await discoveryService.activateDiscovery(selectedWsId);
      setDiscoveryResult(res);
      saveStageCompletion(selectedWsId, 'discovery');
      setToast({ type: 'success', message: 'Stage 1 Discovery Agent completed successfully! Stage 2 Concept Gate unlocked.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Discovery Agent run failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderConfidenceBadge = (confidence) => {
    const conf = String(confidence || 'High Confidence').toLowerCase();
    if (conf.includes('high')) {
      return <Badge variant="emerald" size="sm">High Confidence</Badge>;
    }
    if (conf.includes('medium')) {
      return <Badge variant="amber" size="sm">Medium Confidence</Badge>;
    }
    return <Badge variant="slate" size="sm">Low Confidence</Badge>;
  };

  const renderSourceBadge = (source) => {
    return (
      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
        Source: {source || 'Market Analysis'}
      </span>
    );
  };

  const renderOpportunitySummary = (summaryText) => {
    if (!summaryText) return null;

    if (summaryText.includes('Root Cause:') || summaryText.includes('Opportunity:')) {
      const lines = summaryText.split('\n').filter((l) => l.trim().length > 0);
      return (
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
          {lines.map((line, idx) => {
            const parts = line.split(':');
            const label = parts[0]?.trim();
            const content = parts.slice(1).join(':')?.trim();
            const isProjection = label?.toLowerCase().includes('projected') || label?.toLowerCase().includes('projection');

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block">{label}</span>
                  {isProjection && <Badge variant="purple" size="sm">AI Projection</Badge>}
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">{content}</p>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <p className="text-sm font-medium text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
        {summaryText}
      </p>
    );
  };

  const renderKeyFindings = (findings) => {
    if (!findings) return null;

    let items = [];
    if (Array.isArray(findings)) {
      items = findings;
    } else if (typeof findings === 'string') {
      items = findings.split('.').map((s) => ({ finding: s.trim() })).filter((item) => item.finding.length > 5);
    }

    if (items.length === 0) return null;

    return (
      <Card className="space-y-5 border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Key Research Findings & Evidence Synthesis</span>
          </h3>
          <Badge variant="indigo" size="sm">Evidence Synthesized</Badge>
        </div>

        <div className="space-y-4">
          {items.map((item, idx) => {
            const isObject = typeof item === 'object' && item !== null;
            const findingText = isObject ? item.finding : item;
            const impactText = isObject ? item.impact : null;
            const conf = isObject ? item.confidence : 'High Confidence';
            const src = isObject ? item.source : 'Market Analysis';

            return (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-900 text-sm">{findingText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderSourceBadge(src)}
                    {renderConfidenceBadge(conf)}
                  </div>
                </div>

                {impactText && (
                  <p className="text-xs text-slate-600 pl-6 leading-relaxed border-l-2 border-indigo-200">
                    <strong className="text-slate-700">Strategic Impact:</strong> {impactText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderRecommendation = (recommendation) => {
    if (!recommendation) return null;

    return (
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>Stage Gate Discovery Recommendation</span>
          </div>
          <Badge variant="emerald">Bridge to Stage 2 Concept</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 bg-white p-4 rounded-xl border border-indigo-100">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">Highest Priority Opportunity</span>
            <p className="text-sm font-semibold text-slate-900 leading-snug">
              {recommendation.highest_priority_opportunity || 'Bundled Product Plus commercial offer with digital scouting.'}
            </p>
          </div>

          <div className="space-y-1 bg-white p-4 rounded-xl border border-purple-100">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Advancement Justification</span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {recommendation.advancement_justification || 'Strong market pull and high grower willingness-to-pay.'}
            </p>
          </div>
        </div>

        {Array.isArray(recommendation.key_risks_to_validate) && recommendation.key_risks_to_validate.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Critical Assumptions to Validate in Stage 2 Concept Gate:</span>
            </span>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-950 font-medium">
              {recommendation.key_risks_to_validate.map((risk, idx) => (
                <li key={idx}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    );
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
          <Badge variant="indigo">Stage 1 Discovery Agent</Badge>
        </div>

        {/* Action Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">Stage 1: Discovery Agent</h1>
              <p className="text-sm text-slate-500">
                Queries Needs Bank and Offer Bank context to synthesize consulting-grade problem statements and market opportunities.
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
              className="sm:col-span-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {workspaces.map((ws) => (
                <option key={ws.workspace_id} value={ws.workspace_id}>
                  {ws.name} ({ws.country})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <Button
              icon={Sparkles}
              isLoading={isProcessing}
              onClick={handleActivateDiscovery}
              disabled={!selectedWsId}
              className="shadow-indigo-200 shadow-md"
            >
              {discoveryResult ? 'Regenerate Discovery' : 'Execute Discovery Agent'}
            </Button>
          </div>
        </div>

        {/* AI Processing State */}
        {isProcessing && (
          <div className="bg-white border border-indigo-100 rounded-2xl p-12 text-center space-y-4 shadow-sm animate-pulse">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Discovery Agent Synthesizing Market Evidence...</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Analyzing grower pain points for {workspace?.country || 'target region'}, evaluating commercial value drivers, and constructing evidence metadata.
            </p>
          </div>
        )}

        {/* Discovery Output Display */}
        {discoveryResult && discoveryResult.discovery && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Generated Discovery Findings</h2>
              <div className="flex items-center gap-2">
                {discoveryResult.discovery.recommended_archetype && (
                  <Badge variant="indigo">Recommended Archetype: {discoveryResult.discovery.recommended_archetype}</Badge>
                )}
                <Badge variant="emerald">Validated Stage 1 Output</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem Statement Card */}
              <Card className="border-indigo-100 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <FileText className="w-4.5 h-4.5" />
                  <span>Problem Statement & Business Impact</span>
                </div>
                <p className="text-sm font-medium text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {discoveryResult.discovery.problem_statement}
                </p>
              </Card>

              {/* Opportunity Summary Card */}
              <Card className="border-purple-100 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                  <TrendingUp className="w-4.5 h-4.5" />
                  <span>Commercial Opportunity & Value Drivers</span>
                </div>
                {renderOpportunitySummary(discoveryResult.discovery.opportunity_summary)}
              </Card>
            </div>

            {/* Key Research Findings Section */}
            {renderKeyFindings(discoveryResult.discovery.key_findings)}

            {/* Discovery Recommendation Bridge Card */}
            {renderRecommendation(discoveryResult.discovery.discovery_recommendation)}

            {/* Next Stage Navigation Footer */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Proceed to Stage 2: Concept Gate</h4>
                <p className="text-xs text-slate-500">Run 5-criteria differentiation scoring against this discovery.</p>
              </div>
              <Link to={`/workspaces/${selectedWsId}/concept`}>
                <Button icon={ArrowRight}>
                  Go to Stage 2 Concept Gate
                </Button>
              </Link>
            </div>
          </div>
        )}

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
};
