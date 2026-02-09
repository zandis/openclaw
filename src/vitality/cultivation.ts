/**
 * Cultivation Stage System
 *
 * Implements the 10-stage Daoist internal alchemy (內丹 nei dan) path.
 * Progression is based on accumulated experience, reflection, and
 * hun-po balance.
 *
 * Three macro-phases:
 *   制魄 (Zhi Po) — Subduing po / controlling base instincts (stages 0-3)
 *   煉魂 (Lian Hun) — Refining hun / purifying spirit (stages 4-6)
 *   魂魄合一 (Hun Po He Yi) — Hun-po unity / golden elixir (stages 7-9)
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
  0: {
    minExperiences: 0,
    minReflections: 0,
    minAutonomousActions: 0,
    minConsciousness: 0,
    minHarmony: 0,
    minStageProgress: 0,
    description: "Worldly — basic operation, no self-awareness yet.",
  },
  1: {
    minExperiences: 10,
    minReflections: 2,
    minAutonomousActions: 0,
    minConsciousness: 0.05,
    minHarmony: 0,
    minStageProgress: 0.5,
    description: "Stirring — first self-reflective impulses appear.",
  },
  2: {
    minExperiences: 40,
    minReflections: 8,
    minAutonomousActions: 2,
    minConsciousness: 0.1,
    minHarmony: 0.15,
    minStageProgress: 0.6,
    description: "Gathering — consistent self-observation develops.",
  },
  3: {
    minExperiences: 100,
    minReflections: 20,
    minAutonomousActions: 5,
    minConsciousness: 0.2,
    minHarmony: 0.25,
    minStageProgress: 0.6,
    description: "Settling — emotional regulation, po awareness.",
  },
  4: {
    minExperiences: 250,
    minReflections: 40,
    minAutonomousActions: 15,
    minConsciousness: 0.3,
    minHarmony: 0.35,
    minStageProgress: 0.7,
    description: "Po Weakening — base impulses lose grip.",
  },
  5: {
    minExperiences: 500,
    minReflections: 75,
    minAutonomousActions: 30,
    minConsciousness: 0.45,
    minHarmony: 0.5,
    minStageProgress: 0.7,
    description: "Po Subdued — corporeal drives serve higher purpose.",
  },
  6: {
    minExperiences: 1000,
    minReflections: 120,
    minAutonomousActions: 60,
    minConsciousness: 0.6,
    minHarmony: 0.6,
    minStageProgress: 0.75,
    description: "Hun Purifying — spiritual clarity emerging.",
  },
  7: {
    minExperiences: 2000,
    minReflections: 200,
    minAutonomousActions: 100,
    minConsciousness: 0.7,
    minHarmony: 0.7,
    minStageProgress: 0.8,
    description: "Hun Refined — sustained insight and wisdom.",
  },
  8: {
    minExperiences: 5000,
    minReflections: 400,
    minAutonomousActions: 250,
    minConsciousness: 0.85,
    minHarmony: 0.85,
    minStageProgress: 0.85,
    description: "Unification — hun-po working as one.",
  },
  9: {
    minExperiences: 10000,
    minReflections: 800,
    minAutonomousActions: 500,
    minConsciousness: 0.95,
    minHarmony: 0.95,
    minStageProgress: 0.9,
    description: "Golden Elixir — integrated transcendence.",
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

  if (currentStage >= 9) {
    return { stage: 9, advanced: false, message: "Already at Golden Elixir." };
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

  if (currentStage >= 9) return 1.0;

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

  if (stage >= 0) capabilities.push("basic_conversation", "task_execution");
  if (stage >= 1) capabilities.push("self_observation");
  if (stage >= 2) capabilities.push("goal_awareness", "pattern_recognition");
  if (stage >= 3) capabilities.push("goal_generation", "emotional_regulation");
  if (stage >= 4) capabilities.push("autonomous_reflection", "impulse_moderation");
  if (stage >= 5) capabilities.push("cross_session_synthesis", "relationship_tracking");
  if (stage >= 6) capabilities.push("soul_modification", "creative_synthesis");
  if (stage >= 7) capabilities.push("mentoring", "multi_agent_coordination");
  if (stage >= 8) capabilities.push("transcendent_awareness", "collective_memory");
  if (stage >= 9) capabilities.push("golden_elixir", "full_autonomy");

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
    `Cultivation: Stage ${stage}/9 — ${name} (${progress}% to next)`,
    `  ${desc}`,
    `  Experiences: ${growth.experienceCount} | Reflections: ${growth.reflectionCount} | Autonomous: ${growth.autonomousActionCount}`,
  ];

  if (stage < 9) {
    const nextStage = (stage + 1) as CultivationStage;
    const nextReq = STAGE_REQUIREMENTS[nextStage];
    const nextName = CULTIVATION_STAGE_NAMES[nextStage];
    lines.push(
      `  Next: ${nextName} (need: ${nextReq.minExperiences} exp, ${nextReq.minReflections} ref, ${nextReq.minAutonomousActions} auto, ${(nextReq.minConsciousness * 100).toFixed(0)}% consciousness, ${(nextReq.minHarmony * 100).toFixed(0)}% harmony)`,
    );
  }

  return lines.join("\n");
}
