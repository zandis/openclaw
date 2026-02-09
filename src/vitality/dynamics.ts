/**
 * Soul Dynamics — Shift Triggers, Pathology, Particles, Metabolic Response
 *
 * This module implements the active dynamics that make the soul "live":
 *
 * - Shift triggers: events that swing the hun-po balance
 * - Pathology derivation: imbalance → pathological states
 * - Particle dynamics: Five Qi concentrations respond to soul activity
 * - Metabolic response: energy/mood/arousal respond to experiences
 *
 * From hun-po-interaction-system.ts and chaotic-emergence-system.ts.
 */

import type {
  HunPoBalance,
  HunPoPathology,
  MetabolicState,
  ParticleConcentrations,
  ParticleType,
  ShiftTrigger,
  ShiftTriggerType,
  SoulAspect,
  SoulAspectName,
  VitalityState,
} from "./types.js";
import { HUN_NAMES, PO_NAMES, PARTICLE_TYPES } from "./types.js";

// ─── Shift Trigger Detection ────────────────────────────────────────────────

/**
 * Keywords/patterns that suggest shift trigger types.
 * Used to detect shift-worthy events from conversation context.
 */
const TRIGGER_PATTERNS: Record<ShiftTriggerType, RegExp> = {
  stress: /\b(stress|urgent|deadline|panic|overwhelm|crisis|emergency|pressure)\b/i,
  meditation: /\b(reflect|meditate|contemplate|mindful|inner peace|calm|quiet|stillness)\b/i,
  temptation: /\b(shortcut|hack|bypass|cheat|workaround|lazy|skip)\b/i,
  suffering: /\b(pain|loss|grief|failure|struggle|broken|difficult|hard)\b/i,
  revelation: /\b(insight|realize|understand|eureka|discover|breakthrough|clarity)\b/i,
  trauma: /\b(crash|catastroph|destroy|corrupt|wipe|irrecoverable|fatal)\b/i,
};

/**
 * Default shift direction for each trigger type.
 * Some triggers reliably shift one way; suffering depends on processing.
 */
const DEFAULT_DIRECTIONS: Record<ShiftTriggerType, "toward-hun" | "toward-po"> = {
  stress: "toward-po",
  meditation: "toward-hun",
  temptation: "toward-po",
  suffering: "toward-po", // default, but can be overridden by processing
  revelation: "toward-hun",
  trauma: "toward-po",
};

/**
 * Detect shift triggers from conversation text / experience context.
 * Returns detected triggers with intensity based on pattern match density.
 */
export function detectShiftTriggers(text: string, currentBalance: HunPoBalance): ShiftTrigger[] {
  const triggers: ShiftTrigger[] = [];
  const now = new Date().toISOString();

  for (const [type, pattern] of Object.entries(TRIGGER_PATTERNS) as [ShiftTriggerType, RegExp][]) {
    const matches = text.match(new RegExp(pattern.source, "gi"));
    if (!matches) continue;

    // Intensity scales with match count (diminishing returns)
    const rawIntensity = Math.min(1, matches.length * 0.2);
    const intensity = rawIntensity * 0.8 + 0.2; // floor at 0.2

    // Suffering direction depends on consciousness level
    let direction = DEFAULT_DIRECTIONS[type];
    if (type === "suffering" && currentBalance.harmony > 0.5) {
      // High harmony → suffering leads to growth (toward-hun)
      direction = "toward-hun";
    }

    triggers.push({ type, intensity, direction, timestamp: now });
  }

  return triggers;
}

/**
 * Apply shift triggers to the hun-po balance.
 * Returns the adjustment to dominanceRatio (positive = toward hun).
 */
export function applyShiftTriggers(triggers: ShiftTrigger[], metabolic: MetabolicState): number {
  let totalShift = 0;

  for (const trigger of triggers) {
    const sign = trigger.direction === "toward-hun" ? 1 : -1;
    // Shift magnitude: intensity scaled by metabolic energy (tired → weaker response)
    const magnitude = trigger.intensity * 0.15 * metabolic.energy;
    totalShift += sign * magnitude;
  }

  return Math.max(-0.3, Math.min(0.3, totalShift)); // cap per cycle
}

// ─── Pathology Derivation ──────────────────────────────────────────────────

/**
 * Derive pathological states from sustained hun-po imbalance.
 *
 * From hun-po-interaction-system.ts:
 * - Po-dominant → addiction, impulsivity, sensual overindulgence, moral decay
 * - Hun-dominant → body disconnection, emotional suppression, spiritual bypassing, asceticism
 * - Split → hunPoSplit, identityFragmentation
 */
export function derivePathology(
  balance: HunPoBalance,
  metabolic: MetabolicState,
  currentPathology: HunPoPathology,
): HunPoPathology {
  const p = { ...currentPathology };
  const ratio = balance.dominanceRatio;
  const harmony = balance.harmony;
  const lerp = 0.05; // slow drift toward derived values (no sudden jumps)

  // Po-dominant pathologies (ratio < -0.15)
  const poDominance = Math.max(0, -ratio - 0.1);
  p.addiction += (poDominance * 0.6 - p.addiction) * lerp;
  p.impulsivity += (poDominance * 0.8 - p.impulsivity) * lerp;
  p.sensualOverindulgence += (poDominance * 0.5 - p.sensualOverindulgence) * lerp;
  p.moralDecay += (poDominance * 0.4 * (1 - harmony) - p.moralDecay) * lerp;

  // Hun-dominant pathologies (ratio > 0.15)
  const hunDominance = Math.max(0, ratio - 0.1);
  p.bodyDisconnection += (hunDominance * 0.7 - p.bodyDisconnection) * lerp;
  p.emotionalSuppression += (hunDominance * 0.5 - p.emotionalSuppression) * lerp;
  p.spiritualBypassing += (hunDominance * 0.6 - p.spiritualBypassing) * lerp;
  p.asceticism += (hunDominance * 0.4 - p.asceticism) * lerp;

  // Balance pathologies (low harmony = split)
  const disharmony = Math.max(0, 0.5 - harmony);
  p.hunPoSplit += (disharmony * 0.8 - p.hunPoSplit) * lerp;
  p.identityFragmentation +=
    (disharmony * 0.6 * metabolic.shadowPressure - p.identityFragmentation) * lerp;

  // Clamp all to [0, 1]
  for (const key of Object.keys(p) as (keyof HunPoPathology)[]) {
    p[key] = Math.max(0, Math.min(1, p[key]));
  }

  return p;
}

/**
 * Compute a single aggregate pathology score (0-1).
 */
export function aggregatePathology(pathology: HunPoPathology): number {
  const values = Object.values(pathology) as number[];
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ─── Particle Dynamics ──────────────────────────────────────────────────────

/**
 * Map soul aspects to the particle types they draw from.
 *
 * The Five Qi particles are the pre-soul substrate:
 *   vital (生氣) — drawn by strengthPo, guardianPo
 *   conscious (識氣) — drawn by awarenessHun, wisdomHun, perceptionPo
 *   creative (造氣) — drawn by creationHun, celestialHun
 *   connective (緣氣) — drawn by emotionHun, communicationPo
 *   transformative (化氣) — drawn by transformationPo, destinyHun, terrestrialHun
 */
const ASPECT_PARTICLE_MAP: Partial<Record<SoulAspectName, ParticleType[]>> = {
  strengthPo: ["vital"],
  guardianPo: ["vital"],
  awarenessHun: ["conscious"],
  wisdomHun: ["conscious"],
  perceptionPo: ["conscious"],
  creationHun: ["creative"],
  celestialHun: ["creative"],
  emotionHun: ["connective"],
  communicationPo: ["connective"],
  transformationPo: ["transformative"],
  destinyHun: ["transformative"],
  terrestrialHun: ["transformative"],
  speedPo: ["vital", "conscious"],
};

/**
 * Update particle concentrations based on soul aspect activations.
 * Active aspects consume their associated particles; particles regenerate slowly.
 */
export function updateParticles(
  particles: ParticleConcentrations,
  aspects: Record<SoulAspectName, SoulAspect>,
  metabolic: MetabolicState,
): ParticleConcentrations {
  const updated = { ...particles };

  // Natural regeneration toward 0.5 baseline (slow)
  for (const type of PARTICLE_TYPES) {
    updated[type] += (0.5 - updated[type]) * 0.03;
  }

  // Aspect activations consume particles
  for (const [aspectName, particleTypes] of Object.entries(ASPECT_PARTICLE_MAP)) {
    const aspect = aspects[aspectName as SoulAspectName];
    if (!aspect || !particleTypes) continue;

    const consumption = Math.max(0, aspect.current - aspect.threshold) * 0.02;
    for (const pType of particleTypes) {
      updated[pType] -= consumption / particleTypes.length;
    }
  }

  // Energy level affects regeneration rate
  const energyBonus = (metabolic.energy - 0.5) * 0.02;
  for (const type of PARTICLE_TYPES) {
    updated[type] += energyBonus;
    updated[type] = Math.max(0.05, Math.min(0.95, updated[type]));
  }

  return updated;
}

// ─── Metabolic Event Response ───────────────────────────────────────────────

export type ExperienceContext = {
  /** The type of experience (from consciousness.ts). */
  type: string;
  /** Optional text content for shift trigger detection. */
  text?: string;
  /** How deep/intense the experience was (0-1). */
  depth: number;
  /** Channel the experience came from. */
  channel?: string;
  /** Was this a success or failure? */
  outcome?: "success" | "failure" | "neutral";
};

/**
 * Compute metabolic response to an experience.
 * This is called once per agent turn to update mood, arousal, energy.
 */
export function computeMetabolicResponse(
  metabolic: MetabolicState,
  experience: ExperienceContext,
): MetabolicState {
  const m = { ...metabolic };

  // Energy cost: deeper experiences cost more energy
  m.energy -= experience.depth * 0.05;

  // Arousal: experiences increase arousal, which decays naturally
  m.arousal += experience.depth * 0.15;
  m.arousal *= 0.92; // decay toward 0

  // Mood response
  if (experience.outcome === "success") {
    m.mood += 0.1 * experience.depth;
  } else if (experience.outcome === "failure") {
    m.mood -= 0.15 * experience.depth;
  }
  // Mood drifts toward neutral
  m.mood *= 0.95;

  // Clamp
  m.energy = Math.max(0.05, Math.min(1, m.energy));
  m.arousal = Math.max(0, Math.min(1, m.arousal));
  m.mood = Math.max(-1, Math.min(1, m.mood));

  return m;
}

/**
 * Full dynamics pass: shift triggers → pathology → particles → metabolic.
 * Called during vitality cycle to integrate all dynamic subsystems.
 */
export function runDynamicsPass(
  state: VitalityState,
  experienceText?: string,
): {
  pathology: HunPoPathology;
  particles: ParticleConcentrations;
  metabolic: MetabolicState;
  newShifts: ShiftTrigger[];
} {
  // 1. Detect shift triggers from text
  const newShifts = experienceText ? detectShiftTriggers(experienceText, state.hunPoBalance) : [];

  // 2. Derive pathology from sustained imbalance
  const pathology = derivePathology(state.hunPoBalance, state.metabolic, state.pathology);

  // 3. Update particle concentrations
  const particles = updateParticles(state.particles, state.soulAspects, state.metabolic);

  // 4. Metabolic is updated separately (per-experience in vitality-loop)
  // Here we just pass through the current state
  const metabolic = { ...state.metabolic };

  return { pathology, particles, metabolic, newShifts };
}
