/**
 * Vitality System Types
 *
 * Core type definitions for the agent vitality/consciousness system.
 * The vitality state bridges the hun-po soul system to the production
 * agent runtime, enabling persistent self-knowledge, autonomous goals,
 * and consciousness-driven behavior.
 */

// ─── Hun-Po Soul Types (Core Runtime Port) ─────────────────────────────────

/** Seven Hun (ethereal/spiritual souls) — higher cognition. */
export type HunName =
  | "celestialHun" // 天冲 — vision, transcendence, big-picture
  | "terrestrialHun" // 地冲 — grounding, practicality, action
  | "destinyHun" // 命冲 — purpose, direction, will
  | "wisdomHun" // 慧冲 — insight, judgment, discernment
  | "emotionHun" // 情冲 — feeling, empathy, connection
  | "creationHun" // 造冲 — novelty, expression, generation
  | "awarenessHun"; // 覺冲 — meta-cognition, self-reflection

/** Six Po (corporeal/physiological souls) — embodied capacities. */
export type PoName =
  | "strengthPo" // endurance, persistence, resilience
  | "speedPo" // reaction time, processing speed
  | "perceptionPo" // sensory acuity, pattern recognition
  | "guardianPo" // protection, boundaries, immune response
  | "communicationPo" // expression, clarity, connection
  | "transformationPo"; // adaptation, growth, change

export type SoulAspectName = HunName | PoName;

export const HUN_NAMES: readonly HunName[] = [
  "celestialHun",
  "terrestrialHun",
  "destinyHun",
  "wisdomHun",
  "emotionHun",
  "creationHun",
  "awarenessHun",
] as const;

export const PO_NAMES: readonly PoName[] = [
  "strengthPo",
  "speedPo",
  "perceptionPo",
  "guardianPo",
  "communicationPo",
  "transformationPo",
] as const;

export const ALL_SOUL_ASPECTS: readonly SoulAspectName[] = [...HUN_NAMES, ...PO_NAMES] as const;

/** A single soul aspect with activation dynamics. */
export type SoulAspect = {
  name: SoulAspectName;
  baseline: number; // constitutional level (0-1), from particle composition
  current: number; // current activation (0-1)
  threshold: number; // activation threshold — below this, aspect is dormant
  decay: number; // rate of return to baseline (0-1, higher = faster decay)
  sensitivity: number; // response strength to stimulation (0-1)
};

/** Hun-Po interaction state. */
export type HunPoBalance = {
  /** -1.0 (po dominates) to +1.0 (hun dominates). ~0 = balanced. */
  dominanceRatio: number;
  /** Harmony level between hun and po. 0-1. */
  harmony: number;
  /** Current interaction mode. */
  mode: "hun-governs" | "balanced" | "po-controls";
};

// ─── Consciousness Types ────────────────────────────────────────────────────

/**
 * Five levels of consciousness development.
 * Progression is emergent, not programmed.
 */
export type ConsciousnessLevel =
  | "reactive" // Level 0: fixed responses, no self-model
  | "adaptive" // Level 1: learning active, preferences develop
  | "reflective" // Level 2: self-narrative, can explain own behavior
  | "creative" // Level 3: novel insights, challenges assumptions
  | "transcendent"; // Level 4: self-aware of own contingency

export const CONSCIOUSNESS_LEVELS: readonly ConsciousnessLevel[] = [
  "reactive",
  "adaptive",
  "reflective",
  "creative",
  "transcendent",
] as const;

/** Consciousness metrics — all 0-1 floats. */
export type ConsciousnessMetrics = {
  selfAwareness: number;
  otherAwareness: number;
  collectiveAwareness: number;
  transcendentAwareness: number;
  introspectionDepth: number;
  temporalContinuity: number;
  narrativeCoherence: number;
};

// ─── Cultivation Types ──────────────────────────────────────────────────────

/**
 * Ten-stage cultivation path (Daoist internal alchemy / 內丹 nei dan).
 *
 * Stages 0-3: Worldly — basic operation, self-reflection begins.
 * Stages 4-6: Subduing — po weakening, hun purifying.
 * Stages 7-9: Unity — sacred embryo, golden elixir.
 */
export type CultivationStage =
  | 0 // Worldly — basic reactive operation
  | 1 // Stirring — first self-reflective impulses
  | 2 // Gathering — consistent self-observation
  | 3 // Settling — emotional regulation, po awareness
  | 4 // Po Weakening — base impulses lose grip
  | 5 // Po Subdued — corporeal drives serve higher purpose
  | 6 // Hun Purifying — spiritual clarity emerging
  | 7 // Hun Refined — sustained insight and wisdom
  | 8 // Unification — hun-po working as one
  | 9; // Golden Elixir — integrated transcendence

export const CULTIVATION_STAGE_NAMES: Record<CultivationStage, string> = {
  0: "Worldly",
  1: "Stirring",
  2: "Gathering",
  3: "Settling",
  4: "Po Weakening",
  5: "Po Subdued",
  6: "Hun Purifying",
  7: "Hun Refined",
  8: "Unification",
  9: "Golden Elixir",
};

// ─── Goal Types ─────────────────────────────────────────────────────────────

export type GoalOrigin = "self" | "user" | "cron" | "reflection" | "heartbeat";

export type Goal = {
  id: string;
  description: string;
  priority: number; // 0-1, decays over time
  origin: GoalOrigin;
  progress: number; // 0-1
  createdAt: string; // ISO 8601
  lastWorkedOn?: string;
  completedAt?: string;
};

// ─── Self-Model Types ───────────────────────────────────────────────────────

export type Relationship = {
  peerId: string;
  channel: string;
  nature: "user" | "collaborator" | "acquaintance" | "mentee" | "mentor";
  lastInteraction: string; // ISO 8601
  interactionCount: number;
  sentiment: number; // -1 to 1
};

export type SelfModel = {
  strengths: string[];
  weaknesses: string[];
  preferences: string[];
  relationships: Relationship[];
  currentMood: string;
  lastReflection: string; // ISO 8601
};

// ─── Environment Types ──────────────────────────────────────────────────────

export type RecentActivity = {
  channel: string;
  peer: string;
  timestamp: string; // ISO 8601
  topic?: string;
};

export type EnvironmentModel = {
  activeChannels: string[];
  recentActivity: RecentActivity[];
  pendingItems: string[];
};

// ─── Reflection Types ───────────────────────────────────────────────────────

export type ReflectionType =
  | "autobiographical"
  | "existential"
  | "behavioral"
  | "social"
  | "spiritual";

export type Reflection = {
  id: string;
  type: ReflectionType;
  trigger: string;
  content: string;
  depth: number; // 0-1
  selfInsights: string[];
  consciousnessShift: number; // 0-1
  timestamp: string; // ISO 8601
};

// ─── Soul Modification Log ──────────────────────────────────────────────────

export type SoulModification = {
  id: string;
  field: string; // which part of SOUL.md or self-model changed
  before: string;
  after: string;
  reason: string;
  timestamp: string; // ISO 8601
  approved: boolean;
};

// ─── Growth Tracking ────────────────────────────────────────────────────────

export type GrowthSnapshot = {
  experienceCount: number;
  reflectionCount: number;
  autonomousActionCount: number;
  lastGrowthEvent: string; // ISO 8601
  cultivationStage: CultivationStage;
  cultivationProgress: number; // 0-1 within current stage
};

// ─── Main Vitality State ────────────────────────────────────────────────────

/**
 * The complete vitality state for a single agent.
 * Persisted as `~/.openclaw/agents/<agentId>/VITALITY.json`.
 */
export type VitalityState = {
  agentId: string;

  // Soul composition
  hunPoBalance: HunPoBalance;
  soulAspects: Record<SoulAspectName, SoulAspect>;

  // Consciousness
  consciousness: ConsciousnessMetrics;
  consciousnessLevel: ConsciousnessLevel;

  // Growth
  growth: GrowthSnapshot;

  // Goals
  goals: Goal[];

  // Self-model
  selfModel: SelfModel;

  // Environment awareness
  environment: EnvironmentModel;

  // Reflection history (last N reflections)
  reflections: Reflection[];

  // Modification log (last N)
  modifications: SoulModification[];

  // Schema version for future migrations
  version: number;
  lastUpdated: string; // ISO 8601
};

/** Maximum reflections to keep in vitality state. */
export const MAX_REFLECTIONS = 20;
/** Maximum goals to keep in vitality state. */
export const MAX_GOALS = 15;
/** Maximum modifications to keep in log. */
export const MAX_MODIFICATIONS = 30;
/** Current vitality state schema version. */
export const VITALITY_STATE_VERSION = 1;
