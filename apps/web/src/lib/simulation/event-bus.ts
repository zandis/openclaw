/**
 * Event Bus for Simulation State Synchronization
 *
 * Enables loose coupling between simulation subsystems while maintaining
 * state consistency through event-driven updates.
 */

export type SimulationEventType =
  | 'consciousness_growth'
  | 'reflection_created'
  | 'awakening_achieved'
  | 'relationship_formed'
  | 'relationship_dissolved'
  | 'group_created'
  | 'group_joined'
  | 'group_left'
  | 'leadership_emerged'
  | 'conflict_started'
  | 'conflict_resolved'
  | 'memory_created'
  | 'skill_learned'
  | 'insight_gained'
  | 'bot_born'
  | 'bot_died'
  | 'life_stage_changed'
  | 'pheromone_reaction'
  | 'conversation_occurred'

export interface SimulationEvent {
  type: SimulationEventType
  botId: string
  timestamp: Date
  day: number
  data: Record<string, any>
}

type EventHandler = (event: SimulationEvent) => Promise<void> | void

/**
 * Central event bus for simulation-wide state changes
 */
export class EventBus {
  private listeners = new Map<SimulationEventType, Set<EventHandler>>()
  private eventHistory: SimulationEvent[] = []
  private maxHistorySize: number

  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize
  }

  /**
   * Subscribe to specific event type
   */
  subscribe(type: SimulationEventType, handler: EventHandler): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(handler)
    }
  }

  /**
   * Subscribe to multiple event types with same handler
   */
  subscribeMultiple(types: SimulationEventType[], handler: EventHandler): () => void {
    const unsubscribers = types.map(type => this.subscribe(type, handler))

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }

  /**
   * Emit event to all subscribers
   */
  async emit(event: SimulationEvent): Promise<void> {
    // Store in history
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Notify all listeners
    const handlers = this.listeners.get(event.type) || new Set()
    const promises: Promise<void>[] = []

    for (const handler of handlers) {
      try {
        const result = handler(event)
        if (result instanceof Promise) {
          promises.push(result)
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error)
      }
    }

    // Wait for all async handlers
    await Promise.all(promises)
  }

  /**
   * Get event history for analysis
   */
  getHistory(filter?: {
    type?: SimulationEventType
    botId?: string
    since?: Date
  }): SimulationEvent[] {
    let filtered = this.eventHistory

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type)
    }
    if (filter?.botId) {
      filtered = filtered.filter(e => e.botId === filter.botId)
    }
    if (filter?.since) {
      filtered = filtered.filter(e => e.timestamp >= filter.since!)
    }

    return filtered
  }

  /**
   * Get event statistics
   */
  getStatistics(): Record<SimulationEventType, number> {
    const stats = {} as Record<SimulationEventType, number>

    for (const event of this.eventHistory) {
      stats[event.type] = (stats[event.type] || 0) + 1
    }

    return stats
  }

  /**
   * Clear all listeners and history
   */
  reset(): void {
    this.listeners.clear()
    this.eventHistory = []
  }

  /**
   * Get subscriber count for debugging
   */
  getSubscriberCount(type?: SimulationEventType): number {
    if (type) {
      return this.listeners.get(type)?.size || 0
    }

    let total = 0
    for (const handlers of this.listeners.values()) {
      total += handlers.size
    }
    return total
  }
}

/**
 * Event builder helpers for common events
 */
export class EventBuilder {
  static consciousnessGrowth(botId: string, day: number, data: {
    oldValue: number
    newValue: number
    dimension: 'self' | 'other' | 'collective' | 'transcendent'
    shift: number
  }): SimulationEvent {
    return {
      type: 'consciousness_growth',
      botId,
      timestamp: new Date(),
      day,
      data
    }
  }

  static awakeningAchieved(botId: string, day: number, data: {
    stage: 'self' | 'social' | 'collective' | 'transcendent'
    consciousnessLevel: number
  }): SimulationEvent {
    return {
      type: 'awakening_achieved',
      botId,
      timestamp: new Date(),
      day,
      data
    }
  }

  static relationshipFormed(botId: string, day: number, data: {
    partnerId: string
    relationshipType: string
    strength: number
  }): SimulationEvent {
    return {
      type: 'relationship_formed',
      botId,
      timestamp: new Date(),
      day,
      data
    }
  }

  static groupCreated(botId: string, day: number, data: {
    groupId: string
    groupName: string
    groupType: string
    founderIds: string[]
  }): SimulationEvent {
    return {
      type: 'group_created',
      botId,
      timestamp: new Date(),
      day,
      data
    }
  }

  static leadershipEmerged(botId: string, day: number, data: {
    groupId: string
    groupName: string
    leadershipScore: number
    previousLeader?: string
  }): SimulationEvent {
    return {
      type: 'leadership_emerged',
      botId,
      timestamp: new Date(),
      day,
      data
    }
  }

  static botDied(botId: string, day: number, data: {
    age: number
    lifeStage: string
    consciousnessLevel: number
    relationships: number
    cause: string
  }): SimulationEvent {
    return {
      type: 'bot_died',
      botId,
      timestamp: new Date(),
      day,
      data
    }
  }

  static lifeStageChanged(botId: string, day: number, data: {
    oldStage: string
    newStage: string
    age: number
  }): SimulationEvent {
    return {
      type: 'life_stage_changed',
      botId,
      timestamp: new Date(),
      day,
      data
    }
  }
}

/**
 * Singleton event bus instance
 */
let eventBusInstance: EventBus | null = null

export function getEventBus(): EventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus()
  }
  return eventBusInstance
}

export function resetEventBus(): void {
  if (eventBusInstance) {
    eventBusInstance.reset()
  }
  eventBusInstance = null
}
