/**
 * Environment Scanner — Cross-Channel Perception
 *
 * Gives the agent awareness of activity across all its channels
 * during the heartbeat loop. Scans session metadata (not message content)
 * for timestamps, peer IDs, and channel activity.
 */

import type { EnvironmentModel, RecentActivity, VitalityState } from "./types.js";

// ─── Types ──────────────────────────────────────────────────────────────────

/** Minimal session metadata for environment scanning. */
export type SessionScanEntry = {
  sessionKey: string;
  updatedAt: number;
  lastChannel?: string;
  lastTo?: string;
  subject?: string;
  origin?: {
    from?: string;
    provider?: string;
    label?: string;
  };
};

// ─── Scanner ────────────────────────────────────────────────────────────────

/**
 * Scan session metadata and build an environment model.
 * This reads ONLY metadata (timestamps, peer IDs, channels) — never
 * message content, preserving privacy.
 */
export function scanEnvironment(
  sessions: SessionScanEntry[],
  existingEnv: EnvironmentModel,
): EnvironmentModel {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Find active channels from recent sessions
  const channelSet = new Set<string>();
  const recentActivity: RecentActivity[] = [];

  for (const session of sessions) {
    if (session.updatedAt < oneDayAgo) continue; // Skip stale sessions

    const channel = session.lastChannel ?? session.origin?.provider;
    if (channel) channelSet.add(channel);

    const peer = session.lastTo ?? session.origin?.from;
    if (peer && channel) {
      recentActivity.push({
        channel,
        peer,
        timestamp: new Date(session.updatedAt).toISOString(),
        topic: session.subject ?? session.origin?.label,
      });
    }
  }

  // Sort by recency, keep last 20
  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    activeChannels: Array.from(channelSet).sort(),
    recentActivity: deduplicateActivity(recentActivity).slice(0, 20),
    pendingItems: existingEnv.pendingItems, // Preserve user-set pending items
  };
}

/**
 * Deduplicate recent activity — keep only the most recent entry per peer+channel.
 */
function deduplicateActivity(activity: RecentActivity[]): RecentActivity[] {
  const seen = new Map<string, RecentActivity>();

  for (const entry of activity) {
    const key = `${entry.channel}:${entry.peer}`;
    if (!seen.has(key)) {
      seen.set(key, entry);
    }
  }

  return Array.from(seen.values());
}

/**
 * Format environment awareness for system prompt injection.
 */
export function formatEnvironmentContext(env: EnvironmentModel): string {
  const lines: string[] = [];

  if (env.activeChannels.length > 0) {
    lines.push(`Active channels: ${env.activeChannels.join(", ")}`);
  }

  if (env.recentActivity.length > 0) {
    const recent = env.recentActivity.slice(0, 5);
    const formatted = recent.map((a) => {
      const ago = formatTimeAgo(new Date(a.timestamp));
      return `${a.peer} (${a.channel}, ${ago}${a.topic ? `, re: ${a.topic}` : ""})`;
    });
    lines.push(`Recent interactions: ${formatted.join("; ")}`);
  }

  if (env.pendingItems.length > 0) {
    lines.push(`Pending: ${env.pendingItems.slice(0, 5).join("; ")}`);
  }

  return lines.length > 0 ? lines.join("\n") : "No recent environmental data.";
}

/**
 * Update the environment in vitality state from session metadata.
 */
export function updateEnvironment(
  state: VitalityState,
  sessions: SessionScanEntry[],
): VitalityState {
  const newEnv = scanEnvironment(sessions, state.environment);

  return {
    ...state,
    environment: newEnv,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
