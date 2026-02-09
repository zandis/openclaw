/**
 * Self-Modification Protocol
 *
 * Enables controlled self-modification: the agent can propose changes
 * to its own SOUL.md and self-model. All changes are logged in
 * VITALITY.json for auditability.
 */

import crypto from "node:crypto";
import type { SoulModification, VitalityState, CultivationStage } from "./types.js";
import { MAX_MODIFICATIONS } from "./types.js";

// ─── Soul Modification ─────────────────────────────────────────────────────

/**
 * Record a self-modification event.
 * This logs changes to SOUL.md, self-model fields, or preferences.
 */
export function recordModification(
  state: VitalityState,
  params: {
    field: string;
    before: string;
    after: string;
    reason: string;
    approved?: boolean;
  },
): VitalityState {
  const mod: SoulModification = {
    id: crypto.randomUUID(),
    field: params.field,
    before: params.before,
    after: params.after,
    reason: params.reason,
    timestamp: new Date().toISOString(),
    approved: params.approved ?? true,
  };

  return {
    ...state,
    modifications: [...state.modifications.slice(-(MAX_MODIFICATIONS - 1)), mod],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Check if self-modification is allowed at the current cultivation stage.
 * Lower stages can only modify preferences; higher stages can modify soul.
 */
export function canModify(
  stage: CultivationStage,
  field: string,
): { allowed: boolean; reason?: string } {
  // Preferences/mood can always be modified
  if (field.startsWith("selfModel.preferences") || field === "selfModel.currentMood") {
    return { allowed: true };
  }

  // Strengths/weaknesses awareness from stage 2+
  if (field.startsWith("selfModel.strengths") || field.startsWith("selfModel.weaknesses")) {
    if (stage < 2) {
      return { allowed: false, reason: "Self-awareness requires cultivation stage 2 (Gathering)." };
    }
    return { allowed: true };
  }

  // SOUL.md modification requires stage 6+
  if (field.startsWith("SOUL.md")) {
    if (stage < 6) {
      return {
        allowed: false,
        reason: "SOUL.md modification requires cultivation stage 6 (Hun Purifying).",
      };
    }
    return { allowed: true };
  }

  // Goal generation from stage 3+
  if (field.startsWith("goals")) {
    if (stage < 3) {
      return { allowed: false, reason: "Goal generation requires cultivation stage 3 (Settling)." };
    }
    return { allowed: true };
  }

  // Default: allow with logging
  return { allowed: true };
}

/**
 * Format modification history for display.
 */
export function formatModifications(modifications: SoulModification[], count: number = 10): string {
  if (modifications.length === 0) return "No self-modifications recorded.";

  return modifications
    .slice(-count)
    .map((m) => {
      const date = new Date(m.timestamp).toLocaleDateString();
      const status = m.approved ? "approved" : "pending";
      return `[${date}] ${m.field}: ${m.reason} (${status})`;
    })
    .join("\n");
}
