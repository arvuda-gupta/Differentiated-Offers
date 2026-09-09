import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Lightbulb,
  Boxes,
  Database,
  Briefcase,
  Layers,
} from 'lucide-react';

export const LandingPage = () => {
  const ecosystemCards = [
    {
      title: 'Dashboard Surface',
      subtitle: 'Portfolio Funnel & Workspace Hub',
      description: 'Manage per-offer workspaces, track 6-stage lifecycle progression, and visualize regional commercial pipelines.',
      icon: Layers,
      tag: 'Core Management',
      link: '/dashboard',
    },
    {
      title: 'Stage 1: Discovery Agent',
      subtitle: 'Needs Validation & Gap Research',
      description: 'Queries 70+ validated European grower pain points, analyzes competitor whitespace, and formulates problem statements.',
      icon: Compass,
      tag: 'Stage 1 Agent',
      link: '/discovery',
    },
    {
      title: 'Stage 2: Concept Validation',
      subtitle: 'Differentiation Gate & Kill Filter',
      description: 'Calculates 5-criteria composite scores (Farmer Value 35%, Commercial Viability 30%), checks duplicates, and kills weak concepts early.',
      icon: Lightbulb,
      tag: 'Stage 2 Agent',
      link: '/concept',
    },
    {
      title: 'Stage 3: Offer Blueprint',
      subtitle: '6-Component Offer Architecture',
      description: 'Wires core products, digital advisory, risk guarantees, and financial structures into structured MVP validation blueprints.',
      icon: Boxes,
      tag: 'Stage 3 Agent',
      link: '/prototype',
    },
    {
      title: 'Needs Bank DB',
      subtitle: 'Institutional Grower Pain Points',
      description: 'Centralized repository of validated customer needs seeded from European market research across CP, Seeds, and Biologicals.',
      icon: Database,
      tag: 'Institutional Asset',
      link: '/needs-bank',
    },
    {
      title: 'Offer Bank DB',
      subtitle: '87+ Live European Commercial Offers',
      description: 'Shared library of tagged commercial offers across 5 archetypes (Product Plus, SaaS, Outcome-Based, Demand Gen, E2E).',
      icon: Briefcase,
      tag: 'Offer Library',
      link: '/offer-bank',
    },
  ];

  const methodologyGates = [
    {
      number: '01',
      title: 'Farmer Need First',
      text: 'Every offer must anchor to a verified pain point in the Needs Bank before any solution design begins.',
    },
    {
      number: '02',
      title: 'Differentiation Threshold',
      text: 'Concepts must score ≥ 6.5 across 4 weighted dimensions and pass automatic kill filters.',
    },
    {
      number: '03',
      title: '6-Component Taxonomy',
      text: 'Offers are built from standardized building blocks (a: Product, b: Advice, c: Software, d: Insurance, e: Finance, f: Carbon).',
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 gradient-hero-bg overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Autonomous AI-Powered Offer Lifecycle</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Designing for a <span className="gradient-text">Smarter Harvest</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Guiding Syngenta commercial teams from customer need validation to high-margin differentiated offer blueprints — powered by autonomous domain AI agents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto px-8 py-3.5 text-base shadow-indigo-200/60 shadow-md">
                <span>Enter Platform Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-3.5 text-base">
                Explore 6-Stage Lifecycle
              </Button>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto text-left">
            <div className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl shadow-2xs">
              <span className="block text-2xl font-bold text-slate-900">70+</span>
              <span className="text-xs text-slate-500 font-medium">Validated Pain Points</span>
            </div>
            <div className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl shadow-2xs">
              <span className="block text-2xl font-bold text-slate-900">87+</span>
              <span className="text-xs text-slate-500 font-medium">European Offers Tagged</span>
            </div>
            <div className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl shadow-2xs">
              <span className="block text-2xl font-bold text-indigo-600">6.5</span>
              <span className="text-xs text-slate-500 font-medium">Pass Gate Threshold</span>
            </div>
            <div className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl shadow-2xs">
              <span className="block text-2xl font-bold text-emerald-600">100%</span>
              <span className="text-xs text-slate-500 font-medium">FastAPI Engine Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features / Integrated Ecosystem Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div id="ecosystem" className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="purple" size="lg">Platform Surface Architecture</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Integrated Commercial Ecosystem
          </h2>
          <p className="text-slate-600 text-base">
            From regional problem statements to validated offer blueprints, explore the 6-stage lifecycle surfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ecosystemCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link key={i} to={card.link}>
                <Card hoverable className="h-full flex flex-col justify-between group border-slate-200/80 hover:border-indigo-300">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="indigo" size="sm">{card.tag}</Badge>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">
                      {card.subtitle}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                    <span>Open Surface</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Methodology Section */}
      <section id="architecture" className="py-20 bg-slate-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
              Stage Gate Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Data-Backed Offer Development
            </h2>
            <p className="text-slate-400 text-base">
              Eliminating intuition-driven offer design through automated differentiation gates, duplicate checks, and kill filters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {methodologyGates.map((gate, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <span className="text-4xl font-black text-indigo-400 font-mono">{gate.number}</span>
                <h3 className="text-xl font-bold text-white">{gate.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{gate.text}</p>
              </div>
            ))}
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white">Ready to test commercial concepts?</h4>
              <p className="text-sm text-slate-300">Launch a new workspace or run Stage 1 Discovery validation immediately.</p>
            </div>
            <Link to="/dashboard">
              <Button size="lg" className="bg-white !text-slate-900 hover:!bg-slate-100 font-bold px-6 border-0">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};
