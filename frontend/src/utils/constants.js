export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const ARCHETYPES = [
  { value: 'Product Plus', label: 'Product Plus (Core + Service)', description: 'Product + Digital Agronomic Advisory' },
  { value: 'Demand Generation', label: 'Demand Generation', description: 'Free digital/service for lead creation' },
  { value: 'E2E Service', label: 'E2E Service (Product as a Service)', description: 'Full agronomic service bundle' },
  { value: 'Outcome-Based Offer', label: 'Outcome-Based Offer', description: 'Performance & yield linked guarantees' },
  { value: 'Subscription (SaaS)', label: 'Subscription (SaaS)', description: 'Recurring digital license' },
];

export const REGIONS = [
  { value: 'Continental', label: 'Continental Europe (France, Belgium)' },
  { value: 'DACH', label: 'DACH (Germany, Austria, Switzerland)' },
  { value: 'Benelux', label: 'Benelux (Netherlands, Belgium, Luxembourg)' },
  { value: 'Southern Europe', label: 'Southern Europe (Italy, Spain, Portugal, Greece)' },
  { value: 'Eastern Europe', label: 'Eastern Europe (Poland, Romania, Hungary, Czechia)' },
  { value: 'UK & Ireland', label: 'UK & Ireland' },
];

export const COUNTRIES = [
  { value: 'FR', label: 'France (FR)' },
  { value: 'DE', label: 'Germany (DE)' },
  { value: 'NL', label: 'Netherlands (NL)' },
  { value: 'BE', label: 'Belgium (BE)' },
  { value: 'IT', label: 'Italy (IT)' },
  { value: 'ES', label: 'Spain (ES)' },
  { value: 'PL', label: 'Poland (PL)' },
  { value: 'UK', label: 'United Kingdom (UK)' },
  { value: 'RO', label: 'Romania (RO)' },
  { value: 'HU', label: 'Hungary (HU)' },
  { value: 'GR', label: 'Greece (GR)' },
  { value: 'PT', label: 'Portugal (PT)' },
  { value: 'AT', label: 'Austria (AT)' },
];

export const COUNTRY_REGION_MAP = {
  FR: 'Continental',
  BE: 'Continental',
  DE: 'DACH',
  AT: 'DACH',
  NL: 'Benelux',
  IT: 'Southern Europe',
  ES: 'Southern Europe',
  GR: 'Southern Europe',
  PT: 'Southern Europe',
  PL: 'Eastern Europe',
  RO: 'Eastern Europe',
  HU: 'Eastern Europe',
  UK: 'UK & Ireland',
};

export const OWNER_ROLES = [
  'Commercial Lead',
  'Innovation Manager',
  'Product Manager',
  'Regional Commercial Manager',
  'Portfolio Manager',
  'Digital Agriculture Lead',
  'Business Development Manager',
  'Market Development Manager',
  'Agronomy Specialist',
  'Customer Success Lead',
  'Technical Lead',
  'Program Manager',
  'Business Analyst',
  'Solutions Architect',
];

export const LIFECYCLE_STAGES = [
  { id: 1, name: 'Discovery', description: 'Validate customer pain points & market gap', agent: 'DiscoveryAgent' },
  { id: 2, name: 'Concept Validation', description: 'Differentiation scoring & kill filter gate', agent: 'ConceptAgent' },
  { id: 3, name: 'Prototype & Blueprint', description: '6-component offer architecture', agent: 'PrototypeAgent' },
  { id: 4, name: 'First Launch', description: 'Commercial release & stage gate 2', agent: 'Commercial Gate' },
  { id: 5, name: 'Scale-Up', description: 'Cross-country replication analysis', agent: 'Scaling (Phase 2)' },
  { id: 6, name: 'Annual Review', description: 'Lifecycle management & performance brief', agent: 'Review (Phase 2)' },
];
