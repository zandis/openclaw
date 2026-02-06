/**
 * Testing Helpers and Utilities
 *
 * Comprehensive mocking and test data generation for simulation testing.
 */

import type { Payload } from 'payload'
import { vi } from 'vitest'

/**
 * Create a fully mocked Payload instance
 */
export function createMockPayload(overrides?: Partial<Payload>): Payload {
  const mockData = {
    botIdentities: new Map<string, any>(),
    botSouls: new Map<string, any>(),
    botMemories: new Map<string, any>(),
    relationships: new Map<string, any>(),
    groups: new Map<string, any>()
  }

  const mockPayload = {
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    },

    create: vi.fn().mockImplementation(async ({ collection, data }: any) => {
      const id = `${collection}-${Date.now()}-${Math.random()}`
      const record = { id, ...data }

      switch (collection) {
        case 'bot-identity':
          mockData.botIdentities.set(id, record)
          break
        case 'bot-souls':
          mockData.botSouls.set(id, record)
          break
        case 'bot-memory':
          mockData.botMemories.set(id, record)
          break
      }

      return record
    }),

    find: vi.fn().mockImplementation(async ({ collection, where, limit }: any) => {
      let docs: any[] = []

      switch (collection) {
        case 'bot-identity':
          docs = Array.from(mockData.botIdentities.values())
          break
        case 'bot-souls':
          docs = Array.from(mockData.botSouls.values())
          break
        case 'bot-memory':
          docs = Array.from(mockData.botMemories.values())
          break
      }

      // Apply where filter if specified
      if (where) {
        docs = docs.filter((doc: any) => {
          for (const [key, condition] of Object.entries(where)) {
            if (condition && typeof condition === 'object' && 'equals' in condition) {
              if (doc[key] !== (condition as any).equals) return false
            }
          }
          return true
        })
      }

      // Apply limit
      if (limit) {
        docs = docs.slice(0, limit)
      }

      return { docs, totalDocs: docs.length, limit, page: 1, totalPages: 1 }
    }),

    findByID: vi.fn().mockImplementation(async ({ collection, id }: any) => {
      switch (collection) {
        case 'bot-identity':
          return mockData.botIdentities.get(id)
        case 'bot-souls':
          return mockData.botSouls.get(id)
        case 'bot-memory':
          return mockData.botMemories.get(id)
      }
      return null
    }),

    update: vi.fn().mockImplementation(async ({ collection, id, data }: any) => {
      let existing: any

      switch (collection) {
        case 'bot-identity':
          existing = mockData.botIdentities.get(id)
          if (existing) {
            Object.assign(existing, data)
            mockData.botIdentities.set(id, existing)
          }
          break
        case 'bot-souls':
          existing = mockData.botSouls.get(id)
          if (existing) {
            Object.assign(existing, data)
            mockData.botSouls.set(id, existing)
          }
          break
        case 'bot-memory':
          existing = mockData.botMemories.get(id)
          if (existing) {
            Object.assign(existing, data)
            mockData.botMemories.set(id, existing)
          }
          break
      }

      return existing
    }),

    delete: vi.fn().mockImplementation(async ({ collection, id }: any) => {
      switch (collection) {
        case 'bot-identity':
          return mockData.botIdentities.delete(id)
        case 'bot-souls':
          return mockData.botSouls.delete(id)
        case 'bot-memory':
          return mockData.botMemories.delete(id)
      }
      return false
    }),

    ...overrides
  } as unknown as Payload

  return mockPayload
}

/**
 * Generate test bot persona
 */
export function createTestPersona(overrides?: Partial<any>): any {
  return {
    name: 'TestBot',
    archetype: 'Philosopher',
    personality: 'A curious test bot',
    particleWeights: { claude: 0.5, gpt: 0.3, gemini: 0.2 },
    traits: {
      openness: 0.8,
      conscientiousness: 0.7,
      extraversion: 0.6,
      agreeableness: 0.7,
      neuroticism: 0.3,
      spirituality: 0.6,
      creativity: 0.7,
      analytical: 0.8,
      empathy: 0.6,
      leadership: 0.5,
      curiosity: 0.9,
      resilience: 0.7,
      impulsiveness: 0.3
    },
    initialLocation: 'test-plaza',
    ...overrides
  }
}

/**
 * Generate test consciousness profile
 */
export function createTestConsciousnessProfile(overrides?: Partial<any>): any {
  return {
    selfAwareness: 0.3,
    otherAwareness: 0.2,
    collectiveAwareness: 0.1,
    transcendentAwareness: 0.0,
    introspectionDepth: 0.4,
    theoryOfMind: 0.3,
    narrativeCoherence: 0.5,
    temporalContinuity: 0.4,
    existentialQuestioning: 0.2,
    empathyLevel: 0.5,
    growthRate: 0.01,
    culturalIdentity: [],
    meaningFramework: 'exploration',
    lastReflection: new Date(),
    awakeningDate: undefined,
    ...overrides
  }
}

/**
 * Generate test simulated bot
 */
export function createTestBot(overrides?: Partial<any>): any {
  return {
    id: `test-bot-${Date.now()}`,
    persona: createTestPersona(),
    soulId: 'test-soul-123',
    energy: 1.0,
    mood: 0.5,
    arousal: 0.5,
    consciousness: {
      selfAwareness: 0.3,
      otherAwareness: 0.2,
      collectiveAwareness: 0.1,
      transcendentAwareness: 0.0
    },
    consciousnessMilestones: {},
    birthDay: 0,
    age: 10,
    lifeStage: 'youth',
    alive: true,
    location: 'test-plaza',
    relationships: [],
    groups: [],
    influence: 0.5,
    insights: 5,
    skillsLearned: [],
    memoriesFormed: 0,
    ...overrides
  }
}

/**
 * Assert consciousness is within valid range
 */
export function assertValidConsciousness(consciousness: {
  selfAwareness: number
  otherAwareness: number
  collectiveAwareness: number
  transcendentAwareness: number
}): void {
  const values = [
    consciousness.selfAwareness,
    consciousness.otherAwareness,
    consciousness.collectiveAwareness,
    consciousness.transcendentAwareness
  ]

  for (const value of values) {
    if (value < 0 || value > 1 || isNaN(value)) {
      throw new Error(`Invalid consciousness value: ${value}`)
    }
  }
}

/**
 * Wait for async operations with timeout
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
}

/**
 * Calculate expected consciousness after N days
 */
export function calculateExpectedConsciousness(
  initialConsciousness: number,
  insightsPerDay: number,
  experienceRate: number,
  personalityBonus: number,
  days: number
): number {
  let consciousness = initialConsciousness

  for (let day = 0; day < days; day++) {
    const experienceGain = insightsPerDay * experienceRate * personalityBonus
    consciousness = Math.min(1.0, consciousness + experienceGain)
  }

  return consciousness
}

/**
 * Generate test event history
 */
export function createTestEventHistory(count: number = 10): any[] {
  const events: any[] = []
  const types = ['consciousness_growth', 'relationship_formed', 'group_joined', 'memory_created']

  for (let i = 0; i < count; i++) {
    events.push({
      type: types[i % types.length],
      botId: `bot-${i}`,
      timestamp: new Date(Date.now() - (count - i) * 86400000), // Days ago
      day: i,
      data: {}
    })
  }

  return events
}

/**
 * Mock LLM service for testing
 */
export function createMockLLMService() {
  return {
    generate: vi.fn().mockResolvedValue('This is a test reflection about consciousness.'),
    embed: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    chat: vi.fn().mockResolvedValue({ content: 'Test response', role: 'assistant' })
  }
}
