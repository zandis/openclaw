/**
 * Goal Management System — Autonomous Will
 *
 * Goals give the agent direction between interactions.
 * They persist in VITALITY.json and are evaluated during each heartbeat.
 * Goals can be self-generated (from reflection), user-assigned,
 * or created by cron/heartbeat observations.
 */

import crypto from "node:crypto";
import type { Goal, GoalOrigin, VitalityState } from "./types.js";
import { MAX_GOALS } from "./types.js";

// ─── Goal Lifecycle ─────────────────────────────────────────────────────────

/**
 * Create a new goal.
 */
export function createGoal(params: {
  description: string;
  priority: number;
  origin: GoalOrigin;
}): Goal {
  return {
    id: crypto.randomUUID(),
    description: params.description,
    priority: Math.max(0, Math.min(1, params.priority)),
    origin: params.origin,
    progress: 0,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Update goal progress.
 */
export function updateGoalProgress(goal: Goal, progress: number): Goal {
  return {
    ...goal,
    progress: Math.max(0, Math.min(1, progress)),
    lastWorkedOn: new Date().toISOString(),
    completedAt: progress >= 1 ? new Date().toISOString() : goal.completedAt,
  };
}

/**
 * Mark a goal as completed.
 */
export function completeGoal(goal: Goal): Goal {
  return {
    ...goal,
    progress: 1,
    completedAt: new Date().toISOString(),
    lastWorkedOn: new Date().toISOString(),
  };
}

// ─── Goal Prioritization ────────────────────────────────────────────────────

/** Priority decay rate per hour (unfulfilled goals slowly lose urgency). */
const PRIORITY_DECAY_PER_HOUR = 0.002;
/** Minimum priority before a goal is pruned. */
const MIN_PRIORITY = 0.05;

/**
 * Apply natural priority decay to all goals.
 * Older, unworked goals fade to make room for new priorities.
 */
export function decayGoalPriorities(goals: Goal[], nowMs: number = Date.now()): Goal[] {
  return goals.map((goal) => {
    if (goal.completedAt) return goal; // Completed goals don't decay

    const lastActive = goal.lastWorkedOn ?? goal.createdAt;
    const hoursSince = (nowMs - new Date(lastActive).getTime()) / (1000 * 60 * 60);
    const decayedPriority = goal.priority * Math.max(0, 1 - PRIORITY_DECAY_PER_HOUR * hoursSince);

    return { ...goal, priority: decayedPriority };
  });
}

/**
 * Get the highest-priority active goal.
 */
export function getTopGoal(goals: Goal[]): Goal | undefined {
  return goals
    .filter((g) => !g.completedAt && g.priority >= MIN_PRIORITY)
    .sort((a, b) => b.priority - a.priority)[0];
}

/**
 * Get all active (incomplete) goals sorted by priority.
 */
export function getActiveGoals(goals: Goal[]): Goal[] {
  return goals
    .filter((g) => !g.completedAt && g.priority >= MIN_PRIORITY)
    .sort((a, b) => b.priority - a.priority);
}

// ─── Goal Management ────────────────────────────────────────────────────────

/**
 * Add a goal to the vitality state, respecting limits.
 * If at capacity, the lowest-priority incomplete goal is dropped.
 */
export function addGoal(state: VitalityState, goal: Goal): VitalityState {
  const goals = [...state.goals, goal];

  // Prune completed goals older than 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const pruned = goals.filter((g) => {
    if (g.completedAt && new Date(g.completedAt).getTime() < sevenDaysAgo) {
      return false;
    }
    return true;
  });

  // If still over limit, drop lowest-priority incomplete goal
  if (pruned.length > MAX_GOALS) {
    const sorted = pruned.filter((g) => !g.completedAt).sort((a, b) => a.priority - b.priority);

    if (sorted.length > 0) {
      const toRemove = sorted[0].id;
      return {
        ...state,
        goals: pruned.filter((g) => g.id !== toRemove),
      };
    }
  }

  return { ...state, goals: pruned };
}

/**
 * Remove a goal by ID.
 */
export function removeGoal(state: VitalityState, goalId: string): VitalityState {
  return {
    ...state,
    goals: state.goals.filter((g) => g.id !== goalId),
  };
}

/**
 * Clean up goals: apply decay, prune dead goals.
 */
export function cleanupGoals(state: VitalityState): VitalityState {
  let goals = decayGoalPriorities(state.goals);

  // Remove goals with priority below threshold (that haven't been completed)
  goals = goals.filter((g) => g.completedAt || g.priority >= MIN_PRIORITY);

  // Remove completed goals older than 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  goals = goals.filter((g) => {
    if (g.completedAt && new Date(g.completedAt).getTime() < sevenDaysAgo) {
      return false;
    }
    return true;
  });

  return { ...state, goals };
}

/**
 * Format goals for system prompt injection or display.
 */
export function formatGoals(goals: Goal[]): string {
  const active = getActiveGoals(goals);
  if (active.length === 0) return "No active goals.";

  return active
    .slice(0, 5) // Show top 5
    .map((g, i) => {
      const pct = (g.progress * 100).toFixed(0);
      const pri = g.priority >= 0.7 ? "high" : g.priority >= 0.4 ? "med" : "low";
      return `${i + 1}. [${pri}] ${g.description} (${pct}% done, from: ${g.origin})`;
    })
    .join("\n");
}
