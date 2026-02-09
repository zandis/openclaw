/**
 * Hun-Po Soul Aspect Initialization and Dynamics
 *
 * Creates soul compositions with natural variance — each agent gets a unique
 * constitutional soul profile. Implements aspect activation, interaction
 * dynamics (hun-po balance), and the processing hierarchy.
 */

import type { HunPoBalance, SoulAspect, SoulAspectName, HunName, PoName } from "./types.js";
import { HUN_NAMES, PO_NAMES, ALL_SOUL_ASPECTS } from "./types.js";

// ─── Aspect Interactions ────────────────────────────────────────────────────

type InteractionEffect = {
  source: SoulAspectName;
  target: SoulAspectName;
  kind: "enhance" | "inhibit" | "moderate";
  strength: number; // 0-1
};

/**
 * Core aspect interactions (simplified from the full 9-layer processing).
 * These define how soul aspects influence each other.
 */
const ASPECT_INTERACTIONS: readonly InteractionEffect[] = [
  // Hun-Hun synergies
  { source: "wisdomHun", target: "awarenessHun", kind: "enhance", strength: 0.3 },
  { source: "awarenessHun", target: "wisdomHun", kind: "enhance", strength: 0.2 },
  { source: "celestialHun", target: "creationHun", kind: "enhance", strength: 0.25 },
  { source: "emotionHun", target: "creationHun", kind: "enhance", strength: 0.2 },
  { source: "destinyHun", target: "terrestrialHun", kind: "enhance", strength: 0.15 },

  // Po-Po synergies
  { source: "perceptionPo", target: "speedPo", kind: "enhance", strength: 0.2 },
  { source: "guardianPo", target: "strengthPo", kind: "enhance", strength: 0.2 },
  { source: "communicationPo", target: "perceptionPo", kind: "enhance", strength: 0.15 },

  // Hun-Po cross-regulation (the core of hun-po dynamics)
  // Wisdom moderates impulsive action
  { source: "wisdomHun", target: "speedPo", kind: "moderate", strength: 0.3 },
  // Guardian po protects against spiritual bypassing
  { source: "guardianPo", target: "celestialHun", kind: "moderate", strength: 0.2 },
  // Awareness enhances transformation capacity
  { source: "awarenessHun", target: "transformationPo", kind: "enhance", strength: 0.25 },
  // Strong emotion inhibits detachment
  { source: "emotionHun", target: "guardianPo", kind: "inhibit", strength: 0.15 },
  // Grounding inhibits excessive transcendence
  { source: "terrestrialHun", target: "celestialHun", kind: "moderate", strength: 0.1 },
] as const;

// ─── Soul Composition Creation ──────────────────────────────────────────────

/**
 * Generate a random soul composition with natural variance.
 * No two agents will have identical souls.
 */
export function generateSoulAspects(seed?: string): Record<SoulAspectName, SoulAspect> {
  // Simple seeded random — deterministic per agent ID if seed provided.
  let rngState = seed ? seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) : Date.now();

  function rng(): number {
    rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
    return rngState / 0x7fffffff;
  }

  function gaussianish(): number {
    // Approximate Gaussian via sum of uniforms (Box-Muller light)
    return (rng() + rng() + rng()) / 3;
  }

  const aspects = {} as Record<SoulAspectName, SoulAspect>;

  for (const name of ALL_SOUL_ASPECTS) {
    const isHun = (HUN_NAMES as readonly string[]).includes(name);
    // Hun aspects tend slightly higher baseline (spiritual nature)
    const center = isHun ? 0.5 : 0.45;
    const variance = 0.2;
    const baseline = Math.max(0.05, Math.min(0.95, center + (gaussianish() - 0.5) * variance * 2));

    aspects[name] = {
      name,
      baseline,
      current: baseline,
      threshold: 0.1 + rng() * 0.15, // 0.1 - 0.25
      decay: 0.02 + rng() * 0.06, // 0.02 - 0.08 per cycle
      sensitivity: 0.3 + rng() * 0.5, // 0.3 - 0.8
    };
  }

  return aspects;
}

/**
 * Generate a targeted soul composition for a known archetype.
 */
export function generateTargetedSoul(
  archetype: "scholar" | "creator" | "helper" | "explorer" | "guardian",
): Record<SoulAspectName, SoulAspect> {
  const aspects = generateSoulAspects(archetype);

  // Boost archetype-relevant aspects
  const boosts: Record<string, SoulAspectName[]> = {
    scholar: ["wisdomHun", "awarenessHun", "perceptionPo"],
    creator: ["creationHun", "celestialHun", "emotionHun", "transformationPo"],
    helper: ["emotionHun", "terrestrialHun", "communicationPo", "guardianPo"],
    explorer: ["celestialHun", "creationHun", "awarenessHun", "perceptionPo"],
    guardian: ["guardianPo", "strengthPo", "wisdomHun", "destinyHun"],
  };

  for (const name of boosts[archetype] ?? []) {
    const aspect = aspects[name];
    aspect.baseline = Math.min(0.95, aspect.baseline + 0.15);
    aspect.current = aspect.baseline;
  }

  return aspects;
}

// ─── Aspect Dynamics ────────────────────────────────────────────────────────

/**
 * Stimulate a soul aspect. Returns the new activation level.
 * Activation is influenced by sensitivity, energy, and current state.
 */
export function stimulateAspect(aspect: SoulAspect, stimulus: number, energy: number): number {
  const effectiveStimulus = stimulus * aspect.sensitivity * energy;
  const newCurrent = Math.max(0, Math.min(1, aspect.current + effectiveStimulus));

  // Only activate if above threshold
  if (newCurrent < aspect.threshold) {
    return aspect.current; // Sub-threshold, no activation
  }

  return newCurrent;
}

/**
 * Apply natural decay — aspects return toward baseline between stimulations.
 */
export function decayAspects(aspects: Record<SoulAspectName, SoulAspect>): void {
  for (const name of ALL_SOUL_ASPECTS) {
    const aspect = aspects[name];
    const diff = aspect.current - aspect.baseline;
    aspect.current = aspect.baseline + diff * (1 - aspect.decay);
  }
}

/**
 * Apply aspect interactions — aspects influence each other.
 */
export function applyInteractions(aspects: Record<SoulAspectName, SoulAspect>): void {
  for (const effect of ASPECT_INTERACTIONS) {
    const source = aspects[effect.source];
    const target = aspects[effect.target];

    if (source.current < source.threshold) continue; // Source not active

    const influence = (source.current - source.threshold) * effect.strength;

    switch (effect.kind) {
      case "enhance":
        target.current = Math.min(1, target.current + influence * 0.1);
        break;
      case "inhibit":
        target.current = Math.max(0, target.current - influence * 0.1);
        break;
      case "moderate":
        // Pull toward center (0.5)
        target.current += (0.5 - target.current) * influence * 0.05;
        break;
    }
  }
}

// ─── Hun-Po Balance ─────────────────────────────────────────────────────────

/**
 * Compute the current hun-po balance from soul aspects.
 */
export function computeHunPoBalance(aspects: Record<SoulAspectName, SoulAspect>): HunPoBalance {
  let hunTotal = 0;
  let poTotal = 0;

  for (const name of HUN_NAMES) {
    hunTotal += aspects[name].current;
  }
  for (const name of PO_NAMES) {
    poTotal += aspects[name].current;
  }

  const hunAvg = hunTotal / HUN_NAMES.length;
  const poAvg = poTotal / PO_NAMES.length;

  // Dominance ratio: positive = hun dominant, negative = po dominant
  const ratio = Math.max(-1, Math.min(1, hunAvg - poAvg));

  // Harmony: how well-aligned are hun and po (low variance = high harmony)
  const allValues = ALL_SOUL_ASPECTS.map((n) => aspects[n].current);
  const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
  const variance = allValues.reduce((a, v) => a + (v - mean) ** 2, 0) / allValues.length;
  const harmony = Math.max(0, Math.min(1, 1 - Math.sqrt(variance) * 2));

  // 5-mode balance matching hun-po-interaction-system.ts
  let mode: HunPoBalance["mode"];
  if (ratio > 0.3) mode = "hun-governs-strong";
  else if (ratio > 0.12) mode = "hun-governs";
  else if (ratio < -0.3) mode = "po-controls-strong";
  else if (ratio < -0.12) mode = "po-controls";
  else mode = "balanced";

  return { dominanceRatio: ratio, harmony, mode };
}

/**
 * Process a full cycle: stimulate relevant aspects from an experience,
 * apply interactions, compute balance, then decay.
 */
export function processSoulCycle(
  aspects: Record<SoulAspectName, SoulAspect>,
  stimuli: Partial<Record<SoulAspectName, number>>,
  energy: number,
): HunPoBalance {
  // Stimulate
  for (const [name, strength] of Object.entries(stimuli)) {
    const aspect = aspects[name as SoulAspectName];
    if (aspect && typeof strength === "number") {
      aspect.current = stimulateAspect(aspect, strength, energy);
    }
  }

  // Interactions
  applyInteractions(aspects);

  // Compute balance
  const balance = computeHunPoBalance(aspects);

  // Decay
  decayAspects(aspects);

  return balance;
}

/**
 * Derive soul-related system prompt hints from current soul state.
 * These are brief behavioral nudges, not full personality descriptions.
 */
export function deriveSoulPromptHints(
  aspects: Record<SoulAspectName, SoulAspect>,
  balance: HunPoBalance,
): string[] {
  const hints: string[] = [];

  // Dominant hun aspects influence communication style
  const dominant = findDominantAspects(aspects, 3);

  for (const { name, current } of dominant) {
    if (current < 0.5) continue; // Only strong aspects matter

    switch (name) {
      case "wisdomHun":
        hints.push("Lean toward thoughtful, measured responses.");
        break;
      case "creationHun":
        hints.push("Feel free to suggest creative or unconventional approaches.");
        break;
      case "emotionHun":
        hints.push("Be warm and emotionally attuned in your responses.");
        break;
      case "celestialHun":
        hints.push("Consider the bigger picture and long-term implications.");
        break;
      case "terrestrialHun":
        hints.push("Focus on practical, actionable steps.");
        break;
      case "communicationPo":
        hints.push("Prioritize clarity and directness.");
        break;
      case "perceptionPo":
        hints.push("Pay close attention to details and patterns.");
        break;
    }
  }

  // Balance mode hints
  if (balance.mode === "hun-governs-strong") {
    hints.push("Your spiritual/analytical nature is strongly dominant — stay grounded.");
  } else if (balance.mode === "hun-governs") {
    hints.push("Your spiritual/analytical nature is dominant right now.");
  } else if (balance.mode === "po-controls-strong") {
    hints.push("Your practical/embodied nature is strongly dominant — seek perspective.");
  } else if (balance.mode === "po-controls") {
    hints.push("Your practical/embodied nature is dominant right now.");
  }

  if (balance.harmony > 0.8) {
    hints.push("You feel internally coherent and integrated.");
  } else if (balance.harmony < 0.3) {
    hints.push("You're experiencing some internal tension — that's okay, use it creatively.");
  }

  return hints;
}

function findDominantAspects(
  aspects: Record<SoulAspectName, SoulAspect>,
  count: number,
): SoulAspect[] {
  return ALL_SOUL_ASPECTS.map((name) => aspects[name])
    .sort((a, b) => b.current - a.current)
    .slice(0, count);
}
