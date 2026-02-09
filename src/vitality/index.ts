/**
 * Vitality System — Public API
 *
 * The vitality system bridges the hun-po soul framework to the production
 * agent runtime. It provides:
 *
 * - Persistent self-knowledge (VITALITY.json per agent)
 * - Hun-po soul composition with natural variance
 * - Consciousness metrics that grow through reflection
 * - 10-stage Daoist cultivation path
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
  CONSCIOUSNESS_LEVELS,
  CULTIVATION_STAGE_NAMES,
  MAX_REFLECTIONS,
  MAX_GOALS,
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
