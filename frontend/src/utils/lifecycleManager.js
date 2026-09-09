// Sequential Lifecycle Stage Gate Helper for Phase 1 AI Innovation Platform

const LOCAL_STORAGE_KEY = 'syngenta_lifecycle_progress_v1';

const getStoredProgress = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
};

export const saveStageCompletion = (workspaceId, stage) => {
  if (!workspaceId) return;
  try {
    const progress = getStoredProgress();
    const wsProgress = progress[workspaceId] || {
      discovery: false,
      concept: false,
      prototype: false,
    };

    if (stage === 'discovery') wsProgress.discovery = true;
    if (stage === 'concept') wsProgress.concept = true;
    if (stage === 'prototype') wsProgress.prototype = true;

    progress[workspaceId] = wsProgress;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save stage completion:', err);
  }
};

export const getWorkspaceLifecycleState = (workspaceId, events = []) => {
  const local = getStoredProgress()[workspaceId] || {};

  const wsEvents = Array.isArray(events)
    ? events.filter((e) => String(e.workspace_id) === String(workspaceId))
    : [];

  const discoveryEvent = wsEvents.some(
    (e) => e.event_type === 'discovery_execution_completed' || e.event_type === 'discovery_completed'
  );
  const conceptEvent = wsEvents.some(
    (e) => e.event_type === 'concept_evaluation_completed' || e.event_type === 'concept_completed'
  );
  const prototypeEvent = wsEvents.some(
    (e) => e.event_type === 'prototype_blueprint_generated' || e.event_type === 'prototype_completed'
  );

  const discoveryCompleted = Boolean(local.discovery || discoveryEvent);
  const conceptCompleted = Boolean(local.concept || conceptEvent);
  const prototypeCompleted = Boolean(local.prototype || prototypeEvent);

  let statusLabel = 'Ready for Discovery';
  let badgeVariant = 'amber';

  if (prototypeCompleted) {
    statusLabel = 'Phase 1 Completed';
    badgeVariant = 'emerald';
  } else if (conceptCompleted) {
    statusLabel = 'Ready for Offer Blueprint';
    badgeVariant = 'indigo';
  } else if (discoveryCompleted) {
    statusLabel = 'Discovery Completed';
    badgeVariant = 'purple';
  }

  return {
    discoveryCompleted,
    conceptCompleted,
    prototypeCompleted,
    canAccessDiscovery: true,
    canAccessConcept: discoveryCompleted,
    canAccessPrototype: conceptCompleted,
    statusLabel,
    badgeVariant,
  };
};
