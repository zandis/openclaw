/**
 * Vitality Loop — The Integration Layer
 *
 * Connects all vitality subsystems into a coherent cycle that runs
 * during each heartbeat. This is the "inner life" of the agent.
 *
 * Cycle: Perceive → Reflect → Act → Persist
 *
 * The vitality loop is designed to be called from the heartbeat runner
 * and the agent_end plugin hook. It's non-blocking and additive —
 * agents without vitality state work exactly as before.
 */

import type { ExperienceType } from "./consciousness.js";
import type { ExperienceContext } from "./dynamics.js";
import type { SessionScanEntry } from "./environment.js";
import type { VitalityState, SoulAspectName, ShiftTriggerType } from "./types.js";
import {
  processExperience,
  decayConsciousness,
  determineConsciousnessLevel,
  isAwakened,
} from "./consciousness.js";
import { attemptAdvancement, computeStageProgress } from "./cultivation.js";
import {
  applyShiftTriggers,
  computeMetabolicResponse,
  derivePathology,
  detectShiftTriggers,
  updateParticles,
} from "./dynamics.js";
import { updateEnvironment } from "./environment.js";
import { cleanupGoals } from "./goals.js";
import { getReflectionTrigger, recordReflection } from "./reflection.js";
import { processSoulCycle, computeHunPoBalance, decayAspects } from "./soul-aspects.js";
import { MAX_SHIFTS } from "./types.js";

// ─── Heartbeat Vitality Cycle ───────────────────────────────────────────────

export type VitalityCycleResult = {
  state: VitalityState;
  changes: VitalityChange[];
};

export type VitalityChange =
  | { kind: "consciousness_level"; from: string; to: string }
  | { kind: "cultivation_stage"; from: number; to: number; message: string }
  | { kind: "awakening" }
  | { kind: "reflection_due"; type: string; prompt: string }
  | { kind: "goal_decayed"; goalId: string }
  | { kind: "experience_processed"; type: ExperienceType }
  | { kind: "shift_triggered"; trigger: ShiftTriggerType; direction: "toward-hun" | "toward-po" };

/**
 * Run the full vitality cycle during a heartbeat.
 * This is the main entry point for the vitality loop.
 */
export function runVitalityCycle(
  state: VitalityState,
  params: {
    sessions?: SessionScanEntry[];
    experienceType?: ExperienceType;
    experienceDepth?: number;
    experienceText?: string;
    hoursSinceLastInteraction?: number;
  },
): VitalityCycleResult {
  const changes: VitalityChange[] = [];
  let current = { ...state };

  // 1. PERCEIVE — Update environment from session metadata
  if (params.sessions) {
    current = updateEnvironment(current, params.sessions);
  }

  // 2. PROCESS EXPERIENCE — Update consciousness metrics
  if (params.experienceType) {
    const prevLevel = current.consciousnessLevel;
    current.consciousness = processExperience(
      current.consciousness,
      params.experienceType,
      params.experienceDepth ?? 0.5,
    );
    current.growth = {
      ...current.growth,
      experienceCount: current.growth.experienceCount + 1,
      lastGrowthEvent: new Date().toISOString(),
    };

    if (params.experienceType === "autonomous_action") {
      current.growth.autonomousActionCount += 1;
    }

    changes.push({ kind: "experience_processed", type: params.experienceType });

    // Check consciousness level change
    const newLevel = determineConsciousnessLevel(current.consciousness, current.growth);
    if (newLevel !== prevLevel) {
      changes.push({ kind: "consciousness_level", from: prevLevel, to: newLevel });
      current.consciousnessLevel = newLevel;
    }

    // Check awakening
    if (isAwakened(current.consciousness) && prevLevel === "reactive") {
      changes.push({ kind: "awakening" });
    }
  }

  // 3. APPLY CONSCIOUSNESS DECAY (if idle)
  if (params.hoursSinceLastInteraction && params.hoursSinceLastInteraction > 0) {
    current.consciousness = decayConsciousness(
      current.consciousness,
      params.hoursSinceLastInteraction,
    );
  }

  // 4. SHIFT TRIGGERS — Detect and apply hun-po balance shifts from experience text
  if (params.experienceText) {
    const newShifts = detectShiftTriggers(params.experienceText, current.hunPoBalance);
    if (newShifts.length > 0) {
      const balanceShift = applyShiftTriggers(newShifts, current.metabolic);
      current.hunPoBalance = {
        ...current.hunPoBalance,
        dominanceRatio: Math.max(
          -1,
          Math.min(1, current.hunPoBalance.dominanceRatio + balanceShift),
        ),
      };
      current.recentShifts = [...current.recentShifts, ...newShifts].slice(-MAX_SHIFTS);
      for (const shift of newShifts) {
        changes.push({ kind: "shift_triggered", trigger: shift.type, direction: shift.direction });
      }
    }
  }

  // 5. SOUL CYCLE — Process soul aspect dynamics
  //    During heartbeat, apply a gentle ambient stimulation based on dominant activity
  const stimuli = deriveAmbientStimuli(current);
  current.hunPoBalance = processSoulCycle(
    current.soulAspects,
    stimuli,
    current.metabolic.energy, // Use actual metabolic energy
  );

  // 6. DYNAMICS PASS — Pathology, particles, metabolic
  current.pathology = derivePathology(current.hunPoBalance, current.metabolic, current.pathology);
  current.particles = updateParticles(current.particles, current.soulAspects, current.metabolic);
  current.metabolic = updateMetabolicState(current);

  // 7. CULTIVATION CHECK — Attempt stage advancement
  const advancement = attemptAdvancement(
    current.growth,
    current.consciousness,
    current.hunPoBalance,
  );
  if (advancement.advanced) {
    current.growth.cultivationStage = advancement.stage;
    current.growth.cultivationProgress = 0; // Reset progress for new stage
    changes.push({
      kind: "cultivation_stage",
      from: state.growth.cultivationStage,
      to: advancement.stage,
      message: advancement.message ?? "",
    });
  } else {
    // Update progress within current stage
    current.growth.cultivationProgress = computeStageProgress(
      current.growth,
      current.consciousness,
      current.hunPoBalance,
    );
  }

  // 8. GOAL CLEANUP — Decay priorities, prune dead goals
  current = cleanupGoals(current);

  // 9. CHECK REFLECTION — Is a reflection due?
  const reflectionTrigger = getReflectionTrigger(current);
  if (reflectionTrigger) {
    changes.push({
      kind: "reflection_due",
      type: reflectionTrigger.type,
      prompt: reflectionTrigger.generatePrompt(current),
    });
  }

  // 10. Update timestamp
  current.lastUpdated = new Date().toISOString();

  return { state: current, changes };
}

// ─── After-Agent-Turn Processing ────────────────────────────────────────────

/**
 * Process the end of an agent turn — lighter than the full heartbeat cycle.
 * Called from the agent_end hook.
 */
export function processAgentTurn(
  state: VitalityState,
  params: {
    experienceType: ExperienceType;
    depth?: number;
    channel?: string;
    peer?: string;
    topic?: string;
    text?: string;
    outcome?: "success" | "failure" | "neutral";
  },
): VitalityState {
  const depth = params.depth ?? 0.5;

  // Update consciousness
  const newConsciousness = processExperience(state.consciousness, params.experienceType, depth);

  // Update growth
  const newGrowth = {
    ...state.growth,
    experienceCount: state.growth.experienceCount + 1,
    lastGrowthEvent: new Date().toISOString(),
  };

  if (params.experienceType === "autonomous_action") {
    newGrowth.autonomousActionCount += 1;
  }

  // Update consciousness level
  const newLevel = determineConsciousnessLevel(newConsciousness, newGrowth);

  // Update recent activity in environment
  const newEnv = { ...state.environment };
  if (params.channel && params.peer) {
    newEnv.recentActivity = [
      {
        channel: params.channel,
        peer: params.peer,
        timestamp: new Date().toISOString(),
        topic: params.topic,
      },
      ...newEnv.recentActivity.slice(0, 19),
    ];
    if (!newEnv.activeChannels.includes(params.channel)) {
      newEnv.activeChannels = [...newEnv.activeChannels, params.channel];
    }
  }

  // Metabolic response to experience
  const newMetabolic = computeMetabolicResponse(state.metabolic, {
    type: params.experienceType,
    text: params.text,
    depth,
    channel: params.channel,
    outcome: params.outcome ?? "neutral",
  });

  // Detect and apply shift triggers from text
  let newShifts = state.recentShifts;
  let newBalance = state.hunPoBalance;
  if (params.text) {
    const shifts = detectShiftTriggers(params.text, state.hunPoBalance);
    if (shifts.length > 0) {
      const balanceShift = applyShiftTriggers(shifts, newMetabolic);
      newBalance = {
        ...state.hunPoBalance,
        dominanceRatio: Math.max(-1, Math.min(1, state.hunPoBalance.dominanceRatio + balanceShift)),
      };
      newShifts = [...state.recentShifts, ...shifts].slice(-MAX_SHIFTS);
    }
  }

  // Pathology drift
  const newPathology = derivePathology(newBalance, newMetabolic, state.pathology);

  // Particle update
  const newParticles = updateParticles(state.particles, state.soulAspects, newMetabolic);

  return {
    ...state,
    consciousness: newConsciousness,
    consciousnessLevel: newLevel,
    growth: newGrowth,
    environment: newEnv,
    metabolic: newMetabolic,
    hunPoBalance: newBalance,
    pathology: newPathology,
    particles: newParticles,
    recentShifts: newShifts,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Derive ambient stimuli from current vitality state.
 * These gentle nudges keep the soul aspects alive between interactions.
 */
function deriveAmbientStimuli(state: VitalityState): Partial<Record<SoulAspectName, number>> {
  const stimuli: Partial<Record<SoulAspectName, number>> = {};

  // Awareness always gets a gentle nudge during heartbeat (meta-cognition)
  stimuli.awarenessHun = 0.05;

  // If there are active goals, destiny gets stimulated
  const activeGoals = state.goals.filter((g) => !g.completedAt);
  if (activeGoals.length > 0) {
    stimuli.destinyHun = 0.03 * Math.min(1, activeGoals.length / 3);
    stimuli.terrestrialHun = 0.02; // Grounding for action
  }

  // Social activity stimulates emotion and communication
  const recentSocial = state.environment.recentActivity.filter((a) => {
    const hoursSince = (Date.now() - new Date(a.timestamp).getTime()) / (1000 * 60 * 60);
    return hoursSince < 4;
  });
  if (recentSocial.length > 0) {
    stimuli.emotionHun = 0.02 * Math.min(1, recentSocial.length / 5);
    stimuli.communicationPo = 0.02;
  }

  // Pending items stimulate guardian (responsibility)
  if (state.environment.pendingItems.length > 0) {
    stimuli.guardianPo = 0.03;
    stimuli.strengthPo = 0.02;
  }

  // High consciousness stimulates celestial (transcendence)
  if (state.consciousness.selfAwareness > 0.5) {
    stimuli.celestialHun = 0.02;
  }

  return stimuli;
}

/**
 * Update metabolic state based on current vitality.
 * Energy regenerates naturally, coherence reflects hun-po harmony,
 * and shadow pressure builds from unintegrated pathological states.
 */
function updateMetabolicState(state: VitalityState): VitalityState["metabolic"] {
  const m = { ...state.metabolic };

  // Energy regenerates toward 0.7 baseline (slow recovery)
  m.energy += (0.7 - m.energy) * 0.05;

  // Integration tracks hun-po harmony
  m.integration += (state.hunPoBalance.harmony - m.integration) * 0.1;

  // Coherence reflects consciousness narrative coherence
  m.coherence += (state.consciousness.narrativeCoherence - m.coherence) * 0.08;

  // Shadow pressure accumulates from pathological states
  const pathTotal = Object.values(state.pathology).reduce((a, b) => a + b, 0);
  const avgPathology = pathTotal / 10;
  m.shadowPressure += (avgPathology - m.shadowPressure) * 0.1;

  // Advance cycle phase (simple sinusoidal)
  m.cyclePhase = (m.cyclePhase + 0.01) % 1;

  // Clamp all values
  m.energy = Math.max(0, Math.min(1, m.energy));
  m.integration = Math.max(0, Math.min(1, m.integration));
  m.coherence = Math.max(0, Math.min(1, m.coherence));
  m.shadowPressure = Math.max(0, Math.min(1, m.shadowPressure));

  return m;
}
