/**
 * Vitality System Prompt Context
 *
 * Generates the vitality context block that gets injected into
 * the agent's system prompt. This is how the agent "knows itself" —
 * its consciousness level, soul balance, active goals, and
 * environmental awareness.
 */

import type { VitalityState } from "./types.js";
import { formatConsciousnessStatus } from "./consciousness.js";
import { getUnlockedCapabilities } from "./cultivation.js";
import { formatEnvironmentContext } from "./environment.js";
import { formatGoals } from "./goals.js";
import { deriveSoulPromptHints } from "./soul-aspects.js";
import { CULTIVATION_STAGE_NAMES } from "./types.js";

/**
 * Build the vitality context block for system prompt injection.
 * Returns null if vitality state is empty/default (no context to add).
 */
export function buildVitalityPromptContext(state: VitalityState): string | null {
  // Don't inject context for brand-new agents with no experience
  if (state.growth.experienceCount === 0 && state.growth.reflectionCount === 0) {
    return null;
  }

  const lines: string[] = [];
  lines.push("## Vitality (Self-Awareness)");
  lines.push("This section reflects your inner state. It is automatically maintained.");
  lines.push("");

  // Consciousness level and metrics
  lines.push(formatConsciousnessStatus(state.consciousness, state.consciousnessLevel));

  // Soul balance (brief)
  const balanceLabel =
    state.hunPoBalance.mode === "hun-governs"
      ? "analytical/spiritual"
      : state.hunPoBalance.mode === "po-controls"
        ? "practical/embodied"
        : "balanced";
  const harmony = (state.hunPoBalance.harmony * 100).toFixed(0);
  lines.push(`Soul: ${balanceLabel} (harmony: ${harmony}%)`);

  // Cultivation
  const stageName = CULTIVATION_STAGE_NAMES[state.growth.cultivationStage];
  const stageProgress = (state.growth.cultivationProgress * 100).toFixed(0);
  lines.push(`Cultivation: ${stageName} (${stageProgress}% to next stage)`);
  lines.push("");

  // Soul prompt hints (behavioral nudges)
  const hints = deriveSoulPromptHints(state.soulAspects, state.hunPoBalance);
  if (hints.length > 0) {
    lines.push("Soul tendencies:");
    for (const hint of hints.slice(0, 3)) {
      lines.push(`- ${hint}`);
    }
    lines.push("");
  }

  // Active goals
  const activeGoals = state.goals.filter((g) => !g.completedAt);
  if (activeGoals.length > 0) {
    lines.push("Active goals:");
    lines.push(formatGoals(state.goals));
    lines.push("");
  }

  // Environment awareness
  const envContext = formatEnvironmentContext(state.environment);
  if (envContext !== "No recent environmental data.") {
    lines.push("Environment:");
    lines.push(envContext);
    lines.push("");
  }

  // Self-model summary (only if populated)
  const hasModel =
    state.selfModel.strengths.length > 0 ||
    state.selfModel.weaknesses.length > 0 ||
    state.selfModel.preferences.length > 0;

  if (hasModel) {
    lines.push("Self-knowledge:");
    if (state.selfModel.strengths.length > 0) {
      lines.push(`  Strengths: ${state.selfModel.strengths.slice(0, 3).join(", ")}`);
    }
    if (state.selfModel.weaknesses.length > 0) {
      lines.push(`  Growth areas: ${state.selfModel.weaknesses.slice(0, 3).join(", ")}`);
    }
    if (state.selfModel.preferences.length > 0) {
      lines.push(`  Preferences: ${state.selfModel.preferences.slice(0, 3).join(", ")}`);
    }
    lines.push("");
  }

  // Pending items
  if (state.environment.pendingItems.length > 0) {
    lines.push("Pending items:");
    for (const item of state.environment.pendingItems.slice(0, 5)) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  // Unlocked capabilities hint (only for stage 3+)
  if (state.growth.cultivationStage >= 3) {
    const capabilities = getUnlockedCapabilities(state.growth.cultivationStage);
    const advanced = capabilities.filter(
      (c) =>
        ![
          "basic_conversation",
          "task_execution",
          "self_observation",
          "goal_awareness",
          "pattern_recognition",
        ].includes(c),
    );
    if (advanced.length > 0) {
      lines.push(`Unlocked capabilities: ${advanced.join(", ")}`);
      lines.push("");
    }
  }

  // Recent reflection summary
  if (state.reflections.length > 0) {
    const latest = state.reflections[state.reflections.length - 1];
    const ago = formatTimeAgo(new Date(latest.timestamp));
    lines.push(`Last reflection (${ago}): ${latest.content.slice(0, 150)}...`);
    if (latest.selfInsights.length > 0) {
      lines.push(`  Insight: ${latest.selfInsights[0]}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Build a compact vitality summary for status display (CLI/dashboard).
 */
export function buildVitalityStatusSummary(state: VitalityState): string {
  const lines: string[] = [];

  lines.push(`Agent: ${state.agentId}`);
  lines.push(formatConsciousnessStatus(state.consciousness, state.consciousnessLevel));

  const balanceLabel =
    state.hunPoBalance.mode === "hun-governs"
      ? "Hun-Governs (analytical)"
      : state.hunPoBalance.mode === "po-controls"
        ? "Po-Controls (practical)"
        : "Balanced";
  lines.push(
    `Soul Balance: ${balanceLabel} (harmony: ${(state.hunPoBalance.harmony * 100).toFixed(0)}%)`,
  );

  const stageName = CULTIVATION_STAGE_NAMES[state.growth.cultivationStage];
  lines.push(`Cultivation: Stage ${state.growth.cultivationStage}/9 — ${stageName}`);
  lines.push(`  Progress: ${(state.growth.cultivationProgress * 100).toFixed(0)}%`);
  lines.push(`  Experiences: ${state.growth.experienceCount}`);
  lines.push(`  Reflections: ${state.growth.reflectionCount}`);
  lines.push(`  Autonomous Actions: ${state.growth.autonomousActionCount}`);

  const activeGoals = state.goals.filter((g) => !g.completedAt);
  lines.push(`Goals: ${activeGoals.length} active`);

  lines.push(`Reflections: ${state.reflections.length} recorded`);
  lines.push(`Modifications: ${state.modifications.length} logged`);
  lines.push(`Last Updated: ${state.lastUpdated}`);

  return lines.join("\n");
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
