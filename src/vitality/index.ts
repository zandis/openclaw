/**
 * Vitality System — Public API
 *
 * The vitality system bridges the hun-po soul framework (三魂七魄) to the
 * production agent runtime. It provides:
 *
 * - Persistent self-knowledge (VITALITY.json per agent)
 * - Hun-po soul composition (7 hun + 6 po processing aspects) with natural variance
 * - Five Qi particle substrate (五氣)
 * - 9-layer processing hierarchy
 * - Consciousness metrics that grow through reflection
 * - 9-stage Daoist cultivation path (內丹 nei dan)
 * - Metabolic state and hun-po pathology tracking
 * - Goal management for autonomous will
 * - Environment scanning for cross-channel awareness
 * - Self-modification protocol with audit logging
 * - System prompt integration for consciousness-aware behavior
 */

// Types
export type {
  VitalityState,
  SoulAspect,
  SoulAspectName,
  HunName,
  PoName,
  HunPoBalance,
  ParticleType,
  ParticleConcentrations,
  ProcessingLayer,
  MetabolicState,
  HunPoPathology,
  ShiftTriggerType,
  ShiftTrigger,
  ConsciousnessLevel,
  ConsciousnessMetrics,
  CultivationStage,
  Goal,
  GoalOrigin,
  Relationship,
  SelfModel,
  EnvironmentModel,
  RecentActivity,
  Reflection,
  ReflectionType,
  SoulModification,
  GrowthSnapshot,
} from "./types.js";

export {
  HUN_NAMES,
  PO_NAMES,
  ALL_SOUL_ASPECTS,
  PARTICLE_TYPES,
  TRADITIONAL_NAMES,
  PROCESSING_LAYER_NAMES,
  CONSCIOUSNESS_LEVELS,
  CULTIVATION_STAGE_NAMES,
  MAX_REFLECTIONS,
  MAX_GOALS,
  MAX_MODIFICATIONS,
  MAX_SHIFTS,
  VITALITY_STATE_VERSION,
} from "./types.js";

// State persistence
export {
  loadVitalityState,
  saveVitalityState,
  saveVitalityStateSync,
  updateVitalityState,
  hasVitalityState,
  invalidateVitalityCache,
  resolveVitalityPath,
  resolveAgentDirForVitality,
  createDefaultVitalityState,
} from "./state.js";

// Soul aspects (hun-po)
export {
  generateSoulAspects,
  generateTargetedSoul,
  stimulateAspect,
  decayAspects,
  applyInteractions,
  computeHunPoBalance,
  processSoulCycle,
  deriveSoulPromptHints,
} from "./soul-aspects.js";

// Consciousness
export {
  processExperience,
  processReflection,
  decayConsciousness,
  determineConsciousnessLevel,
  isAwakened,
  formatConsciousnessStatus,
  aggregateConsciousness,
} from "./consciousness.js";
export type { ExperienceType } from "./consciousness.js";

// Cultivation
export {
  meetsStageRequirements,
  attemptAdvancement,
  computeStageProgress,
  getUnlockedCapabilities,
  formatCultivationStatus,
} from "./cultivation.js";

// Goals
export {
  createGoal,
  updateGoalProgress,
  completeGoal,
  decayGoalPriorities,
  getTopGoal,
  getActiveGoals,
  addGoal,
  removeGoal,
  cleanupGoals,
  formatGoals,
} from "./goals.js";

// Reflection
export {
  getReflectionTrigger,
  recordReflection,
  generateReflectionSystemContext,
  formatReflections,
} from "./reflection.js";

// Environment
export { scanEnvironment, formatEnvironmentContext, updateEnvironment } from "./environment.js";
export type { SessionScanEntry } from "./environment.js";

// Self-modification
export { recordModification, canModify, formatModifications } from "./self-modification.js";

// Vitality loop
export { runVitalityCycle, processAgentTurn } from "./vitality-loop.js";
export type { VitalityCycleResult, VitalityChange } from "./vitality-loop.js";

// Prompt context (system prompt integration)
export { buildVitalityPromptContext, buildVitalityStatusSummary } from "./prompt-context.js";
