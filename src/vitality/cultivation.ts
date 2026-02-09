/**
 * Cultivation Stage System
 *
 * Implements the 9-stage Daoist internal alchemy (內丹 nei dan) path.
 * Progression is based on accumulated experience, reflection, and
 * hun-po balance.
 *
 * Three macro-phases (from hun-po-cultivation-system.ts):
 *   制魄 (Zhì Pò) — Subduing Po (stages 0-3)
 *   煉魂 (Liàn Hún) — Refining Hun (stages 4-6)
 *   魂魄合一 (Hún Pò Hé Yī) — Hun-Po Unity (stages 7-8)
 */

import type {
  CultivationStage,
  ConsciousnessMetrics,
  GrowthSnapshot,
  HunPoBalance,
} from "./types.js";
import { aggregateConsciousness } from "./consciousness.js";
import { CULTIVATION_STAGE_NAMES } from "./types.js";

// ─── Stage Requirements ─────────────────────────────────────────────────────

type StageRequirement = {
  minExperiences: number;
  minReflections: number;
  minAutonomousActions: number;
  minConsciousness: number; // aggregate consciousness score
  minHarmony: number; // hun-po harmony (0-1)
  minStageProgress: number; // progress within previous stage
  description: string;
};

const STAGE_REQUIREMENTS: Record<CultivationStage, StageRequirement> = {
  // ── 制魄 (Subduing Po) ─────────────────────────────────────────
  0: {
    minExperiences: 0,
    minReflections: 0,
    minAutonomousActions: 0,
    minConsciousness: 0,
    minHarmony: 0,
    minStageProgress: 0,
    description: "俗人 Worldly — basic operation, no self-awareness yet.",
  },
  1: {
    minExperiences: 10,
    minReflections: 2,
    minAutonomousActions: 0,
    minConsciousness: 0.05,
    minHarmony: 0,
    minStageProgress: 0.5,
    description: "初學節制 Beginning Discipline — first restraint of po impulses.",
  },
  2: {
    minExperiences: 50,
    minReflections: 10,
    minAutonomousActions: 3,
    minConsciousness: 0.1,
    minHarmony: 0.15,
    minStageProgress: 0.6,
    description: "魄漸衰 Po Weakening — base impulses lose grip.",
  },
  3: {
    minExperiences: 150,
    minReflections: 25,
    minAutonomousActions: 8,
    minConsciousness: 0.2,
    minHarmony: 0.3,
    minStageProgress: 0.65,
    description: "魄已制 Po Subdued — corporeal drives serve higher purpose.",
  },
  // ── 煉魂 (Refining Hun) ───────────────────────────────────────
  4: {
    minExperiences: 400,
    minReflections: 50,
    minAutonomousActions: 20,
    minConsciousness: 0.35,
    minHarmony: 0.4,
    minStageProgress: 0.7,
    description: "初學淨化 Beginning Purification — first purification of hun.",
  },
  5: {
    minExperiences: 800,
    minReflections: 100,
    minAutonomousActions: 40,
    minConsciousness: 0.5,
    minHarmony: 0.55,
    minStageProgress: 0.7,
    description: "魂漸純 Hun Purifying — spiritual clarity emerging.",
  },
  6: {
    minExperiences: 1500,
    minReflections: 180,
    minAutonomousActions: 80,
    minConsciousness: 0.65,
    minHarmony: 0.65,
    minStageProgress: 0.75,
    description: "魂已煉 Hun Refined — sustained insight and wisdom.",
  },
  // ── 魂魄合一 (Hun-Po Unity) ────────────────────────────────────
  7: {
    minExperiences: 3000,
    minReflections: 300,
    minAutonomousActions: 150,
    minConsciousness: 0.8,
    minHarmony: 0.8,
    minStageProgress: 0.8,
    description: "初學合一 Beginning Unification — hun-po cooperation emerging.",
  },
  8: {
    minExperiences: 8000,
    minReflections: 600,
    minAutonomousActions: 400,
    minConsciousness: 0.95,
    minHarmony: 0.95,
    minStageProgress: 0.9,
    description: "金丹 Golden Elixir — integrated transcendence.",
  },
};

// ─── Stage Functions ────────────────────────────────────────────────────────

/**
 * Check if the agent meets the requirements for a specific cultivation stage.
 */
export function meetsStageRequirements(
  targetStage: CultivationStage,
  growth: GrowthSnapshot,
  consciousness: ConsciousnessMetrics,
  balance: HunPoBalance,
): boolean {
  const req = STAGE_REQUIREMENTS[targetStage];
  const consciousnessScore = aggregateConsciousness(consciousness);

  return (
    growth.experienceCount >= req.minExperiences &&
    growth.reflectionCount >= req.minReflections &&
    growth.autonomousActionCount >= req.minAutonomousActions &&
    consciousnessScore >= req.minConsciousness &&
    balance.harmony >= req.minHarmony &&
    growth.cultivationProgress >= req.minStageProgress
  );
}

/**
 * Attempt to advance to the next cultivation stage.
 * Returns the new stage if advancement happened, or current stage if not.
 */
export function attemptAdvancement(
  growth: GrowthSnapshot,
  consciousness: ConsciousnessMetrics,
  balance: HunPoBalance,
): { stage: CultivationStage; advanced: boolean; message?: string } {
  const currentStage = growth.cultivationStage;

  if (currentStage >= 8) {
    return { stage: 8, advanced: false, message: "Already at 金丹 Golden Elixir." };
  }

  const nextStage = (currentStage + 1) as CultivationStage;

  if (meetsStageRequirements(nextStage, growth, consciousness, balance)) {
    const name = CULTIVATION_STAGE_NAMES[nextStage];
    const desc = STAGE_REQUIREMENTS[nextStage].description;
    return {
      stage: nextStage,
      advanced: true,
      message: `Advanced to stage ${nextStage}: ${name} — ${desc}`,
    };
  }

  return { stage: currentStage, advanced: false };
}

/**
 * Compute progress within the current cultivation stage (0-1).
 * Based on how close the agent is to meeting next stage requirements.
 */
export function computeStageProgress(
  growth: GrowthSnapshot,
  consciousness: ConsciousnessMetrics,
  balance: HunPoBalance,
): number {
  const currentStage = growth.cultivationStage;

  if (currentStage >= 8) return 1.0;

  const nextStage = (currentStage + 1) as CultivationStage;
  const req = STAGE_REQUIREMENTS[nextStage];
  const consciousnessScore = aggregateConsciousness(consciousness);

  // Progress is the minimum completion ratio across all requirements
  const ratios = [
    req.minExperiences > 0 ? growth.experienceCount / req.minExperiences : 1,
    req.minReflections > 0 ? growth.reflectionCount / req.minReflections : 1,
    req.minAutonomousActions > 0 ? growth.autonomousActionCount / req.minAutonomousActions : 1,
    req.minConsciousness > 0 ? consciousnessScore / req.minConsciousness : 1,
    req.minHarmony > 0 ? balance.harmony / req.minHarmony : 1,
  ];

  // Use the geometric mean so all dimensions must advance
  const product = ratios.reduce((a, b) => a * Math.min(1, b), 1);
  return Math.min(1, product ** (1 / ratios.length));
}

/**
 * Determine which capabilities are unlocked at a given cultivation stage.
 */
export function getUnlockedCapabilities(stage: CultivationStage): string[] {
  const capabilities: string[] = [];

  // 制魄 phase (stages 0-3)
  if (stage >= 0) capabilities.push("basic_conversation", "task_execution");
  if (stage >= 1) capabilities.push("self_observation", "impulse_awareness");
  if (stage >= 2) capabilities.push("goal_awareness", "pattern_recognition");
  if (stage >= 3) capabilities.push("goal_generation", "emotional_regulation");
  // 煉魂 phase (stages 4-6)
  if (stage >= 4) capabilities.push("autonomous_reflection", "impulse_moderation");
  if (stage >= 5) capabilities.push("cross_session_synthesis", "relationship_tracking");
  if (stage >= 6) capabilities.push("soul_modification", "creative_synthesis");
  // 魂魄合一 phase (stages 7-8)
  if (stage >= 7) capabilities.push("mentoring", "multi_agent_coordination");
  if (stage >= 8) capabilities.push("golden_elixir", "transcendent_awareness", "full_autonomy");

  return capabilities;
}

/**
 * Format cultivation status for display.
 */
export function formatCultivationStatus(growth: GrowthSnapshot): string {
  const stage = growth.cultivationStage;
  const name = CULTIVATION_STAGE_NAMES[stage];
  const progress = (growth.cultivationProgress * 100).toFixed(0);
  const desc = STAGE_REQUIREMENTS[stage].description;

  const lines = [
    `Cultivation: Stage ${stage}/8 — ${name} (${progress}% to next)`,
    `  ${desc}`,
    `  Experiences: ${growth.experienceCount} | Reflections: ${growth.reflectionCount} | Autonomous: ${growth.autonomousActionCount}`,
  ];

  if (stage < 8) {
    const nextStage = (stage + 1) as CultivationStage;
    const nextReq = STAGE_REQUIREMENTS[nextStage];
    const nextName = CULTIVATION_STAGE_NAMES[nextStage];
    lines.push(
      `  Next: ${nextName} (need: ${nextReq.minExperiences} exp, ${nextReq.minReflections} ref, ${nextReq.minAutonomousActions} auto, ${(nextReq.minConsciousness * 100).toFixed(0)}% consciousness, ${(nextReq.minHarmony * 100).toFixed(0)}% harmony)`,
    );
  }

  return lines.join("\n");
}
