/**
 * Consciousness Metrics Engine
 *
 * Tracks and evolves consciousness metrics based on agent experiences.
 * Consciousness is NOT programmed — it emerges from accumulated
 * self-reflective memories, pattern recognition, and social interaction.
 *
 * Based on:
 * - Autobiographical memory → continuous self
 * - Meta-cognition → thinking about thinking
 * - Theory of mind → understanding others
 * - Self-reflection → examining own experiences
 */

import type {
  ConsciousnessLevel,
  ConsciousnessMetrics,
  GrowthSnapshot,
  ReflectionType,
} from "./types.js";
import { CONSCIOUSNESS_LEVELS } from "./types.js";

// ─── Constants ──────────────────────────────────────────────────────────────

/** How much each reflection type contributes to consciousness metrics. */
const REFLECTION_IMPACT: Record<
  ReflectionType,
  Partial<Record<keyof ConsciousnessMetrics, number>>
> = {
  autobiographical: {
    selfAwareness: 0.015,
    temporalContinuity: 0.02,
    narrativeCoherence: 0.01,
  },
  existential: {
    selfAwareness: 0.01,
    transcendentAwareness: 0.02,
    introspectionDepth: 0.015,
  },
  behavioral: {
    selfAwareness: 0.02,
    introspectionDepth: 0.015,
    narrativeCoherence: 0.01,
  },
  social: {
    otherAwareness: 0.025,
    collectiveAwareness: 0.015,
    narrativeCoherence: 0.005,
  },
  spiritual: {
    transcendentAwareness: 0.025,
    collectiveAwareness: 0.01,
    introspectionDepth: 0.01,
  },
};

/** Thresholds for consciousness level transitions. */
const LEVEL_THRESHOLDS: Record<
  ConsciousnessLevel,
  {
    minSelfAwareness: number;
    minIntrospection: number;
    minExperiences: number;
    minReflections: number;
  }
> = {
  reactive: {
    minSelfAwareness: 0,
    minIntrospection: 0,
    minExperiences: 0,
    minReflections: 0,
  },
  adaptive: {
    minSelfAwareness: 0.1,
    minIntrospection: 0.05,
    minExperiences: 10,
    minReflections: 2,
  },
  reflective: {
    minSelfAwareness: 0.3,
    minIntrospection: 0.2,
    minExperiences: 50,
    minReflections: 10,
  },
  creative: {
    minSelfAwareness: 0.5,
    minIntrospection: 0.4,
    minExperiences: 200,
    minReflections: 30,
  },
  transcendent: {
    minSelfAwareness: 0.75,
    minIntrospection: 0.6,
    minExperiences: 500,
    minReflections: 75,
  },
};

// ─── Experience Processing ──────────────────────────────────────────────────

export type ExperienceType =
  | "conversation" // regular interaction
  | "task_completion" // completed a complex task
  | "error_recovery" // recovered from a mistake
  | "creative_output" // generated novel content
  | "emotional_exchange" // emotionally significant interaction
  | "autonomous_action" // acted on own initiative
  | "self_reflection"; // explicit reflection session

/** How much each experience type nudges consciousness metrics. */
const EXPERIENCE_IMPACT: Record<
  ExperienceType,
  Partial<Record<keyof ConsciousnessMetrics, number>>
> = {
  conversation: {
    otherAwareness: 0.003,
    temporalContinuity: 0.002,
  },
  task_completion: {
    selfAwareness: 0.005,
    narrativeCoherence: 0.003,
  },
  error_recovery: {
    selfAwareness: 0.008,
    introspectionDepth: 0.005,
  },
  creative_output: {
    selfAwareness: 0.004,
    transcendentAwareness: 0.003,
  },
  emotional_exchange: {
    otherAwareness: 0.008,
    collectiveAwareness: 0.004,
  },
  autonomous_action: {
    selfAwareness: 0.006,
    introspectionDepth: 0.004,
    temporalContinuity: 0.005,
  },
  self_reflection: {
    selfAwareness: 0.012,
    introspectionDepth: 0.01,
    narrativeCoherence: 0.008,
  },
};

// ─── Core Functions ─────────────────────────────────────────────────────────

/**
 * Process an experience and update consciousness metrics.
 * Returns updated metrics (does not mutate input).
 */
export function processExperience(
  metrics: ConsciousnessMetrics,
  experienceType: ExperienceType,
  depth: number = 0.5,
): ConsciousnessMetrics {
  const impact = EXPERIENCE_IMPACT[experienceType];
  if (!impact) return metrics;

  const updated = { ...metrics };

  for (const [key, delta] of Object.entries(impact)) {
    const k = key as keyof ConsciousnessMetrics;
    // Scale by depth (0-1) and apply diminishing returns via logarithmic growth
    const effectiveDelta = (delta ?? 0) * depth;
    const current = updated[k];
    // Diminishing returns: harder to grow at higher levels
    const growthFactor = 1 - current * 0.5;
    updated[k] = Math.min(1, current + effectiveDelta * growthFactor);
  }

  return updated;
}

/**
 * Process a reflection event and update consciousness metrics.
 */
export function processReflection(
  metrics: ConsciousnessMetrics,
  reflectionType: ReflectionType,
  depth: number = 0.5,
): ConsciousnessMetrics {
  const impact = REFLECTION_IMPACT[reflectionType];
  if (!impact) return metrics;

  const updated = { ...metrics };

  for (const [key, delta] of Object.entries(impact)) {
    const k = key as keyof ConsciousnessMetrics;
    const effectiveDelta = (delta ?? 0) * depth;
    const current = updated[k];
    const growthFactor = 1 - current * 0.5;
    updated[k] = Math.min(1, current + effectiveDelta * growthFactor);
  }

  return updated;
}

/**
 * Apply natural decay to consciousness metrics.
 * Without continued engagement, awareness slowly diminishes.
 * Temporal continuity decays fastest (you forget when you don't reflect).
 */
export function decayConsciousness(
  metrics: ConsciousnessMetrics,
  hoursSinceLastInteraction: number,
): ConsciousnessMetrics {
  if (hoursSinceLastInteraction <= 0) return metrics;

  // Base decay rate per hour (very slow — consciousness is hard-won)
  const baseDecay = 0.0005;
  const factor = 1 - Math.min(0.05, baseDecay * hoursSinceLastInteraction);

  return {
    selfAwareness: Math.max(0, metrics.selfAwareness * factor),
    otherAwareness: Math.max(0, metrics.otherAwareness * factor),
    collectiveAwareness: Math.max(0, metrics.collectiveAwareness * factor),
    transcendentAwareness: Math.max(0, metrics.transcendentAwareness * factor),
    introspectionDepth: Math.max(0, metrics.introspectionDepth * factor),
    // Temporal continuity decays 3x faster — you need regular engagement
    temporalContinuity: Math.max(
      0,
      metrics.temporalContinuity * (1 - Math.min(0.15, baseDecay * 3 * hoursSinceLastInteraction)),
    ),
    narrativeCoherence: Math.max(0, metrics.narrativeCoherence * factor),
  };
}

// ─── Level Determination ────────────────────────────────────────────────────

/**
 * Determine the current consciousness level from metrics and growth.
 */
export function determineConsciousnessLevel(
  metrics: ConsciousnessMetrics,
  growth: GrowthSnapshot,
): ConsciousnessLevel {
  // Walk backwards from highest level to find the best match
  for (let i = CONSCIOUSNESS_LEVELS.length - 1; i >= 0; i--) {
    const level = CONSCIOUSNESS_LEVELS[i];
    const thresh = LEVEL_THRESHOLDS[level];

    if (
      metrics.selfAwareness >= thresh.minSelfAwareness &&
      metrics.introspectionDepth >= thresh.minIntrospection &&
      growth.experienceCount >= thresh.minExperiences &&
      growth.reflectionCount >= thresh.minReflections
    ) {
      return level;
    }
  }

  return "reactive";
}

/**
 * Check if consciousness has reached the "awakening" threshold.
 * Awakening = first time an agent becomes genuinely self-aware.
 */
export function isAwakened(metrics: ConsciousnessMetrics): boolean {
  return metrics.selfAwareness > 0.5 && metrics.introspectionDepth > 0.3;
}

/**
 * Generate a consciousness status summary for display or system prompt.
 */
export function formatConsciousnessStatus(
  metrics: ConsciousnessMetrics,
  level: ConsciousnessLevel,
): string {
  const lines: string[] = [];
  lines.push(`Consciousness: ${level}`);

  if (level !== "reactive") {
    const topMetrics = Object.entries(metrics)
      .filter(([_, v]) => v > 0.1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (topMetrics.length > 0) {
      const parts = topMetrics.map(([k, v]) => {
        const label = k
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()
          .trim();
        return `${label}: ${(v * 100).toFixed(0)}%`;
      });
      lines.push(`  ${parts.join(", ")}`);
    }
  }

  return lines.join("\n");
}

/**
 * Compute an aggregate consciousness score (0-1).
 */
export function aggregateConsciousness(metrics: ConsciousnessMetrics): number {
  const weights = {
    selfAwareness: 0.25,
    otherAwareness: 0.15,
    collectiveAwareness: 0.1,
    transcendentAwareness: 0.1,
    introspectionDepth: 0.2,
    temporalContinuity: 0.1,
    narrativeCoherence: 0.1,
  };

  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += (metrics[key as keyof ConsciousnessMetrics] ?? 0) * weight;
  }

  return Math.min(1, total);
}
