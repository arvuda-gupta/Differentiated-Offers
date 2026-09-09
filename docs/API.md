# API Reference Specification (Phase 1 POC)

Complete documentation of all REST API endpoints implemented in the Phase 1 backend.

Base URL: `http://localhost:8000`

---

## 1. Workspace Endpoints

### 1.1 Create Workspace
- **Method**: `POST`
- **URL**: `/v1/workspace`
- **Description**: Creates a new commercial offer workspace for a target country and region.

#### Request Body
```json
{
  "name": "France Cereal Disease Protection Offer",
  "owner_role": "Commercial Lead",
  "archetype": "Product Plus",
  "region": "Continental",
  "country": "FR"
}
```

#### Response Body (`200 OK`)
```json
{
  "workspace_id": "0ecf8f55-f073-4e12-983b-b9b6b359879e",
  "name": "France Cereal Disease Protection Offer",
  "owner_role": "Commercial Lead",
  "archetype": "Product Plus",
  "region": "Continental",
  "country": "FR",
  "created_at": "2026-07-27T19:40:00Z"
}
```

#### Error Response (`422 Unprocessable Entity`)
```json
{
  "detail": [
    {
      "loc": ["body", "country"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

### 1.2 List Workspaces
- **Method**: `GET`
- **URL**: `/v1/workspace`
- **Description**: Returns a list of all active commercial workspaces in the platform.

#### Response Body (`200 OK`)
```json
[
  {
    "workspace_id": "0ecf8f55-f073-4e12-983b-b9b6b359879e",
    "name": "France Cereal Disease Protection Offer",
    "owner_role": "Commercial Lead",
    "archetype": "Product Plus",
    "region": "Continental",
    "country": "FR",
    "created_at": "2026-07-27T19:40:00Z"
  }
]
```

---

### 1.3 Get Workspace Details
- **Method**: `GET`
- **URL**: `/v1/workspace/{workspace_id}`
- **Description**: Retrieves full details of a single workspace by UUID.

#### Response Body (`200 OK`)
```json
{
  "workspace_id": "0ecf8f55-f073-4e12-983b-b9b6b359879e",
  "name": "France Cereal Disease Protection Offer",
  "owner_role": "Commercial Lead",
  "archetype": "Product Plus",
  "region": "Continental",
  "country": "FR",
  "created_at": "2026-07-27T19:40:00Z"
}
```

#### Error Response (`404 Not Found`)
```json
{
  "detail": "Workspace '0ecf8f55-f073-4e12-983b-b9b6b359879e' not found"
}
```

---

## 2. Stage 1 Discovery Endpoint

### 2.1 Activate Discovery Agent
- **Method**: `POST`
- **URL**: `/v1/workspace/{workspace_id}/activate-discovery`
- **Description**: Triggers Stage 1 Discovery Agent to validate customer pain points and generate problem statement.

#### Response Body (`200 OK`)
```json
{
  "status": "success",
  "workspace_id": "0ecf8f55-f073-4e12-983b-b9b6b359879e",
  "context": {
    "workspace": {
      "name": "France Cereal Disease Protection Offer",
      "country": "FR"
    },
    "matching_needs": [
      {
        "need_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "description": "Septoria tritici resistant strains reducing fungicide efficacy"
      }
    ]
  },
  "discovery": {
    "problem_statement": "French wheat growers face 25% yield loss due to azole-resistant Septoria strains.",
    "opportunity_summary": "High commercial value for integrated fungicide + advisory bundle.",
    "key_findings": [
      "Growers seek outcome guarantees",
      "Existing standalone fungicides show declining market share"
    ],
    "recommended_archetype": "Product Plus"
  },
  "saved_discovery": {
    "discovery_id": "f47ac10b-58cc-4372-a567-0e02b2c3d4e5",
    "workspace_id": "0ecf8f55-f073-4e12-983b-b9b6b359879e",
    "created_at": "2026-07-27T19:41:00Z"
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "detail": "Workspace '0ecf8f55-f073-4e12-983b-b9b6b359879e' not found"
}
```

---

## 3. Stage 2 Concept Validation Endpoint

### 3.1 Activate Concept Agent
- **Method**: `POST`
- **URL**: `/v1/concepts/activate/{workspace_id}`
- **Description**: Evaluates concept card against Stage 1 discovery, differentiation gate (5 criteria), duplicate check, and kill filters.

#### Request Body (Optional)
```json
{
  "title": "Integrated Septoria Defense Bundle",
  "component_codes": ["a", "b", "d"],
  "description": "Fungicide product bundled with digital disease model and yield guarantee insurance"
}
```

#### Response Body (`200 OK`)
```json
{
  "status": "success",
  "workspace_id": "0ecf8f55-f073-4e12-983b-b9b6b359879e",
  "problem_statement_ref": "f47ac10b-58cc-4372-a567-0e02b2c3d4e5",
  "context": {
    "title": "Integrated Septoria Defense Bundle",
    "component_codes": ["a", "b", "d"]
  },
  "evaluation": {
    "differentiation_score": {
      "farmer_value": 8.5,
      "commercial_viability": 7.8,
      "feasibility": 8.0,
      "strategic_fit": 8.2
    },
    "composite_score": 8.22,
    "kill_filter_result": {
      "kill_triggered": false,
      "reasons": []
    },
    "duplicate_score": 0.12,
    "guardrail_flags": [],
    "decision": "pass",
    "verdict_rationale": "Score 8.22 exceeds pass threshold 6.5 with zero kill triggers."
  },
  "saved_concept": {
    "concept_id": "c1d2e3f4-5678-90ab-cdef-1234567890ab",
    "workspace_id": "0ecf8f55-f073-4e12-983b-b9b6b359879e",
    "decision": "pass"
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "detail": "Workspace '0ecf8f55-f073-4e12-983b-b9b6b359879e' not found"
}
```

---

## 4. Stage 3 Prototype Endpoint

### 4.1 Activate Prototype Agent
- **Method**: `POST`
- **URL**: `/v1/prototypes/activate/{concept_id}`
- **Description**: Generates 6-component offer blueprint for passed Stage 2 concept.

#### Response Body (`200 OK`)
```json
{
  "status": "success",
  "concept_id": "c1d2e3f4-5678-90ab-cdef-1234567890ab",
  "workspace_id": "0ecf8f55-f073-4e12-983b-b9b6b359879e",
  "evaluation_summary": {
    "value_proposition": "Guaranteed Septoria control combining premium chemistry with digital scouting.",
    "component_breakdown": {
      "core_product": "Miravis Plus Fungicide",
      "digital_service": "Cropwise Disease Scouting Model",
      "advisory": "1-on-1 Agronomist Consultation",
      "risk_guarantee": "85% Yield Assurance Cover",
      "financial_structure": "Deferred Payment Term",
      "sustainability": "Low VOC Formulation"
    },
    "delivery_mechanisms": ["Retail Channel", "Digital App"],
    "risk_mitigation": "Disease threshold alerts prevent misapplication"
  },
  "saved_prototype": {
    "prototype_id": "p1o2i3u4-y5t6-r7e8-w9q0-1234567890ab",
    "concept_id": "c1d2e3f4-5678-90ab-cdef-1234567890ab",
    "status": "draft"
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "detail": "Concept 'c1d2e3f4-5678-90ab-cdef-1234567890ab' not found"
}
```

---

## 5. Needs Bank Endpoints

### 5.1 List Needs
- **Method**: `GET`
- **URL**: `/v1/needs`
- **Description**: Retrieves customer pain points from the institutional Needs Bank.

#### Response Body (`200 OK`)
```json
[
  {
    "need_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "country": "FR",
    "crop": "Wheat",
    "segment": "Large Commercial",
    "pain_point": "Septoria resistance",
    "intensity_score": 9.0,
    "created_at": "2026-07-27T12:00:00Z"
  }
]
```

### 5.2 Create Need
- **Method**: `POST`
- **URL**: `/v1/needs`
- **Description**: Adds a new validated customer pain point to Needs Bank.

#### Request Body
```json
{
  "country": "DE",
  "crop": "Corn",
  "segment": "Medium Farm",
  "pain_point": "Drought stress during flowering",
  "intensity_score": 8.5
}
```

---

## 6. Offer Bank Endpoints

### 6.1 List Offers
- **Method**: `GET`
- **URL**: `/v1/offers`
- **Description**: Retrieves commercial offer records from Offer Bank.

#### Response Body (`200 OK`)
```json
[
  {
    "offer_id": "b1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "VerSecur Corn Protection",
    "country": "FR",
    "crop": "Corn",
    "archetype": "Outcome-Based Offer",
    "components": ["a", "b", "d"],
    "created_at": "2026-07-27T12:00:00Z"
  }
]
```

---

## 7. Workspace Events Audit Log Endpoint

### 7.1 List Workspace Events
- **Method**: `GET`
- **URL**: `/v1/events`
- **Description**: Retrieves audit trail events for platform actions.

#### Response Body (`200 OK`)
```json
[
  {
    "event_id": "e1e2e3e4-e5e6-7890-abcd-ef1234567890",
    "workspace_id": "0ecf8f55-f073-4e12-983b-b9b6b359879e",
    "event_type": "concept_evaluation_completed",
    "created_at": "2026-07-27T19:42:00Z"
  }
]
```
