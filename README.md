# Differentiated Offers AI Platform (Phase 1 POC)

An autonomous, multi-agent AI backend platform built with **FastAPI** and **PostgreSQL** that powers Syngenta's European commercial offer development lifecycle for Phase 1: **Discovery**, **Concept Development & Validation**, and **Prototype / Offer Blueprinting**.

---

## Executive Summary & Problem Statement

Syngenta operates across Crop Protection (CP), Seeds, and Biologicals in European markets. Historically, differentiated commercial offer development has been fragmented and intuition-driven:
- **75% of market revenue** derives from standalone products, facing intense commoditisation and regulatory pressure.
- Over **87 offers** were scattered across Europe with no shared development process or scaling mechanism.
- Teams routinely created solutions before validating whether genuine grower demand existed.

The **Differentiated Offers AI Platform** solves this by establishing an autonomous, agentic lifecycle that enforces rigorous data-backed validation at every stage.

---

## Key Features (Phase 1 POC)

- **Stage 1 Discovery Agent**: Autonomous customer pain point research, Needs Bank querying, and problem statement formulation.
- **Stage 2 Concept Validation Agent**: 5-criteria differentiation scoring (`farmer_value` 0.35, `commercial_viability` 0.30, `feasibility` 0.20, `strategic_fit` 0.15), duplicate checking against ConceptBank, and automatic kill filter enforcement.
- **Stage 3 Prototype Agent**: Offer blueprint generation across 6 building blocks (`core_product`, `digital_service`, `advisory`, `risk_guarantee`, `financial_structure`, `sustainability`).
- **Institutional Knowledge Layer**: Seeded Needs Bank (70+ pain points) and Offer Bank (87+ European commercial offers).
- **LLM Provider Abstraction Layer**: Pluggable LLM interface supporting OpenAI with local fallback capabilities.
- **Production-Hardened Backend**: Raw SQL via `psycopg` (v3), strict Pydantic validation, connection pooling, and 100% parameterized query execution.

---

## Tech Stack

| Component | Technology | Rationale |
| --- | --- | --- |
| **Language** | Python 3.11+ | Strong ecosystem for AI/LLM integration and async APIs |
| **Framework** | FastAPI + Uvicorn | High-performance async ASGI web framework with OpenAPI validation |
| **Database** | PostgreSQL 14+ | Relational data integrity, JSONB support for unstructured reports |
| **DB Driver** | `psycopg` (v3) | Low-level driver with direct connection pooling and `dict_row` mappings |
| **Validation** | Pydantic v2 | Strongly-typed request/response schema enforcement |
| **LLM Provider** | Pluggable OpenAI Provider | Abstract base provider class (`BaseLLMProvider`) |
| **Testing** | Standard `unittest` | Zero-dependency, fast unit and integration testing suite |

---

## System Architecture

```mermaid
graph TD
    Client[Commercial Client / Web UI] --> API[FastAPI Gateway]
    
    subgraph FastAPI Routers
        API --> R1[Workspace Router /v1/workspace]
        API --> R2[Discovery Router /v1/workspace/{id}/activate-discovery]
        API --> R3[Concept Router /v1/concepts/activate/{id}]
        API --> R4[Prototype Router /v1/prototypes/activate/{id}]
        API --> R5[Needs Router /v1/needs]
        API --> R6[Offer Router /v1/offers]
        API --> R7[Events Router /v1/events]
    end

    subgraph Specialist Agents Layer (Phase 1)
        R2 --> A1[Discovery Agent]
        R3 --> A2[Concept Validation Agent]
        R4 --> A3[Prototype Agent]
        
        A1 & A2 & A3 --> Base[BaseAgent Interface]
        A1 & A2 & A3 --> LLM[LLMClient Provider Abstraction]
    end

    subgraph PostgreSQL Database Layer
        A1 & A2 & A3 & R1 & R5 & R6 & R7 --> DB[(PostgreSQL Database)]
        DB --> T1[(workspaces)]
        DB --> T2[(discoveries)]
        DB --> T3[(concepts)]
        DB --> T4[(prototypes)]
        DB --> T5[(needs_bank)]
        DB --> T6[(offer_bank)]
        DB --> T7[(workspace_events)]
    end
```

---

## 3-Stage Phase 1 Agent Lifecycle Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Team as Commercial Lead
    participant API as FastAPI Gateway
    participant Discovery as DiscoveryAgent (Stage 1)
    participant Concept as ConceptAgent (Stage 2)
    participant Prototype as PrototypeAgent (Stage 3)
    participant DB as PostgreSQL DB

    Team->>API: POST /v1/workspace (Create Workspace)
    API->>DB: INSERT INTO workspaces
    DB-->>API: Workspace Created

    Team->>API: POST /v1/workspace/{id}/activate-discovery
    API->>Discovery: run(workspace_id)
    Discovery->>DB: Query needs_bank & offer_bank
    Discovery->>Discovery: Invoke LLM & parse problem statement
    Discovery->>DB: INSERT INTO discoveries
    Discovery-->>API: Discovery Report

    Team->>API: POST /v1/concepts/activate/{id}
    API->>Concept: run(workspace_id, input)
    Concept->>DB: Load Stage 1 discovery
    Concept->>Concept: Calculate composite differentiation score & kill filter
    Concept->>DB: INSERT INTO concepts (decision: pass/kill/borderline/escalate)
    Concept-->>API: Concept Evaluation Card

    Team->>API: POST /v1/prototypes/activate/{concept_id}
    API->>Prototype: run(concept_id)
    Prototype->>DB: Load Concept & Workspace
    Prototype->>Prototype: Generate 6-component offer blueprint
    Prototype->>DB: INSERT INTO prototypes (status: draft)
    Prototype-->>API: Offer Prototype Blueprint
```

---

## Folder Structure

```
differntiated offers/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── __init__.py           # Phase 1 agent exports (Base, Discovery, Concept, Prototype)
│   │   │   ├── base_agent.py         # Abstract BaseAgent pipeline contract
│   │   │   ├── discovery_agent.py    # Stage 1 Discovery Agent implementation
│   │   │   ├── concept_agent.py      # Stage 2 Concept Validation Agent implementation
│   │   │   └── prototype_agent.py    # Stage 3 Prototype Offer Agent implementation
│   │   ├── llm/
│   │   │   ├── __init__.py           # LLM provider exports
│   │   │   ├── provider.py           # BaseLLMProvider abstract base class
│   │   │   └── openai_provider.py    # OpenAI LLM provider implementation
│   │   ├── models/
│   │   │   ├── concept.py            # Pydantic schemas for concepts
│   │   │   ├── discovery.py          # Pydantic schemas for discoveries
│   │   │   ├── need.py               # Pydantic schemas for Needs Bank
│   │   │   ├── offer.py              # Pydantic schemas for Offer Bank
│   │   │   ├── prototype.py          # Pydantic schemas for prototypes
│   │   │   ├── workspace.py          # Pydantic schemas for workspaces
│   │   │   └── workspace_event.py    # Pydantic schemas for workspace events
│   │   ├── routes/
│   │   │   ├── concept.py            # Concept router (/v1/concepts)
│   │   │   ├── discovery.py          # Discovery router (/v1/workspace/.../activate-discovery)
│   │   │   ├── needs.py              # Needs Bank router (/v1/needs)
│   │   │   ├── offer.py              # Offer Bank router (/v1/offers)
│   │   │   ├── prototype.py          # Prototype router (/v1/prototypes)
│   │   │   ├── workspace.py          # Workspace router (/v1/workspace)
│   │   │   └── workspace_event.py    # Workspace events router (/v1/events)
│   │   ├── config.py                 # Centralized environment settings & validation
│   │   ├── database.py               # PostgreSQL connection factory (psycopg v3)
│   │   ├── llm_client.py             # LLM client wrapper delegating to provider layer
│   │   ├── logger.py                 # Production structured logger
│   │   └── main.py                   # FastAPI application initialization & route wiring
│   ├── tests/
│   │   ├── run_all_tests.py          # Unified test runner
│   │   ├── test_agents.py            # Agent unit tests
│   │   ├── test_database.py          # Database & constraint validation tests
│   │   └── test_routes.py            # FastAPI integration tests
│   ├── .env.example                  # Environment configuration template
│   ├── .gitignore                    # Python hygiene ignore file
│   └── requirements.txt              # Production dependencies
├── docs/
│   ├── ARCHITECTURE.md               # Deep-dive architecture & design decisions
│   ├── API.md                        # Complete API endpoint reference
│   ├── DATABASE.md                   # Database schema, ER diagram, & data flow
│   └── DEPLOYMENT.md                 # Local setup, database migration, & troubleshooting
└── README.md                         # Project overview documentation
```

---

## Local Setup & Development Guide

### 1. Prerequisites
- **Python 3.11+**
- **PostgreSQL 14+** database instance

### 2. Environment Configuration
Create a `.env` file in `backend/`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/differentiated_offers
OPENAI_API_KEY=your_openai_api_key_here
LLM_PROVIDER=openai
APP_ENV=development
```

### 3. Database Initialization
Execute the schema setup script in your PostgreSQL instance:
```bash
psql -U postgres -d differentiated_offers -f backend/scripts/schema.sql
```

### 4. Installation & Running Server
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/v1/workspace` | Create a new commercial workspace |
| `GET` | `/v1/workspace` | List all workspaces |
| `GET` | `/v1/workspace/{id}` | Get workspace details by UUID |
| `POST` | `/v1/workspace/{id}/activate-discovery` | Trigger Stage 1 Discovery Agent |
| `POST` | `/v1/concepts/activate/{id}` | Trigger Stage 2 Concept Validation Agent |
| `POST` | `/v1/prototypes/activate/{id}` | Trigger Stage 3 Prototype Agent |
| `GET` | `/v1/needs` | List Needs Bank pain points |
| `POST` | `/v1/needs` | Create a new pain point in Needs Bank |
| `GET` | `/v1/offers` | List Offer Bank entries |
| `POST` | `/v1/offers` | Register a new commercial offer in Offer Bank |
| `GET` | `/v1/events` | Query audit trail of workspace events |

*Detailed API payloads and responses are documented in [docs/API.md](file:///c:/Users/mrskm/OneDrive/Attachments/Desktop/differntiated%20offers/docs/API.md).*

---

## Testing

Run the unified test suite from `backend/`:
```bash
python tests/run_all_tests.py
```

Expected Output:
```
Ran 13 tests in 3.082s

OK
```

---

## Future Scope (Planned Work)

The following capabilities are explicitly out-of-scope for Phase 1 and are planned for Phase 2 / Phase 3:
- **Stage 4 Commercial Launch Automation** (Formal Stage Gate 2 approval workflow).
- **Stage 5 Scaling Agent** (Cross-country replication fit scoring and adaptation briefs).
- **Stage 6 Review Agent** (Annual post-launch performance review & Continue/Evolve/Archive recommendations).
- **Market Intelligence Agent** (Cross-workspace portfolio surveillance and gap analysis).
- **VENUS Databricks Live Feed** (Real-time telemetry and ERP data synchronization).
- **Leadership Portfolio Dashboard** (Funnel analytics and pan-European heatmaps).
