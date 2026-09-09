import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const LandingPage = lazy(() => import('../pages/Landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const WorkspaceDetailsPage = lazy(() => import('../pages/Workspace/WorkspaceDetailsPage').then((m) => ({ default: m.WorkspaceDetailsPage })));
const DiscoveryPage = lazy(() => import('../pages/Discovery/DiscoveryPage').then((m) => ({ default: m.DiscoveryPage })));
const ConceptPage = lazy(() => import('../pages/Concept/ConceptPage').then((m) => ({ default: m.ConceptPage })));
const PrototypePage = lazy(() => import('../pages/Prototype/PrototypePage').then((m) => ({ default: m.PrototypePage })));
const NeedsBankPage = lazy(() => import('../pages/NeedsBank/NeedsBankPage').then((m) => ({ default: m.NeedsBankPage })));
const OfferBankPage = lazy(() => import('../pages/OfferBank/OfferBankPage').then((m) => ({ default: m.OfferBankPage })));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
    <div className="flex items-center gap-3 text-indigo-600 font-semibold text-sm">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Loading Surface...</span>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Core Platform Dashboard & Workspaces */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/workspaces" element={<DashboardPage />} />
        <Route path="/workspaces/:id" element={<WorkspaceDetailsPage />} />

        {/* Stage Lifecycle Pages (With or Without Workspace ID) */}
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/workspaces/:id/discovery" element={<DiscoveryPage />} />

        <Route path="/concept" element={<ConceptPage />} />
        <Route path="/workspaces/:id/concept" element={<ConceptPage />} />

        <Route path="/prototype" element={<PrototypePage />} />
        <Route path="/workspaces/:id/prototype" element={<PrototypePage />} />

        {/* Institutional Asset Banks */}
        <Route path="/needs-bank" element={<NeedsBankPage />} />
        <Route path="/offer-bank" element={<OfferBankPage />} />

        {/* 404 Fallback */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};
