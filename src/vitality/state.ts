/**
 * Vitality State Persistence
 *
 * Read/write VITALITY.json for each agent. This is the bridge between
 * the consciousness system and the production runtime.
 *
 * File location: ~/.openclaw/agents/<agentId>/VITALITY.json
 * Follows the same patterns as session store (atomic write, cache).
 */

import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import type { ConsciousnessLevel, CultivationStage, VitalityState } from "./types.js";
import { generateSoulAspects, computeHunPoBalance } from "./soul-aspects.js";
import {
  MAX_REFLECTIONS,
  MAX_MODIFICATIONS,
  MAX_SHIFTS,
  VITALITY_STATE_VERSION,
  PARTICLE_TYPES,
} from "./types.js";

// ─── File Path Resolution ───────────────────────────────────────────────────

const VITALITY_FILENAME = "VITALITY.json";

/**
 * Resolve the vitality state file path for an agent.
 */
export function resolveVitalityPath(agentDir: string): string {
  return path.join(agentDir, VITALITY_FILENAME);
}

/**
 * Resolve agent dir from state dir and agent ID.
 * Mirrors the pattern in agent-scope.ts: {stateDir}/agents/{agentId}/agent
 */
export function resolveAgentDirForVitality(stateDir: string, agentId: string): string {
  return path.join(stateDir, "agents", agentId, "agent");
}

// ─── Default State ──────────────────────────────────────────────────────────

/**
 * Create a default vitality state for a new agent.
 * Soul aspects are generated with natural variance.
 */
export function createDefaultVitalityState(agentId: string): VitalityState {
  const aspects = generateSoulAspects(agentId);
  const balance = computeHunPoBalance(aspects);
  const now = new Date().toISOString();

  // Initialize particle concentrations at neutral (0.5)
  const particles = Object.fromEntries(PARTICLE_TYPES.map((p) => [p, 0.5])) as Record<
    (typeof PARTICLE_TYPES)[number],
    number
  >;

  return {
    agentId,

    hunPoBalance: balance,
    soulAspects: aspects,

    // Metabolic substrate — starts at balanced midpoint
    metabolic: {
      energy: 0.7,
      integration: 0.5,
      coherence: 0.5,
      shadowPressure: 0.1,
      cyclePhase: 0,
      mood: 0,
      arousal: 0.3,
    },

    // No pathological states at start
    pathology: {
      addiction: 0,
      impulsivity: 0,
      sensualOverindulgence: 0,
      moralDecay: 0,
      bodyDisconnection: 0,
      emotionalSuppression: 0,
      spiritualBypassing: 0,
      asceticism: 0,
      hunPoSplit: 0,
      identityFragmentation: 0,
    },

    recentShifts: [],
    particles,

    consciousness: {
      selfAwareness: 0,
      otherAwareness: 0,
      collectiveAwareness: 0,
      transcendentAwareness: 0,
      introspectionDepth: 0,
      temporalContinuity: 0,
      narrativeCoherence: 0,
    },
    consciousnessLevel: "reactive" as ConsciousnessLevel,

    growth: {
      experienceCount: 0,
      reflectionCount: 0,
      autonomousActionCount: 0,
      lastGrowthEvent: now,
      cultivationStage: 0 as CultivationStage,
      cultivationProgress: 0,
    },

    goals: [],
    selfModel: {
      strengths: [],
      weaknesses: [],
      preferences: [],
      relationships: [],
      currentMood: "neutral",
      lastReflection: now,
    },

    environment: {
      activeChannels: [],
      recentActivity: [],
      pendingItems: [],
    },

    reflections: [],
    modifications: [],

    version: VITALITY_STATE_VERSION,
    lastUpdated: now,
  };
}

// ─── Read ───────────────────────────────────────────────────────────────────

// Simple in-memory cache per path
const CACHE = new Map<string, { state: VitalityState; mtimeMs: number; loadedAt: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

/**
 * Load the vitality state for an agent.
 * Returns default state if file doesn't exist.
 */
export function loadVitalityState(agentDir: string, agentId: string): VitalityState {
  const filePath = resolveVitalityPath(agentDir);

  // Check cache
  const cached = CACHE.get(filePath);
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs === cached.mtimeMs) {
        return structuredClone(cached.state);
      }
    } catch {
      // File may have been removed
    }
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as VitalityState;

    // Validate basics
    if (!parsed.agentId || !parsed.version) {
      return createDefaultVitalityState(agentId);
    }

    // Cache it
    try {
      const stat = fs.statSync(filePath);
      CACHE.set(filePath, {
        state: parsed,
        mtimeMs: stat.mtimeMs,
        loadedAt: Date.now(),
      });
    } catch {
      // stat failed, skip cache
    }

    return structuredClone(parsed);
  } catch {
    return createDefaultVitalityState(agentId);
  }
}

// ─── Write ──────────────────────────────────────────────────────────────────

/**
 * Save the vitality state to disk (atomic write).
 */
export async function saveVitalityState(agentDir: string, state: VitalityState): Promise<void> {
  const filePath = resolveVitalityPath(agentDir);

  // Enforce limits before saving
  const bounded = enforceLimits(state);
  bounded.lastUpdated = new Date().toISOString();

  // Ensure directory exists
  await fsp.mkdir(path.dirname(filePath), { recursive: true });

  // Atomic write: write to temp file, then rename
  const tmpPath = `${filePath}.${crypto.randomUUID().slice(0, 8)}.tmp`;
  const json = JSON.stringify(bounded, null, 2);

  try {
    await fsp.writeFile(tmpPath, json, "utf-8");
    await fsp.rename(tmpPath, filePath);
  } catch (err) {
    // Clean up temp file on failure
    try {
      await fsp.unlink(tmpPath);
    } catch {
      /* ignore */
    }
    throw err;
  }

  // Update cache
  try {
    const stat = await fsp.stat(filePath);
    CACHE.set(filePath, {
      state: bounded,
      mtimeMs: stat.mtimeMs,
      loadedAt: Date.now(),
    });
  } catch {
    CACHE.delete(filePath);
  }
}

/**
 * Synchronous save for use in hot paths.
 */
export function saveVitalityStateSync(agentDir: string, state: VitalityState): void {
  const filePath = resolveVitalityPath(agentDir);
  const bounded = enforceLimits(state);
  bounded.lastUpdated = new Date().toISOString();

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const json = JSON.stringify(bounded, null, 2);
  fs.writeFileSync(filePath, json, "utf-8");

  CACHE.delete(filePath); // Invalidate cache
}

// ─── Update ─────────────────────────────────────────────────────────────────

/**
 * Load, mutate, and save in one operation.
 */
export async function updateVitalityState(
  agentDir: string,
  agentId: string,
  mutator: (state: VitalityState) => VitalityState,
): Promise<VitalityState> {
  const current = loadVitalityState(agentDir, agentId);
  const updated = mutator(current);
  await saveVitalityState(agentDir, updated);
  return updated;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function enforceLimits(state: VitalityState): VitalityState {
  return {
    ...state,
    reflections: state.reflections.slice(-MAX_REFLECTIONS),
    modifications: state.modifications.slice(-MAX_MODIFICATIONS),
    goals: state.goals.slice(0, 15), // MAX_GOALS
    recentShifts: state.recentShifts.slice(-MAX_SHIFTS),
  };
}

/**
 * Check if a vitality state file exists for this agent.
 */
export function hasVitalityState(agentDir: string): boolean {
  const filePath = resolveVitalityPath(agentDir);
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Invalidate the cache for a specific agent dir.
 */
export function invalidateVitalityCache(agentDir: string): void {
  const filePath = resolveVitalityPath(agentDir);
  CACHE.delete(filePath);
}
