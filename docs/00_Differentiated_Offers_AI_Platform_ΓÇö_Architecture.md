# Differentiated Offers AI Platform — Architecture

> **Source:** Confluence page `5677286233` in space `DODE`
> **Original URL:** <https://digitial-product-engineering.atlassian.net/wiki/spaces/DODE/pages/5677286233>
> **Diagrams:** all original PNG diagrams are inlined as Mermaid below.

---

This section contains the full architecture documentation for the **Differentiated Offers AI Platform** - an agentic, AI-powered platform enabling Syngenta Europe commercial teams to build, validate, and scale differentiated offers.

## Document Index

| Page | Contents |
| --- | --- |
| **1. Understanding & Scope** | Problem context, offer taxonomy, user personas, lifecycle stages, success metrics, boundaries |
| **2. Technical Architecture & Wiring** | Agent design, data layer, integrations, tech stack, data flow, security |
| **3. Phase-wise Execution** | Phase 1 POC, Phase 2 Scaling, Phase 3 Enterprise - scope, milestones, dependencies, risks |

## Quick Reference

### The 6 Offer Components

| Code | Name | What it means |
| --- | --- | --- |
| **a** | Foundation | Core inputs - CP, Seeds, Biologicals, bundles |
| **b** | Precision Advisor | Digital agronomy - models, alerts, spray timing, monitoring |
| **c** | Shared Success | Subscription services - recurring digital or diagnostic services per season |
| **d** | Risk Shield | Assurance / guarantee - yield guarantees, weather-linked risk sharing |
| **e** | Investment Enabling | Financial services - credit, barter, loyalty rebates |
| **f** | Future Ready Farming | Sustainability / compliance - ESG, soil health, carbon documentation |

### The 6 Agents

| Agent | Primary role | Runs |
| --- | --- | --- |
| Orchestrator | Routes, coordinates, escalates | On every workspace event |
| Discovery Agent | Autonomous need research and problem statement drafting | Stage 1 activation + re-activation |
| Concept Validation Agent | Differentiation scoring, duplicate detection, kill filter | On concept submission |
| Market Intelligence Agent | Portfolio surveillance, pattern detection, white space analysis | Continuously (background) |
| Scaling Agent | Cross-country replication briefs for live offers | On offer going Live |
| Review Agent | Annual lifecycle review for all MRP DB offers | Scheduled annually |

### The 3 Phases

| Phase | Focus | Key agents live |
| --- | --- | --- |
| Phase 1 - POC | Discovery + Concept Validation loop, Needs Bank, Offer Bank seed data, pilot teams | Orchestrator, Discovery, Concept Validation |
| Phase 2 - Scaling | Market Intelligence, cross-country scaling, dashboards, data integrations | + Market Intelligence, Scaling Agent |
| Phase 3 - Enterprise | Full governance, Review Agent, advanced analytics, pan-EU rollout | + Review Agent, full analytics layer |
