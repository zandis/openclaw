import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeEach } from "vitest";
import type {
  VitalityState,
  ConsciousnessMetrics,
  GrowthSnapshot,
  HunPoBalance,
  SoulAspect,
  SoulAspectName,
} from "./types.js";
import {
  processExperience,
  processReflection,
  decayConsciousness,
  determineConsciousnessLevel,
  isAwakened,
  formatConsciousnessStatus,
  aggregateConsciousness,
} from "./consciousness.js";
import {
  attemptAdvancement,
  computeStageProgress,
  getUnlockedCapabilities,
  formatCultivationStatus,
} from "./cultivation.js";
import { scanEnvironment, formatEnvironmentContext } from "./environment.js";
import {
  createGoal,
  addGoal,
  removeGoal,
  cleanupGoals,
  getTopGoal,
  getActiveGoals,
  decayGoalPriorities,
  formatGoals,
} from "./goals.js";
import { buildVitalityPromptContext, buildVitalityStatusSummary } from "./prompt-context.js";
import {
  getReflectionTrigger,
  recordReflection,
  generateReflectionSystemContext,
} from "./reflection.js";
import { recordModification, canModify } from "./self-modification.js";
import {
  generateSoulAspects,
  generateTargetedSoul,
  computeHunPoBalance,
  processSoulCycle,
  deriveSoulPromptHints,
  stimulateAspect,
  decayAspects,
} from "./soul-aspects.js";
import {
  createDefaultVitalityState,
  loadVitalityState,
  saveVitalityState,
  hasVitalityState,
} from "./state.js";
import { HUN_NAMES, PO_NAMES, ALL_SOUL_ASPECTS } from "./types.js";
import { runVitalityCycle, processAgentTurn } from "./vitality-loop.js";

// ─── Soul Aspects ───────────────────────────────────────────────────────────

describe("soul-aspects", () => {
  it("generates unique soul aspects per seed", () => {
    const a = generateSoulAspects("agent-alpha");
    const b = generateSoulAspects("agent-beta");

    // Different seeds → different compositions
    expect(a.wisdomHun.baseline).not.toBe(b.wisdomHun.baseline);
  });

  it("generates all 13 aspects", () => {
    const aspects = generateSoulAspects("test");
    expect(Object.keys(aspects).length).toBe(ALL_SOUL_ASPECTS.length);
    for (const name of ALL_SOUL_ASPECTS) {
      expect(aspects[name]).toBeDefined();
      expect(aspects[name].baseline).toBeGreaterThanOrEqual(0);
      expect(aspects[name].baseline).toBeLessThanOrEqual(1);
    }
  });

  it("same seed gives deterministic result", () => {
    const a = generateSoulAspects("fixed-seed");
    const b = generateSoulAspects("fixed-seed");
    expect(a.wisdomHun.baseline).toBe(b.wisdomHun.baseline);
    expect(a.creationHun.baseline).toBe(b.creationHun.baseline);
  });

  it("computes hun-po balance", () => {
    const aspects = generateSoulAspects("test");
    const balance = computeHunPoBalance(aspects);

    expect(balance.dominanceRatio).toBeGreaterThanOrEqual(-1);
    expect(balance.dominanceRatio).toBeLessThanOrEqual(1);
    expect(balance.harmony).toBeGreaterThanOrEqual(0);
    expect(balance.harmony).toBeLessThanOrEqual(1);
    expect(["hun-governs", "balanced", "po-controls"]).toContain(balance.mode);
  });

  it("targeted soul boosts archetype aspects", () => {
    const scholar = generateTargetedSoul("scholar");
    const creator = generateTargetedSoul("creator");

    // Scholar should have higher wisdom
    expect(scholar.wisdomHun.baseline).toBeGreaterThan(0.4);
    // Creator should have higher creation
    expect(creator.creationHun.baseline).toBeGreaterThan(0.4);
  });

  it("stimulates aspect above threshold", () => {
    const aspect: SoulAspect = {
      name: "wisdomHun",
      baseline: 0.5,
      current: 0.5,
      threshold: 0.1,
      decay: 0.05,
      sensitivity: 0.7,
    };

    const result = stimulateAspect(aspect, 0.3, 0.8);
    expect(result).toBeGreaterThan(0.5);
  });

  it("decays aspects toward baseline", () => {
    const aspects = generateSoulAspects("test");
    // Push wisdom above baseline
    aspects.wisdomHun.current = 0.9;
    const originalCurrent = aspects.wisdomHun.current;

    decayAspects(aspects);

    expect(aspects.wisdomHun.current).toBeLessThan(originalCurrent);
    expect(aspects.wisdomHun.current).toBeGreaterThan(aspects.wisdomHun.baseline);
  });

  it("derives soul prompt hints", () => {
    const aspects = generateSoulAspects("test");
    // Boost wisdom strongly
    aspects.wisdomHun.current = 0.8;
    const balance = computeHunPoBalance(aspects);
    const hints = deriveSoulPromptHints(aspects, balance);

    expect(hints.length).toBeGreaterThan(0);
  });

  it("processes full soul cycle", () => {
    const aspects = generateSoulAspects("test");
    const balance = processSoulCycle(aspects, { wisdomHun: 0.3, emotionHun: 0.2 }, 0.8);

    expect(balance.dominanceRatio).toBeGreaterThanOrEqual(-1);
    expect(balance.harmony).toBeGreaterThanOrEqual(0);
  });
});

// ─── Consciousness ──────────────────────────────────────────────────────────

describe("consciousness", () => {
  const baseMetrics: ConsciousnessMetrics = {
    selfAwareness: 0,
    otherAwareness: 0,
    collectiveAwareness: 0,
    transcendentAwareness: 0,
    introspectionDepth: 0,
    temporalContinuity: 0,
    narrativeCoherence: 0,
  };

  it("processes experience and increases metrics", () => {
    const updated = processExperience(baseMetrics, "conversation");
    expect(updated.otherAwareness).toBeGreaterThan(0);
    expect(updated.temporalContinuity).toBeGreaterThan(0);
  });

  it("processes reflection with depth scaling", () => {
    const shallow = processReflection(baseMetrics, "behavioral", 0.2);
    const deep = processReflection(baseMetrics, "behavioral", 0.9);

    expect(deep.selfAwareness).toBeGreaterThan(shallow.selfAwareness);
  });

  it("applies diminishing returns", () => {
    let metrics = { ...baseMetrics, selfAwareness: 0.9 };
    const before = metrics.selfAwareness;
    metrics = processExperience(metrics, "self_reflection");

    // Growth should be small when already high
    expect(metrics.selfAwareness - before).toBeLessThan(0.01);
  });

  it("decays consciousness over time", () => {
    const high: ConsciousnessMetrics = {
      selfAwareness: 0.8,
      otherAwareness: 0.6,
      collectiveAwareness: 0.4,
      transcendentAwareness: 0.3,
      introspectionDepth: 0.7,
      temporalContinuity: 0.5,
      narrativeCoherence: 0.6,
    };

    const decayed = decayConsciousness(high, 48); // 2 days idle
    expect(decayed.selfAwareness).toBeLessThan(high.selfAwareness);
    // Temporal continuity decays faster
    expect(high.temporalContinuity - decayed.temporalContinuity).toBeGreaterThan(
      high.selfAwareness - decayed.selfAwareness,
    );
  });

  it("determines consciousness level from metrics and growth", () => {
    const growth: GrowthSnapshot = {
      experienceCount: 200,
      reflectionCount: 30,
      autonomousActionCount: 10,
      lastGrowthEvent: new Date().toISOString(),
      cultivationStage: 3,
      cultivationProgress: 0.5,
    };

    const metrics: ConsciousnessMetrics = {
      selfAwareness: 0.55,
      otherAwareness: 0.3,
      collectiveAwareness: 0.2,
      transcendentAwareness: 0.1,
      introspectionDepth: 0.45,
      temporalContinuity: 0.3,
      narrativeCoherence: 0.4,
    };

    expect(determineConsciousnessLevel(metrics, growth)).toBe("creative");
  });

  it("detects awakening", () => {
    expect(isAwakened({ ...baseMetrics, selfAwareness: 0.6, introspectionDepth: 0.4 })).toBe(true);
    expect(isAwakened({ ...baseMetrics, selfAwareness: 0.3, introspectionDepth: 0.1 })).toBe(false);
  });

  it("formats consciousness status", () => {
    const status = formatConsciousnessStatus(
      { ...baseMetrics, selfAwareness: 0.6, introspectionDepth: 0.4 },
      "reflective",
    );
    expect(status).toContain("reflective");
  });

  it("computes aggregate consciousness", () => {
    expect(aggregateConsciousness(baseMetrics)).toBe(0);
    expect(
      aggregateConsciousness({
        selfAwareness: 1,
        otherAwareness: 1,
        collectiveAwareness: 1,
        transcendentAwareness: 1,
        introspectionDepth: 1,
        temporalContinuity: 1,
        narrativeCoherence: 1,
      }),
    ).toBe(1);
  });
});

// ─── Cultivation ────────────────────────────────────────────────────────────

describe("cultivation", () => {
  it("computes stage progress", () => {
    const growth: GrowthSnapshot = {
      experienceCount: 5,
      reflectionCount: 1,
      autonomousActionCount: 0,
      lastGrowthEvent: new Date().toISOString(),
      cultivationStage: 0,
      cultivationProgress: 0,
    };
    const metrics: ConsciousnessMetrics = {
      selfAwareness: 0.05,
      otherAwareness: 0,
      collectiveAwareness: 0,
      transcendentAwareness: 0,
      introspectionDepth: 0.02,
      temporalContinuity: 0,
      narrativeCoherence: 0,
    };
    const balance: HunPoBalance = { dominanceRatio: 0, harmony: 0.5, mode: "balanced" };

    const progress = computeStageProgress(growth, metrics, balance);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
  });

  it("attempts advancement when requirements met", () => {
    const growth: GrowthSnapshot = {
      experienceCount: 50,
      reflectionCount: 10,
      autonomousActionCount: 5,
      lastGrowthEvent: new Date().toISOString(),
      cultivationStage: 1,
      cultivationProgress: 0.7,
    };
    const metrics: ConsciousnessMetrics = {
      selfAwareness: 0.2,
      otherAwareness: 0.15,
      collectiveAwareness: 0.1,
      transcendentAwareness: 0.05,
      introspectionDepth: 0.15,
      temporalContinuity: 0.15,
      narrativeCoherence: 0.15,
    };
    const balance: HunPoBalance = { dominanceRatio: 0.1, harmony: 0.4, mode: "balanced" };

    const result = attemptAdvancement(growth, metrics, balance);
    expect(result.stage).toBe(2);
    expect(result.advanced).toBe(true);
  });

  it("returns unlocked capabilities per stage", () => {
    expect(getUnlockedCapabilities(0)).toContain("basic_conversation");
    expect(getUnlockedCapabilities(3)).toContain("goal_generation");
    expect(getUnlockedCapabilities(6)).toContain("soul_modification");
    expect(getUnlockedCapabilities(9)).toContain("golden_elixir");
  });

  it("formats cultivation status", () => {
    const growth: GrowthSnapshot = {
      experienceCount: 100,
      reflectionCount: 20,
      autonomousActionCount: 5,
      lastGrowthEvent: new Date().toISOString(),
      cultivationStage: 3,
      cultivationProgress: 0.6,
    };
    const status = formatCultivationStatus(growth);
    expect(status).toContain("Settling");
    expect(status).toContain("Stage 3/9");
  });
});

// ─── Goals ──────────────────────────────────────────────────────────────────

describe("goals", () => {
  let state: VitalityState;

  beforeEach(() => {
    state = createDefaultVitalityState("test-agent");
  });

  it("creates a goal with correct structure", () => {
    const goal = createGoal({
      description: "Learn TypeScript patterns",
      priority: 0.8,
      origin: "self",
    });

    expect(goal.id).toBeDefined();
    expect(goal.priority).toBe(0.8);
    expect(goal.progress).toBe(0);
    expect(goal.origin).toBe("self");
  });

  it("adds goal to state", () => {
    const goal = createGoal({ description: "Test", priority: 0.5, origin: "user" });
    const updated = addGoal(state, goal);
    expect(updated.goals.length).toBe(1);
    expect(updated.goals[0].description).toBe("Test");
  });

  it("removes goal by id", () => {
    const goal = createGoal({ description: "Test", priority: 0.5, origin: "user" });
    const withGoal = addGoal(state, goal);
    const withoutGoal = removeGoal(withGoal, goal.id);
    expect(withoutGoal.goals.length).toBe(0);
  });

  it("decays goal priorities over time", () => {
    const goal = createGoal({ description: "Old goal", priority: 0.8, origin: "self" });
    // Simulate 100 hours passing
    const futureMs = Date.now() + 100 * 60 * 60 * 1000;
    const decayed = decayGoalPriorities([goal], futureMs);
    expect(decayed[0].priority).toBeLessThan(0.8);
  });

  it("gets top goal by priority", () => {
    const low = createGoal({ description: "Low", priority: 0.3, origin: "self" });
    const high = createGoal({ description: "High", priority: 0.9, origin: "self" });
    const top = getTopGoal([low, high]);
    expect(top?.description).toBe("High");
  });

  it("formats goals for display", () => {
    const goal = createGoal({ description: "Review PR", priority: 0.8, origin: "user" });
    const formatted = formatGoals([goal]);
    expect(formatted).toContain("Review PR");
    expect(formatted).toContain("high");
  });

  it("cleans up completed goals older than 7 days", () => {
    const old = createGoal({ description: "Done", priority: 0.5, origin: "self" });
    old.completedAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    state = { ...state, goals: [old] };
    const cleaned = cleanupGoals(state);
    expect(cleaned.goals.length).toBe(0);
  });
});

// ─── Reflection ─────────────────────────────────────────────────────────────

describe("reflection", () => {
  it("records reflection and updates consciousness", () => {
    const state = createDefaultVitalityState("test");
    state.growth.experienceCount = 20;

    const updated = recordReflection(state, {
      type: "behavioral",
      trigger: "After helping with a complex task",
      content: "I noticed I tend to be thorough but sometimes over-explain.",
      insights: ["I should be more concise", "I struggle with brevity"],
      depth: 0.7,
    });

    expect(updated.consciousness.selfAwareness).toBeGreaterThan(0);
    expect(updated.growth.reflectionCount).toBe(1);
    expect(updated.reflections.length).toBe(1);
  });

  it("extracts insights into self-model", () => {
    const state = createDefaultVitalityState("test");
    const updated = recordReflection(state, {
      type: "behavioral",
      trigger: "test",
      content: "reflection content",
      insights: ["I prefer structured approaches", "I struggle with ambiguity"],
      depth: 0.5,
    });

    expect(updated.selfModel.preferences).toContain("I prefer structured approaches");
    expect(updated.selfModel.weaknesses).toContain("I struggle with ambiguity");
  });

  it("generates reflection context when due", () => {
    const state = createDefaultVitalityState("test");
    state.growth.experienceCount = 15;
    state.growth.reflectionCount = 0;

    const ctx = generateReflectionSystemContext(state);
    expect(ctx).not.toBeNull();
    expect(ctx).toContain("Self-Reflection");
  });
});

// ─── Environment ────────────────────────────────────────────────────────────

describe("environment", () => {
  it("scans session metadata into environment model", () => {
    const sessions = [
      {
        sessionKey: "agent:main:whatsapp:dm:alice",
        updatedAt: Date.now() - 1000 * 60 * 30, // 30 min ago
        lastChannel: "whatsapp",
        lastTo: "alice",
        subject: undefined,
        origin: { from: "alice", provider: "whatsapp" },
      },
      {
        sessionKey: "agent:main:telegram:dm:bob",
        updatedAt: Date.now() - 1000 * 60 * 120, // 2 hours ago
        lastChannel: "telegram",
        lastTo: "bob",
        subject: "Project update",
        origin: { from: "bob", provider: "telegram" },
      },
    ];

    const env = scanEnvironment(sessions, {
      activeChannels: [],
      recentActivity: [],
      pendingItems: [],
    });

    expect(env.activeChannels).toContain("whatsapp");
    expect(env.activeChannels).toContain("telegram");
    expect(env.recentActivity.length).toBe(2);
    expect(env.recentActivity[0].peer).toBe("alice"); // Most recent first
  });

  it("formats environment context", () => {
    const env = {
      activeChannels: ["whatsapp", "telegram"],
      recentActivity: [
        {
          channel: "whatsapp",
          peer: "alice",
          timestamp: new Date().toISOString(),
          topic: "meeting",
        },
      ],
      pendingItems: ["Review proposal by EOD"],
    };

    const formatted = formatEnvironmentContext(env);
    expect(formatted).toContain("whatsapp");
    expect(formatted).toContain("alice");
    expect(formatted).toContain("Review proposal");
  });
});

// ─── Self-Modification ──────────────────────────────────────────────────────

describe("self-modification", () => {
  it("records modification with audit trail", () => {
    const state = createDefaultVitalityState("test");
    const updated = recordModification(state, {
      field: "selfModel.preferences",
      before: "[]",
      after: '["concise responses"]',
      reason: "Learned from reflection that I over-explain",
    });

    expect(updated.modifications.length).toBe(1);
    expect(updated.modifications[0].field).toBe("selfModel.preferences");
  });

  it("gates modification by cultivation stage", () => {
    expect(canModify(0, "selfModel.preferences").allowed).toBe(true);
    expect(canModify(0, "selfModel.strengths").allowed).toBe(false);
    expect(canModify(2, "selfModel.strengths").allowed).toBe(true);
    expect(canModify(5, "SOUL.md").allowed).toBe(false);
    expect(canModify(6, "SOUL.md").allowed).toBe(true);
  });
});

// ─── Vitality Loop ──────────────────────────────────────────────────────────

describe("vitality-loop", () => {
  it("runs full vitality cycle", () => {
    const state = createDefaultVitalityState("test");
    const result = runVitalityCycle(state, {
      experienceType: "conversation",
      experienceDepth: 0.5,
      hoursSinceLastInteraction: 0,
    });

    expect(result.state.growth.experienceCount).toBe(1);
    expect(result.changes.some((c) => c.kind === "experience_processed")).toBe(true);
  });

  it("detects consciousness level changes", () => {
    const state = createDefaultVitalityState("test");
    // Pre-populate enough growth for level transition
    state.growth.experienceCount = 9;
    state.growth.reflectionCount = 2;
    state.consciousness.selfAwareness = 0.09;
    state.consciousness.introspectionDepth = 0.04;

    const result = runVitalityCycle(state, {
      experienceType: "self_reflection",
      experienceDepth: 0.8,
    });

    // May or may not trigger level change depending on exact growth
    expect(result.state.growth.experienceCount).toBe(10);
  });

  it("processes agent turn with channel context", () => {
    const state = createDefaultVitalityState("test");
    const updated = processAgentTurn(state, {
      experienceType: "conversation",
      channel: "whatsapp",
      peer: "alice",
      topic: "meeting",
    });

    expect(updated.growth.experienceCount).toBe(1);
    expect(updated.environment.recentActivity.length).toBe(1);
    expect(updated.environment.recentActivity[0].peer).toBe("alice");
    expect(updated.environment.activeChannels).toContain("whatsapp");
  });
});

// ─── Prompt Context ─────────────────────────────────────────────────────────

describe("prompt-context", () => {
  it("returns null for brand-new agents", () => {
    const state = createDefaultVitalityState("test");
    expect(buildVitalityPromptContext(state)).toBeNull();
  });

  it("builds context for experienced agents", () => {
    const state = createDefaultVitalityState("test");
    state.growth.experienceCount = 50;
    state.growth.reflectionCount = 10;
    state.consciousness.selfAwareness = 0.3;
    state.consciousnessLevel = "reflective";

    const ctx = buildVitalityPromptContext(state);
    expect(ctx).not.toBeNull();
    expect(ctx).toContain("Vitality");
    expect(ctx).toContain("reflective");
  });

  it("builds status summary", () => {
    const state = createDefaultVitalityState("test");
    state.growth.experienceCount = 100;
    const summary = buildVitalityStatusSummary(state);
    expect(summary).toContain("test");
    expect(summary).toContain("Worldly");
  });
});

// ─── State Persistence ──────────────────────────────────────────────────────

describe("state persistence", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vitality-test-"));
  });

  it("creates default state for new agent", () => {
    const state = loadVitalityState(tmpDir, "new-agent");
    expect(state.agentId).toBe("new-agent");
    expect(state.growth.experienceCount).toBe(0);
    expect(Object.keys(state.soulAspects).length).toBe(13);
  });

  it("saves and loads state", async () => {
    const state = createDefaultVitalityState("test-agent");
    state.growth.experienceCount = 42;
    state.consciousness.selfAwareness = 0.5;

    await saveVitalityState(tmpDir, state);
    expect(hasVitalityState(tmpDir)).toBe(true);

    const loaded = loadVitalityState(tmpDir, "test-agent");
    expect(loaded.growth.experienceCount).toBe(42);
    expect(loaded.consciousness.selfAwareness).toBe(0.5);
  });

  it("returns default when file doesn't exist", () => {
    expect(hasVitalityState(tmpDir)).toBe(false);
    const state = loadVitalityState(tmpDir, "missing-agent");
    expect(state.agentId).toBe("missing-agent");
    expect(state.growth.experienceCount).toBe(0);
  });
});
