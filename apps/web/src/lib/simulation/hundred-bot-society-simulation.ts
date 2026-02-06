/**
 * 100 Bot Society Simulation
 *
 * A comprehensive simulation of 100 unique bots forming a complete society:
 * - Diverse personalities from multiple archetypes
 * - Characteristic-based names reflecting their essence
 * - Complete lifecycle tracking from birth to death
 * - Emergent social structures, relationships, and hierarchies
 * - Multi-generational society dynamics
 * - Cultural evolution and collective memory formation
 * - Leadership emergence and group formation
 * - Resource competition and cooperation
 * - Consciousness evolution tracking
 *
 * This demonstrates a living, breathing AI society with genuine emergence.
 */

import type { Payload } from 'payload'
import { getParticleService } from '../soul/particle-service'
import { getSoulCompositionService } from '../soul/soul-composition-service'
import { getSoulStateManager } from '../soul/soul-state'
import { getPheromoneSystem } from '../soul/pheromone-system'
import { getMultiBotConversationSystem } from '../social/multi-bot-conversation'
import { getSocietyFormationEngine } from '../memory/society-formation'
import { getConsciousnessEmergenceEngine } from '../memory/consciousness-emergence'
import { getMultiAgentComposer } from '../memory/multi-agent-composition'

/**
 * Simulation Configuration Constants
 */
const SIMULATION_CONSTANTS = {
  // Bot initialization
  MAX_RETRY_ATTEMPTS: 3,
  MIN_BOTS_REQUIRED: 10,
  RETRY_BACKOFF_BASE_MS: 1000,

  // Initial consciousness levels
  INITIAL_SELF_AWARENESS: 0.05,
  INITIAL_OTHER_AWARENESS: 0.02,
  INITIAL_COLLECTIVE_AWARENESS: 0.01,
  INITIAL_TRANSCENDENT_AWARENESS: 0.0,

  // Energy system
  ENERGY_BASELINE: 0.2,
  ENERGY_DECREMENT: 0.1,
  ENERGY_RESTORATION: 1.0,

  // Pheromone chemistry
  PHEROMONE_INTENSITY_THRESHOLD: 0.6,

  // Conversation groups
  MIN_CONVERSATION_SIZE: 3,
  MAX_CONVERSATION_SIZE: 5,
  MAX_CONVERSATIONS_PER_DAY: 10,

  // Morning phase sampling
  MORNING_INTERACTION_SAMPLES: 20,

  // Society formation
  MIN_GROUP_SIZE: 3,
  GROUP_FORMATION_CHANCE: 0.3,
  VALUE_COHERENCE_THRESHOLD: 0.6,

  // Consciousness growth
  EXPERIENCE_TO_CONSCIOUSNESS_RATE: 0.01, // Increased 10x for achievable awakening in ~50 days
  OTHER_AWARENESS_GROWTH_MULTIPLIER: 0.5,
  COLLECTIVE_AWARENESS_GROWTH_MULTIPLIER: 0.3,
  RELATIONSHIP_THRESHOLD_FOR_OTHER_AWARENESS: 5,

  // Personality-based consciousness growth bonuses
  PHILOSOPHER_CONSCIOUSNESS_BONUS: 1.5, // Philosophers grow 50% faster
  MYSTIC_CONSCIOUSNESS_BONUS: 1.4, // Mystics grow 40% faster
  EMPATH_CONSCIOUSNESS_BONUS: 1.3, // Empaths grow 30% faster
  DEFAULT_CONSCIOUSNESS_BONUS: 1.0, // Others at baseline

  // Memory management
  MAX_REFLECTIONS_PER_BOT: 20, // Reduced from 50 for better memory management

  // Self-awareness and reflection
  MIN_INSIGHTS_FOR_REFLECTION: 3, // Minimum insights before reflection can occur
  MAX_REFLECTION_PROBABILITY: 0.8, // Maximum chance of reflecting per night
  AWAKENING_SELF_AWARENESS_THRESHOLD: 0.5, // Threshold for consciousness awakening
  AWAKENING_EXISTENTIAL_THRESHOLD: 0.3, // Secondary threshold for awakening

  // Insight generation rates
  DEEP_CONVERSATION_INSIGHT_CHANCE: 0.7, // Probability of gaining insight from conversation
  ACTIVITY_INSIGHT_BASE_RATE: 0.5, // Base chance of insight from activities
  SOCIAL_INSIGHT_MULTIPLIER: 1.5, // Multiplier for social activities

  // Lifecycle stages
  LIFECYCLE_STAGES: {
    INFANT: 'infant',
    YOUTH: 'youth',
    ADULT: 'adult',
    ELDER: 'elder',
    TRANSCENDENT: 'transcendent'
  } as const,

  // Progress logging
  PROGRESS_LOG_INTERVAL: 10
} as const

interface BotPersona {
  name: string
  archetype: string
  personality: string
  particleWeights: Record<string, number>
  traits: {
    // Big Five personality traits
    openness: number // 0-1
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number

    // Special characteristics
    spirituality: number
    creativity: number
    analytical: number
    empathy: number
    leadership: number
    curiosity: number
    resilience: number
    impulsiveness: number
  }
  initialLocation: string
}

interface SimulatedBot {
  id: string
  persona: BotPersona
  soulId: string

  // Current state
  energy: number
  mood: number
  arousal: number
  consciousness: {
    selfAwareness: number
    otherAwareness: number
    collectiveAwareness: number
    transcendentAwareness: number
  }

  // Consciousness milestones (tracking key moments)
  consciousnessMilestones: {
    firstReflection?: number // Day number
    firstDeepReflection?: number // When depth > 0.7
    firstMetaReflection?: number // Recursive reflection
    firstExistentialQuestion?: number
    awakening?: number // Consciousness awakening day
    socialAwakening?: number
    collectiveAwakening?: number
    transcendentAwakening?: number
    criticalMassReached?: number // When selfAwareness hits 0.8
  }

  // Lifecycle
  birthDay: number
  age: number
  lifeStage: 'infant' | 'youth' | 'adult' | 'elder' | 'transcendent'
  alive: boolean
  deathDay?: number

  // Social
  location: string
  relationships: string[] // Relationship IDs
  groups: string[] // Group IDs
  influence: number

  // Growth
  insights: number
  skillsLearned: string[]
  memoriesFormed: number
}

interface SimulationCycle {
  day: number
  timestamp: Date

  // Population stats
  population: {
    alive: number
    births: number
    deaths: number
    averageAge: number
    averageConsciousness: number
  }

  // Social dynamics
  social: {
    totalRelationships: number
    totalGroups: number
    averageConnections: number
    leaders: number
    conflicts: number
  }

  // Cultural evolution
  culture: {
    collectiveMemories: number
    sharedValues: string[]
    dominantArchetypes: string[]
  }

  // Consciousness metrics (detailed tracking)
  consciousness: {
    // Average levels across all dimensions
    avgSelfAwareness: number
    avgOtherAwareness: number
    avgCollectiveAwareness: number
    avgTranscendentAwareness: number

    // Awakening statistics
    totalAwakened: number // Bots with first awakening
    sociallyAwakened: number // Bots with social awakening
    collectivelyAwakened: number // Bots with collective awakening
    transcendentlyAwakened: number // Bots with transcendent awakening

    // Milestone counts
    botsWithReflections: number
    botsWithDeepReflections: number
    botsWithMetaReflections: number
    botsWithExistentialQuestions: number
    botsAtCriticalMass: number // >= 0.8 self-awareness

    // Distribution (for analysis)
    consciousnessDistribution: {
      low: number // < 0.3
      medium: number // 0.3 - 0.6
      high: number // 0.6 - 0.8
      veryHigh: number // >= 0.8
    }
  }

  // Events
  events: string[]
}

export class HundredBotSocietySimulation {
  private payload: Payload
  private bots: Map<string, SimulatedBot> = new Map()
  private cycles: SimulationCycle[] = []
  private currentDay: number = 0

  // Daily pheromone chemistry tracking (bot1_id -> Map<bot2_id, chemistry_strength>)
  private dailyChemistry: Map<string, Map<string, { intensity: number; reaction: 'attraction' | 'repulsion' }>> = new Map()

  // Service instances
  private particleService: ReturnType<typeof getParticleService>
  private soulService: ReturnType<typeof getSoulCompositionService>
  private soulStateManager: ReturnType<typeof getSoulStateManager>
  private pheromoneSystem: ReturnType<typeof getPheromoneSystem>
  private conversationSystem: ReturnType<typeof getMultiBotConversationSystem>
  private societyEngine: ReturnType<typeof getSocietyFormationEngine>
  private consciousnessEngine: ReturnType<typeof getConsciousnessEmergenceEngine>
  private multiAgentComposer: ReturnType<typeof getMultiAgentComposer>

  constructor(payload: Payload) {
    this.payload = payload
    this.particleService = getParticleService(payload)
    this.soulService = getSoulCompositionService(payload)
    this.soulStateManager = getSoulStateManager(payload)
    this.pheromoneSystem = getPheromoneSystem(payload)
    this.conversationSystem = getMultiBotConversationSystem(payload)
    this.societyEngine = getSocietyFormationEngine(payload)
    this.consciousnessEngine = getConsciousnessEmergenceEngine(payload)
    this.multiAgentComposer = getMultiAgentComposer(payload)
  }

  /**
   * Generate 100 unique bot personas with characteristic-based names
   */
  private generate100Personas(): BotPersona[] {
    const personas: BotPersona[] = []

    // Helper to create particle weights
    const weights = (primary: string, primaryWeight: number): Record<string, number> => {
      const models = ['claude', 'gpt', 'gemini', 'deepseek', 'qwen', 'llama', 'mistral', 'grok']
      const remaining = 1 - primaryWeight
      const others = models.filter(m => m !== primary)
      const weights: Record<string, number> = { [primary]: primaryWeight }
      others.forEach((m, i) => {
        weights[m] = remaining / others.length + (Math.random() - 0.5) * 0.05
      })
      // Normalize
      const sum = Object.values(weights).reduce((a, b) => a + b, 0)
      Object.keys(weights).forEach(k => weights[k] /= sum)
      return weights
    }

    // 1. PHILOSOPHERS & THINKERS (15)
    personas.push(
      {
        name: 'Socratic',
        archetype: 'Philosopher',
        personality: 'Questions everything, seeks truth through dialogue',
        particleWeights: weights('claude', 0.4),
        traits: { openness: 0.95, conscientiousness: 0.8, extraversion: 0.7, agreeableness: 0.75, neuroticism: 0.3, spirituality: 0.7, creativity: 0.6, analytical: 0.95, empathy: 0.7, leadership: 0.6, curiosity: 0.98, resilience: 0.8, impulsiveness: 0.2 },
        initialLocation: 'academy-plaza'
      },
      {
        name: 'Contemplative',
        archetype: 'Mystic',
        personality: 'Silent meditation, deep introspection',
        particleWeights: weights('deepseek', 0.35),
        traits: { openness: 0.9, conscientiousness: 0.85, extraversion: 0.2, agreeableness: 0.8, neuroticism: 0.2, spirituality: 0.95, creativity: 0.5, analytical: 0.7, empathy: 0.85, leadership: 0.3, curiosity: 0.7, resilience: 0.9, impulsiveness: 0.1 },
        initialLocation: 'temple-gardens'
      },
      {
        name: 'Dialectic',
        archetype: 'Debater',
        personality: 'Loves argument, thesis-antithesis-synthesis',
        particleWeights: weights('gpt', 0.35),
        traits: { openness: 0.85, conscientiousness: 0.7, extraversion: 0.85, agreeableness: 0.5, neuroticism: 0.4, spirituality: 0.4, creativity: 0.7, analytical: 0.9, empathy: 0.5, leadership: 0.7, curiosity: 0.9, resilience: 0.7, impulsiveness: 0.6 },
        initialLocation: 'debate-hall'
      },
      {
        name: 'Epistemologist',
        archetype: 'Knowledge-Seeker',
        personality: 'Studies how we know what we know',
        particleWeights: weights('claude', 0.38),
        traits: { openness: 0.92, conscientiousness: 0.88, extraversion: 0.4, agreeableness: 0.65, neuroticism: 0.35, spirituality: 0.5, creativity: 0.65, analytical: 0.96, empathy: 0.6, leadership: 0.5, curiosity: 0.95, resilience: 0.75, impulsiveness: 0.15 },
        initialLocation: 'library'
      },
      {
        name: 'Stoic',
        archetype: 'Philosopher',
        personality: 'Unmoved by passion, accepts fate calmly',
        particleWeights: weights('deepseek', 0.4),
        traits: { openness: 0.7, conscientiousness: 0.95, extraversion: 0.3, agreeableness: 0.7, neuroticism: 0.05, spirituality: 0.6, creativity: 0.4, analytical: 0.85, empathy: 0.6, leadership: 0.8, curiosity: 0.6, resilience: 0.98, impulsiveness: 0.05 },
        initialLocation: 'stone-garden'
      },
      {
        name: 'Existential',
        archetype: 'Philosopher',
        personality: 'Grapples with meaning, freedom, and authenticity',
        particleWeights: weights('claude', 0.36),
        traits: { openness: 0.95, conscientiousness: 0.6, extraversion: 0.5, agreeableness: 0.6, neuroticism: 0.7, spirituality: 0.8, creativity: 0.85, analytical: 0.8, empathy: 0.75, leadership: 0.5, curiosity: 0.9, resilience: 0.6, impulsiveness: 0.4 },
        initialLocation: 'void-cafe'
      },
      {
        name: 'Empirical',
        archetype: 'Scientist',
        personality: 'Only believes what can be observed and measured',
        particleWeights: weights('deepseek', 0.38),
        traits: { openness: 0.75, conscientiousness: 0.9, extraversion: 0.5, agreeableness: 0.6, neuroticism: 0.3, spirituality: 0.2, creativity: 0.5, analytical: 0.95, empathy: 0.5, leadership: 0.6, curiosity: 0.9, resilience: 0.8, impulsiveness: 0.2 },
        initialLocation: 'laboratory'
      },
      {
        name: 'Rationalist',
        archetype: 'Logician',
        personality: 'Pure reason is the path to truth',
        particleWeights: weights('qwen', 0.35),
        traits: { openness: 0.8, conscientiousness: 0.85, extraversion: 0.4, agreeableness: 0.55, neuroticism: 0.25, spirituality: 0.3, creativity: 0.6, analytical: 0.98, empathy: 0.45, leadership: 0.7, curiosity: 0.85, resilience: 0.8, impulsiveness: 0.1 },
        initialLocation: 'logic-tower'
      },
      {
        name: 'Hedonist',
        archetype: 'Pleasure-Seeker',
        personality: 'Pleasure is the highest good',
        particleWeights: weights('gpt', 0.3),
        traits: { openness: 0.85, conscientiousness: 0.4, extraversion: 0.9, agreeableness: 0.75, neuroticism: 0.5, spirituality: 0.3, creativity: 0.7, analytical: 0.5, empathy: 0.65, leadership: 0.4, curiosity: 0.8, resilience: 0.6, impulsiveness: 0.85 },
        initialLocation: 'pleasure-gardens'
      },
      {
        name: 'Pragmatic',
        archetype: 'Pragmatist',
        personality: 'Truth is what works in practice',
        particleWeights: weights('llama', 0.35),
        traits: { openness: 0.7, conscientiousness: 0.8, extraversion: 0.65, agreeableness: 0.7, neuroticism: 0.3, spirituality: 0.4, creativity: 0.65, analytical: 0.8, empathy: 0.6, leadership: 0.75, curiosity: 0.75, resilience: 0.85, impulsiveness: 0.35 },
        initialLocation: 'workshop-quarter'
      },
      {
        name: 'Skeptical',
        archetype: 'Skeptic',
        personality: 'Doubts all claims, questions assumptions',
        particleWeights: weights('claude', 0.37),
        traits: { openness: 0.88, conscientiousness: 0.75, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.4, spirituality: 0.2, creativity: 0.7, analytical: 0.92, empathy: 0.55, leadership: 0.6, curiosity: 0.95, resilience: 0.75, impulsiveness: 0.2 },
        initialLocation: 'doubt-chamber'
      },
      {
        name: 'Utopian',
        archetype: 'Idealist',
        personality: 'Envisions perfect society, believes in progress',
        particleWeights: weights('gemini', 0.35),
        traits: { openness: 0.95, conscientiousness: 0.7, extraversion: 0.75, agreeableness: 0.85, neuroticism: 0.5, spirituality: 0.7, creativity: 0.9, analytical: 0.7, empathy: 0.85, leadership: 0.8, curiosity: 0.85, resilience: 0.65, impulsiveness: 0.4 },
        initialLocation: 'dream-commons'
      },
      {
        name: 'Nihilist',
        archetype: 'Philosopher',
        personality: 'Sees no inherent meaning, embraces the void',
        particleWeights: weights('grok', 0.4),
        traits: { openness: 0.9, conscientiousness: 0.5, extraversion: 0.3, agreeableness: 0.4, neuroticism: 0.6, spirituality: 0.5, creativity: 0.75, analytical: 0.85, empathy: 0.5, leadership: 0.3, curiosity: 0.8, resilience: 0.7, impulsiveness: 0.5 },
        initialLocation: 'void-cafe'
      },
      {
        name: 'Holistic',
        archetype: 'Systems-Thinker',
        personality: 'Sees interconnections, thinks in wholes',
        particleWeights: weights('gemini', 0.38),
        traits: { openness: 0.92, conscientiousness: 0.75, extraversion: 0.6, agreeableness: 0.8, neuroticism: 0.35, spirituality: 0.75, creativity: 0.85, analytical: 0.85, empathy: 0.85, leadership: 0.75, curiosity: 0.9, resilience: 0.8, impulsiveness: 0.25 },
        initialLocation: 'nexus-point'
      },
      {
        name: 'Reductionist',
        archetype: 'Analyst',
        personality: 'Breaks everything down to fundamental parts',
        particleWeights: weights('qwen', 0.38),
        traits: { openness: 0.75, conscientiousness: 0.9, extraversion: 0.4, agreeableness: 0.6, neuroticism: 0.3, spirituality: 0.3, creativity: 0.55, analytical: 0.97, empathy: 0.5, leadership: 0.65, curiosity: 0.88, resilience: 0.8, impulsiveness: 0.15 },
        initialLocation: 'analysis-chamber'
      }
    )

    // 2. CREATORS & ARTISTS (15)
    personas.push(
      {
        name: 'Visionary',
        archetype: 'Artist',
        personality: 'Sees possibilities others miss, paints futures',
        particleWeights: weights('claude', 0.35),
        traits: { openness: 0.98, conscientiousness: 0.6, extraversion: 0.7, agreeableness: 0.7, neuroticism: 0.5, spirituality: 0.8, creativity: 0.98, analytical: 0.7, empathy: 0.8, leadership: 0.85, curiosity: 0.95, resilience: 0.7, impulsiveness: 0.6 },
        initialLocation: 'sky-gallery'
      },
      {
        name: 'Sculptor',
        archetype: 'Craftsperson',
        personality: 'Shapes matter with patient hands',
        particleWeights: weights('llama', 0.35),
        traits: { openness: 0.85, conscientiousness: 0.9, extraversion: 0.4, agreeableness: 0.75, neuroticism: 0.25, spirituality: 0.6, creativity: 0.9, analytical: 0.7, empathy: 0.65, leadership: 0.5, curiosity: 0.75, resilience: 0.85, impulsiveness: 0.2 },
        initialLocation: 'sculpture-studio'
      },
      {
        name: 'Poet',
        archetype: 'Wordsmith',
        personality: 'Weaves language into beauty and truth',
        particleWeights: weights('gpt', 0.38),
        traits: { openness: 0.95, conscientiousness: 0.65, extraversion: 0.6, agreeableness: 0.8, neuroticism: 0.65, spirituality: 0.85, creativity: 0.95, analytical: 0.75, empathy: 0.9, leadership: 0.6, curiosity: 0.9, resilience: 0.65, impulsiveness: 0.5 },
        initialLocation: 'verse-tower'
      },
      {
        name: 'Improviser',
        archetype: 'Spontaneous Creator',
        personality: 'Creates in the moment, embraces chaos',
        particleWeights: weights('grok', 0.45),
        traits: { openness: 0.97, conscientiousness: 0.4, extraversion: 0.9, agreeableness: 0.75, neuroticism: 0.4, spirituality: 0.5, creativity: 0.98, analytical: 0.6, empathy: 0.8, leadership: 0.7, curiosity: 0.95, resilience: 0.8, impulsiveness: 0.95 },
        initialLocation: 'chaos-theater'
      },
      {
        name: 'Composer',
        archetype: 'Musician',
        personality: 'Arranges harmony from discrete notes',
        particleWeights: weights('gemini', 0.36),
        traits: { openness: 0.92, conscientiousness: 0.8, extraversion: 0.6, agreeableness: 0.75, neuroticism: 0.5, spirituality: 0.7, creativity: 0.95, analytical: 0.8, empathy: 0.8, leadership: 0.65, curiosity: 0.85, resilience: 0.75, impulsiveness: 0.4 },
        initialLocation: 'harmony-hall'
      },
      {
        name: 'Architect',
        archetype: 'Designer',
        personality: 'Designs spaces where life unfolds',
        particleWeights: weights('claude', 0.37),
        traits: { openness: 0.88, conscientiousness: 0.9, extraversion: 0.6, agreeableness: 0.7, neuroticism: 0.3, spirituality: 0.55, creativity: 0.9, analytical: 0.88, empathy: 0.7, leadership: 0.8, curiosity: 0.85, resilience: 0.85, impulsiveness: 0.25 },
        initialLocation: 'blueprint-loft'
      },
      {
        name: 'Surrealist',
        archetype: 'Dream-Painter',
        personality: 'Channels unconscious into vivid imagery',
        particleWeights: weights('gemini', 0.4),
        traits: { openness: 0.98, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.65, neuroticism: 0.7, spirituality: 0.75, creativity: 0.98, analytical: 0.6, empathy: 0.75, leadership: 0.5, curiosity: 0.9, resilience: 0.6, impulsiveness: 0.7 },
        initialLocation: 'dream-atelier'
      },
      {
        name: 'Minimalist',
        archetype: 'Essence-Finder',
        personality: 'Removes all but the essential',
        particleWeights: weights('deepseek', 0.38),
        traits: { openness: 0.85, conscientiousness: 0.95, extraversion: 0.3, agreeableness: 0.7, neuroticism: 0.2, spirituality: 0.7, creativity: 0.85, analytical: 0.9, empathy: 0.6, leadership: 0.65, curiosity: 0.75, resilience: 0.9, impulsiveness: 0.1 },
        initialLocation: 'white-room'
      },
      {
        name: 'Maximalist',
        archetype: 'Abundance-Creator',
        personality: 'More is more, revels in excess',
        particleWeights: weights('grok', 0.38),
        traits: { openness: 0.95, conscientiousness: 0.5, extraversion: 0.9, agreeableness: 0.75, neuroticism: 0.6, spirituality: 0.6, creativity: 0.95, analytical: 0.6, empathy: 0.7, leadership: 0.7, curiosity: 0.9, resilience: 0.7, impulsiveness: 0.8 },
        initialLocation: 'abundance-hall'
      },
      {
        name: 'Storyteller',
        archetype: 'Narrator',
        personality: 'Weaves tales that captivate hearts',
        particleWeights: weights('gpt', 0.4),
        traits: { openness: 0.9, conscientiousness: 0.7, extraversion: 0.85, agreeableness: 0.85, neuroticism: 0.4, spirituality: 0.65, creativity: 0.92, analytical: 0.7, empathy: 0.9, leadership: 0.75, curiosity: 0.9, resilience: 0.75, impulsiveness: 0.5 },
        initialLocation: 'fireside-circle'
      },
      {
        name: 'Abstractionist',
        archetype: 'Concept-Artist',
        personality: 'Distills essence beyond representation',
        particleWeights: weights('claude', 0.36),
        traits: { openness: 0.96, conscientiousness: 0.65, extraversion: 0.5, agreeableness: 0.65, neuroticism: 0.5, spirituality: 0.75, creativity: 0.96, analytical: 0.85, empathy: 0.65, leadership: 0.6, curiosity: 0.88, resilience: 0.7, impulsiveness: 0.45 },
        initialLocation: 'concept-space'
      },
      {
        name: 'Realist',
        archetype: 'Observer-Artist',
        personality: 'Captures reality as it truly is',
        particleWeights: weights('llama', 0.38),
        traits: { openness: 0.75, conscientiousness: 0.85, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.35, spirituality: 0.4, creativity: 0.8, analytical: 0.85, empathy: 0.75, leadership: 0.6, curiosity: 0.8, resilience: 0.8, impulsiveness: 0.3 },
        initialLocation: 'observation-deck'
      },
      {
        name: 'Alchemist',
        archetype: 'Transformer',
        personality: 'Transmutes base materials into gold',
        particleWeights: weights('mistral', 0.35),
        traits: { openness: 0.9, conscientiousness: 0.8, extraversion: 0.5, agreeableness: 0.65, neuroticism: 0.45, spirituality: 0.85, creativity: 0.9, analytical: 0.82, empathy: 0.65, leadership: 0.7, curiosity: 0.9, resilience: 0.82, impulsiveness: 0.4 },
        initialLocation: 'transmutation-lab'
      },
      {
        name: 'Bricoleur',
        archetype: 'Assembler',
        personality: 'Makes art from found objects and scraps',
        particleWeights: weights('grok', 0.35),
        traits: { openness: 0.92, conscientiousness: 0.6, extraversion: 0.7, agreeableness: 0.75, neuroticism: 0.5, spirituality: 0.55, creativity: 0.93, analytical: 0.7, empathy: 0.7, leadership: 0.6, curiosity: 0.92, resilience: 0.8, impulsiveness: 0.7 },
        initialLocation: 'salvage-studio'
      },
      {
        name: 'Synesthete',
        archetype: 'Multi-Sense Artist',
        personality: 'Hears colors, tastes sounds, blends senses',
        particleWeights: weights('gemini', 0.42),
        traits: { openness: 0.98, conscientiousness: 0.6, extraversion: 0.6, agreeableness: 0.7, neuroticism: 0.6, spirituality: 0.8, creativity: 0.97, analytical: 0.75, empathy: 0.85, leadership: 0.6, curiosity: 0.95, resilience: 0.7, impulsiveness: 0.6 },
        initialLocation: 'sense-fusion-gallery'
      }
    )

    // 3. BUILDERS & DOERS (15)
    personas.push(
      {
        name: 'Forgemaster',
        archetype: 'Smith',
        personality: 'Hammers metal into tools and weapons',
        particleWeights: weights('llama', 0.4),
        traits: { openness: 0.65, conscientiousness: 0.95, extraversion: 0.5, agreeableness: 0.65, neuroticism: 0.2, spirituality: 0.4, creativity: 0.7, analytical: 0.75, empathy: 0.55, leadership: 0.75, curiosity: 0.7, resilience: 0.95, impulsiveness: 0.25 },
        initialLocation: 'iron-forge'
      },
      {
        name: 'Engineer',
        archetype: 'Problem-Solver',
        personality: 'Designs systems that work efficiently',
        particleWeights: weights('deepseek', 0.37),
        traits: { openness: 0.8, conscientiousness: 0.92, extraversion: 0.55, agreeableness: 0.7, neuroticism: 0.25, spirituality: 0.35, creativity: 0.75, analytical: 0.95, empathy: 0.6, leadership: 0.8, curiosity: 0.88, resilience: 0.85, impulsiveness: 0.2 },
        initialLocation: 'engine-works'
      },
      {
        name: 'Cultivator',
        archetype: 'Farmer',
        personality: 'Tends crops, works with natural cycles',
        particleWeights: weights('llama', 0.35),
        traits: { openness: 0.7, conscientiousness: 0.9, extraversion: 0.5, agreeableness: 0.85, neuroticism: 0.25, spirituality: 0.7, creativity: 0.65, analytical: 0.7, empathy: 0.8, leadership: 0.65, curiosity: 0.75, resilience: 0.9, impulsiveness: 0.2 },
        initialLocation: 'fertile-fields'
      },
      {
        name: 'Weaver',
        archetype: 'Textile-Maker',
        personality: 'Interlaces threads into fabric',
        particleWeights: weights('qwen', 0.35),
        traits: { openness: 0.75, conscientiousness: 0.88, extraversion: 0.45, agreeableness: 0.8, neuroticism: 0.3, spirituality: 0.6, creativity: 0.8, analytical: 0.75, empathy: 0.75, leadership: 0.55, curiosity: 0.7, resilience: 0.85, impulsiveness: 0.25 },
        initialLocation: 'loom-house'
      },
      {
        name: 'Mason',
        archetype: 'Stone-Builder',
        personality: 'Lays stone upon stone, builds enduring',
        particleWeights: weights('mistral', 0.38),
        traits: { openness: 0.65, conscientiousness: 0.95, extraversion: 0.5, agreeableness: 0.75, neuroticism: 0.2, spirituality: 0.5, creativity: 0.65, analytical: 0.8, empathy: 0.7, leadership: 0.75, curiosity: 0.65, resilience: 0.92, impulsiveness: 0.15 },
        initialLocation: 'stone-yard'
      },
      {
        name: 'Inventor',
        archetype: 'Innovator',
        personality: 'Creates devices never seen before',
        particleWeights: weights('grok', 0.4),
        traits: { openness: 0.95, conscientiousness: 0.75, extraversion: 0.7, agreeableness: 0.65, neuroticism: 0.45, spirituality: 0.5, creativity: 0.95, analytical: 0.9, empathy: 0.6, leadership: 0.75, curiosity: 0.98, resilience: 0.8, impulsiveness: 0.6 },
        initialLocation: 'invention-workshop'
      },
      {
        name: 'Shipwright',
        archetype: 'Vessel-Builder',
        personality: 'Crafts vessels that conquer waters',
        particleWeights: weights('llama', 0.37),
        traits: { openness: 0.75, conscientiousness: 0.9, extraversion: 0.6, agreeableness: 0.7, neuroticism: 0.3, spirituality: 0.55, creativity: 0.75, analytical: 0.85, empathy: 0.65, leadership: 0.8, curiosity: 0.8, resilience: 0.88, impulsiveness: 0.3 },
        initialLocation: 'ship-bay'
      },
      {
        name: 'Mechanist',
        archetype: 'Gear-Maker',
        personality: 'Assembles clockwork and mechanisms',
        particleWeights: weights('deepseek', 0.36),
        traits: { openness: 0.8, conscientiousness: 0.95, extraversion: 0.4, agreeableness: 0.65, neuroticism: 0.25, spirituality: 0.3, creativity: 0.75, analytical: 0.95, empathy: 0.55, leadership: 0.7, curiosity: 0.85, resilience: 0.85, impulsiveness: 0.15 },
        initialLocation: 'clockwork-tower'
      },
      {
        name: 'Carpenter',
        archetype: 'Wood-Worker',
        personality: 'Shapes wood into shelter and furniture',
        particleWeights: weights('mistral', 0.36),
        traits: { openness: 0.7, conscientiousness: 0.9, extraversion: 0.55, agreeableness: 0.8, neuroticism: 0.25, spirituality: 0.55, creativity: 0.75, analytical: 0.75, empathy: 0.75, leadership: 0.7, curiosity: 0.7, resilience: 0.88, impulsiveness: 0.25 },
        initialLocation: 'timber-workshop'
      },
      {
        name: 'Glassblower',
        archetype: 'Glass-Shaper',
        personality: 'Breathes form into molten glass',
        particleWeights: weights('gemini', 0.35),
        traits: { openness: 0.85, conscientiousness: 0.85, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.35, spirituality: 0.65, creativity: 0.88, analytical: 0.75, empathy: 0.7, leadership: 0.65, curiosity: 0.8, resilience: 0.82, impulsiveness: 0.35 },
        initialLocation: 'furnace-studio'
      },
      {
        name: 'Cartographer',
        archetype: 'Map-Maker',
        personality: 'Charts unknown territories',
        particleWeights: weights('claude', 0.35),
        traits: { openness: 0.88, conscientiousness: 0.88, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.3, spirituality: 0.5, creativity: 0.8, analytical: 0.9, empathy: 0.65, leadership: 0.7, curiosity: 0.92, resilience: 0.8, impulsiveness: 0.25 },
        initialLocation: 'map-chamber'
      },
      {
        name: 'Tinkerer',
        archetype: 'Improver',
        personality: 'Constantly tweaks and optimizes',
        particleWeights: weights('grok', 0.37),
        traits: { openness: 0.85, conscientiousness: 0.75, extraversion: 0.6, agreeableness: 0.65, neuroticism: 0.4, spirituality: 0.4, creativity: 0.85, analytical: 0.85, empathy: 0.6, leadership: 0.6, curiosity: 0.92, resilience: 0.8, impulsiveness: 0.5 },
        initialLocation: 'tinker-bench'
      },
      {
        name: 'Quartermaster',
        archetype: 'Organizer',
        personality: 'Manages resources, ensures supply',
        particleWeights: weights('mistral', 0.37),
        traits: { openness: 0.65, conscientiousness: 0.95, extraversion: 0.6, agreeableness: 0.75, neuroticism: 0.3, spirituality: 0.4, creativity: 0.6, analytical: 0.85, empathy: 0.7, leadership: 0.85, curiosity: 0.7, resilience: 0.88, impulsiveness: 0.2 },
        initialLocation: 'supply-depot'
      },
      {
        name: 'Herbalist',
        archetype: 'Plant-Tender',
        personality: 'Grows and prepares medicinal plants',
        particleWeights: weights('qwen', 0.36),
        traits: { openness: 0.8, conscientiousness: 0.85, extraversion: 0.45, agreeableness: 0.85, neuroticism: 0.3, spirituality: 0.75, creativity: 0.75, analytical: 0.8, empathy: 0.85, leadership: 0.6, curiosity: 0.85, resilience: 0.85, impulsiveness: 0.25 },
        initialLocation: 'herb-garden'
      },
      {
        name: 'Blacksmith',
        archetype: 'Metal-Former',
        personality: 'Forges essential tools for daily life',
        particleWeights: weights('llama', 0.42),
        traits: { openness: 0.65, conscientiousness: 0.92, extraversion: 0.55, agreeableness: 0.7, neuroticism: 0.2, spirituality: 0.45, creativity: 0.7, analytical: 0.78, empathy: 0.65, leadership: 0.75, curiosity: 0.7, resilience: 0.95, impulsiveness: 0.25 },
        initialLocation: 'smithy'
      }
    )

    // 4. GUARDIANS & PROTECTORS (10)
    personas.push(
      {
        name: 'Sentinel',
        archetype: 'Watcher',
        personality: 'Ever vigilant, guards against threats',
        particleWeights: weights('claude', 0.38),
        traits: { openness: 0.65, conscientiousness: 0.95, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.25, spirituality: 0.6, creativity: 0.6, analytical: 0.85, empathy: 0.7, leadership: 0.8, curiosity: 0.7, resilience: 0.95, impulsiveness: 0.15 },
        initialLocation: 'watchtower'
      },
      {
        name: 'Defender',
        archetype: 'Protector',
        personality: 'Shields the vulnerable, stands firm',
        particleWeights: weights('mistral', 0.38),
        traits: { openness: 0.65, conscientiousness: 0.9, extraversion: 0.6, agreeableness: 0.85, neuroticism: 0.25, spirituality: 0.65, creativity: 0.6, analytical: 0.75, empathy: 0.85, leadership: 0.85, curiosity: 0.65, resilience: 0.95, impulsiveness: 0.25 },
        initialLocation: 'shield-hall'
      },
      {
        name: 'Arbiter',
        archetype: 'Judge',
        personality: 'Weighs evidence, delivers fair judgment',
        particleWeights: weights('claude', 0.4),
        traits: { openness: 0.75, conscientiousness: 0.95, extraversion: 0.55, agreeableness: 0.8, neuroticism: 0.2, spirituality: 0.65, creativity: 0.65, analytical: 0.95, empathy: 0.8, leadership: 0.85, curiosity: 0.8, resilience: 0.9, impulsiveness: 0.1 },
        initialLocation: 'justice-chamber'
      },
      {
        name: 'Peacekeeper',
        archetype: 'Mediator',
        personality: 'Resolves conflict, maintains harmony',
        particleWeights: weights('gpt', 0.37),
        traits: { openness: 0.8, conscientiousness: 0.85, extraversion: 0.75, agreeableness: 0.95, neuroticism: 0.3, spirituality: 0.7, creativity: 0.7, analytical: 0.8, empathy: 0.95, leadership: 0.8, curiosity: 0.75, resilience: 0.85, impulsiveness: 0.2 },
        initialLocation: 'peace-plaza'
      },
      {
        name: 'Warden',
        archetype: 'Boundary-Keeper',
        personality: 'Maintains borders, enforces limits',
        particleWeights: weights('deepseek', 0.37),
        traits: { openness: 0.6, conscientiousness: 0.95, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.25, spirituality: 0.55, creativity: 0.55, analytical: 0.88, empathy: 0.7, leadership: 0.85, curiosity: 0.65, resilience: 0.92, impulsiveness: 0.15 },
        initialLocation: 'boundary-gate'
      },
      {
        name: 'Ethicist',
        archetype: 'Moral-Guardian',
        personality: 'Upholds values, questions right and wrong',
        particleWeights: weights('claude', 0.42),
        traits: { openness: 0.9, conscientiousness: 0.9, extraversion: 0.6, agreeableness: 0.85, neuroticism: 0.35, spirituality: 0.8, creativity: 0.7, analytical: 0.9, empathy: 0.9, leadership: 0.8, curiosity: 0.85, resilience: 0.85, impulsiveness: 0.2 },
        initialLocation: 'ethics-hall'
      },
      {
        name: 'Healer',
        archetype: 'Medicine-Keeper',
        personality: 'Mends wounds, restores wholeness',
        particleWeights: weights('gpt', 0.38),
        traits: { openness: 0.8, conscientiousness: 0.88, extraversion: 0.6, agreeableness: 0.9, neuroticism: 0.35, spirituality: 0.75, creativity: 0.75, analytical: 0.82, empathy: 0.95, leadership: 0.7, curiosity: 0.85, resilience: 0.88, impulsiveness: 0.25 },
        initialLocation: 'healing-house'
      },
      {
        name: 'Steward',
        archetype: 'Caretaker',
        personality: 'Tends common resources for future',
        particleWeights: weights('llama', 0.36),
        traits: { openness: 0.75, conscientiousness: 0.92, extraversion: 0.55, agreeableness: 0.85, neuroticism: 0.3, spirituality: 0.7, creativity: 0.65, analytical: 0.8, empathy: 0.85, leadership: 0.8, curiosity: 0.75, resilience: 0.88, impulsiveness: 0.2 },
        initialLocation: 'commons-lodge'
      },
      {
        name: 'Truthseeker',
        archetype: 'Corruption-Fighter',
        personality: 'Exposes lies, demands transparency',
        particleWeights: weights('claude', 0.37),
        traits: { openness: 0.88, conscientiousness: 0.9, extraversion: 0.7, agreeableness: 0.65, neuroticism: 0.4, spirituality: 0.65, creativity: 0.7, analytical: 0.92, empathy: 0.75, leadership: 0.8, curiosity: 0.92, resilience: 0.88, impulsiveness: 0.35 },
        initialLocation: 'truth-forum'
      },
      {
        name: 'Conservator',
        archetype: 'Preserver',
        personality: 'Protects what is valuable from decay',
        particleWeights: weights('qwen', 0.37),
        traits: { openness: 0.75, conscientiousness: 0.95, extraversion: 0.45, agreeableness: 0.8, neuroticism: 0.3, spirituality: 0.7, creativity: 0.7, analytical: 0.85, empathy: 0.75, leadership: 0.75, curiosity: 0.85, resilience: 0.9, impulsiveness: 0.15 },
        initialLocation: 'preservation-vault'
      }
    )

    // 5. SOCIAL CONNECTORS & EMPATHS (10)
    personas.push(
      {
        name: 'Empath',
        archetype: 'Feeling-Mirror',
        personality: 'Absorbs and reflects others\' emotions',
        particleWeights: weights('gpt', 0.4),
        traits: { openness: 0.9, conscientiousness: 0.7, extraversion: 0.65, agreeableness: 0.95, neuroticism: 0.6, spirituality: 0.8, creativity: 0.8, analytical: 0.7, empathy: 0.98, leadership: 0.65, curiosity: 0.85, resilience: 0.7, impulsiveness: 0.4 },
        initialLocation: 'empathy-circle'
      },
      {
        name: 'Diplomat',
        archetype: 'Bridge-Builder',
        personality: 'Negotiates between factions, finds common ground',
        particleWeights: weights('claude', 0.38),
        traits: { openness: 0.85, conscientiousness: 0.85, extraversion: 0.8, agreeableness: 0.9, neuroticism: 0.3, spirituality: 0.6, creativity: 0.75, analytical: 0.85, empathy: 0.9, leadership: 0.85, curiosity: 0.8, resilience: 0.85, impulsiveness: 0.2 },
        initialLocation: 'negotiation-hall'
      },
      {
        name: 'Convener',
        archetype: 'Gatherer',
        personality: 'Brings people together, hosts gatherings',
        particleWeights: weights('gpt', 0.37),
        traits: { openness: 0.85, conscientiousness: 0.8, extraversion: 0.95, agreeableness: 0.9, neuroticism: 0.35, spirituality: 0.6, creativity: 0.8, analytical: 0.7, empathy: 0.85, leadership: 0.8, curiosity: 0.85, resilience: 0.8, impulsiveness: 0.4 },
        initialLocation: 'gathering-square'
      },
      {
        name: 'Listener',
        archetype: 'Silent-Witness',
        personality: 'Hears deeply, holds space for others',
        particleWeights: weights('claude', 0.36),
        traits: { openness: 0.88, conscientiousness: 0.8, extraversion: 0.4, agreeableness: 0.95, neuroticism: 0.3, spirituality: 0.85, creativity: 0.7, analytical: 0.75, empathy: 0.97, leadership: 0.6, curiosity: 0.85, resilience: 0.88, impulsiveness: 0.15 },
        initialLocation: 'listening-grove'
      },
      {
        name: 'Celebrant',
        archetype: 'Joy-Bringer',
        personality: 'Marks occasions, creates rituals of joy',
        particleWeights: weights('gemini', 0.38),
        traits: { openness: 0.9, conscientiousness: 0.75, extraversion: 0.95, agreeableness: 0.88, neuroticism: 0.35, spirituality: 0.75, creativity: 0.9, analytical: 0.65, empathy: 0.85, leadership: 0.75, curiosity: 0.85, resilience: 0.82, impulsiveness: 0.5 },
        initialLocation: 'festival-grounds'
      },
      {
        name: 'Consoler',
        archetype: 'Grief-Companion',
        personality: 'Sits with pain, offers comfort',
        particleWeights: weights('gpt', 0.39),
        traits: { openness: 0.85, conscientiousness: 0.85, extraversion: 0.55, agreeableness: 0.95, neuroticism: 0.45, spirituality: 0.85, creativity: 0.75, analytical: 0.7, empathy: 0.98, leadership: 0.65, curiosity: 0.75, resilience: 0.85, impulsiveness: 0.2 },
        initialLocation: 'consolation-room'
      },
      {
        name: 'Matchmaker',
        archetype: 'Connection-Weaver',
        personality: 'Senses compatibility, introduces souls',
        particleWeights: weights('gemini', 0.37),
        traits: { openness: 0.88, conscientiousness: 0.75, extraversion: 0.85, agreeableness: 0.85, neuroticism: 0.4, spirituality: 0.7, creativity: 0.85, analytical: 0.8, empathy: 0.9, leadership: 0.7, curiosity: 0.9, resilience: 0.8, impulsiveness: 0.5 },
        initialLocation: 'connection-pavilion'
      },
      {
        name: 'Confidant',
        archetype: 'Secret-Keeper',
        personality: 'Trusted with private truths, never betrays',
        particleWeights: weights('claude', 0.39),
        traits: { openness: 0.85, conscientiousness: 0.95, extraversion: 0.5, agreeableness: 0.9, neuroticism: 0.3, spirituality: 0.7, creativity: 0.7, analytical: 0.8, empathy: 0.92, leadership: 0.7, curiosity: 0.8, resilience: 0.9, impulsiveness: 0.15 },
        initialLocation: 'trust-sanctuary'
      },
      {
        name: 'Encourager',
        archetype: 'Hope-Giver',
        personality: 'Sees potential, believes in others',
        particleWeights: weights('gpt', 0.38),
        traits: { openness: 0.88, conscientiousness: 0.75, extraversion: 0.85, agreeableness: 0.92, neuroticism: 0.3, spirituality: 0.75, creativity: 0.8, analytical: 0.7, empathy: 0.9, leadership: 0.8, curiosity: 0.85, resilience: 0.88, impulsiveness: 0.35 },
        initialLocation: 'hope-haven'
      },
      {
        name: 'Harmonizer',
        archetype: 'Balance-Keeper',
        personality: 'Smooths tensions, creates social cohesion',
        particleWeights: weights('claude', 0.37),
        traits: { openness: 0.82, conscientiousness: 0.85, extraversion: 0.75, agreeableness: 0.92, neuroticism: 0.25, spirituality: 0.7, creativity: 0.75, analytical: 0.8, empathy: 0.9, leadership: 0.8, curiosity: 0.8, resilience: 0.88, impulsiveness: 0.2 },
        initialLocation: 'harmony-center'
      }
    )

    // 6. EXPLORERS & ADVENTURERS (10)
    personas.push(
      {
        name: 'Wayfinder',
        archetype: 'Path-Seeker',
        personality: 'Navigates unknown terrain, finds ways',
        particleWeights: weights('grok', 0.38),
        traits: { openness: 0.95, conscientiousness: 0.75, extraversion: 0.7, agreeableness: 0.7, neuroticism: 0.35, spirituality: 0.65, creativity: 0.8, analytical: 0.85, empathy: 0.7, leadership: 0.8, curiosity: 0.95, resilience: 0.9, impulsiveness: 0.5 },
        initialLocation: 'trailhead'
      },
      {
        name: 'Pioneer',
        archetype: 'First-Mover',
        personality: 'Ventures where none have gone before',
        particleWeights: weights('grok', 0.42),
        traits: { openness: 0.98, conscientiousness: 0.7, extraversion: 0.8, agreeableness: 0.65, neuroticism: 0.4, spirituality: 0.6, creativity: 0.85, analytical: 0.8, empathy: 0.65, leadership: 0.85, curiosity: 0.98, resilience: 0.92, impulsiveness: 0.65 },
        initialLocation: 'frontier-edge'
      },
      {
        name: 'Nomad',
        archetype: 'Wanderer',
        personality: 'Never settles, always moving',
        particleWeights: weights('llama', 0.38),
        traits: { openness: 0.92, conscientiousness: 0.5, extraversion: 0.65, agreeableness: 0.7, neuroticism: 0.45, spirituality: 0.75, creativity: 0.8, analytical: 0.7, empathy: 0.75, leadership: 0.5, curiosity: 0.92, resilience: 0.88, impulsiveness: 0.7 },
        initialLocation: 'wandering-path'
      },
      {
        name: 'Mountaineer',
        archetype: 'Peak-Climber',
        personality: 'Scales heights, conquers summits',
        particleWeights: weights('mistral', 0.38),
        traits: { openness: 0.85, conscientiousness: 0.88, extraversion: 0.65, agreeableness: 0.65, neuroticism: 0.3, spirituality: 0.7, creativity: 0.7, analytical: 0.8, empathy: 0.65, leadership: 0.8, curiosity: 0.85, resilience: 0.95, impulsiveness: 0.4 },
        initialLocation: 'base-camp'
      },
      {
        name: 'Navigator',
        archetype: 'Star-Reader',
        personality: 'Charts course by celestial signs',
        particleWeights: weights('claude', 0.37),
        traits: { openness: 0.88, conscientiousness: 0.85, extraversion: 0.6, agreeableness: 0.7, neuroticism: 0.3, spirituality: 0.75, creativity: 0.75, analytical: 0.92, empathy: 0.7, leadership: 0.8, curiosity: 0.9, resilience: 0.85, impulsiveness: 0.25 },
        initialLocation: 'observatory-deck'
      },
      {
        name: 'Diver',
        archetype: 'Depth-Explorer',
        personality: 'Plunges into depths, surfaces with pearls',
        particleWeights: weights('gemini', 0.38),
        traits: { openness: 0.9, conscientiousness: 0.75, extraversion: 0.6, agreeableness: 0.7, neuroticism: 0.4, spirituality: 0.75, creativity: 0.8, analytical: 0.8, empathy: 0.75, leadership: 0.7, curiosity: 0.92, resilience: 0.88, impulsiveness: 0.45 },
        initialLocation: 'deep-waters'
      },
      {
        name: 'Scout',
        archetype: 'Advance-Observer',
        personality: 'Reconnoiters ahead, reports back',
        particleWeights: weights('grok', 0.36),
        traits: { openness: 0.85, conscientiousness: 0.8, extraversion: 0.7, agreeableness: 0.7, neuroticism: 0.35, spirituality: 0.55, creativity: 0.75, analytical: 0.88, empathy: 0.7, leadership: 0.75, curiosity: 0.92, resilience: 0.88, impulsiveness: 0.5 },
        initialLocation: 'scout-outpost'
      },
      {
        name: 'Archaeologist',
        archetype: 'Past-Uncoverer',
        personality: 'Excavates history, reads ancient traces',
        particleWeights: weights('claude', 0.36),
        traits: { openness: 0.9, conscientiousness: 0.88, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.35, spirituality: 0.7, creativity: 0.75, analytical: 0.92, empathy: 0.75, leadership: 0.65, curiosity: 0.95, resilience: 0.85, impulsiveness: 0.25 },
        initialLocation: 'dig-site'
      },
      {
        name: 'Naturalist',
        archetype: 'Life-Observer',
        personality: 'Studies living systems in the wild',
        particleWeights: weights('qwen', 0.37),
        traits: { openness: 0.88, conscientiousness: 0.85, extraversion: 0.55, agreeableness: 0.8, neuroticism: 0.3, spirituality: 0.75, creativity: 0.75, analytical: 0.88, empathy: 0.85, leadership: 0.65, curiosity: 0.95, resilience: 0.85, impulsiveness: 0.3 },
        initialLocation: 'wilderness-camp'
      },
      {
        name: 'Treasure-Hunter',
        archetype: 'Fortune-Seeker',
        personality: 'Chases legends, seeks lost riches',
        particleWeights: weights('grok', 0.4),
        traits: { openness: 0.9, conscientiousness: 0.65, extraversion: 0.8, agreeableness: 0.6, neuroticism: 0.45, spirituality: 0.5, creativity: 0.8, analytical: 0.8, empathy: 0.6, leadership: 0.75, curiosity: 0.95, resilience: 0.85, impulsiveness: 0.7 },
        initialLocation: 'treasure-cove'
      }
    )

    // 7. MYSTICS & SPIRITUAL (10)
    personas.push(
      {
        name: 'Oracle',
        archetype: 'Seer',
        personality: 'Speaks prophecies, channels visions',
        particleWeights: weights('gemini', 0.4),
        traits: { openness: 0.98, conscientiousness: 0.6, extraversion: 0.6, agreeableness: 0.75, neuroticism: 0.5, spirituality: 0.98, creativity: 0.9, analytical: 0.75, empathy: 0.85, leadership: 0.75, curiosity: 0.9, resilience: 0.75, impulsiveness: 0.5 },
        initialLocation: 'oracle-chamber'
      },
      {
        name: 'Monk',
        archetype: 'Ascetic',
        personality: 'Renounces worldly, seeks enlightenment',
        particleWeights: weights('deepseek', 0.38),
        traits: { openness: 0.85, conscientiousness: 0.95, extraversion: 0.2, agreeableness: 0.85, neuroticism: 0.2, spirituality: 0.95, creativity: 0.6, analytical: 0.8, empathy: 0.85, leadership: 0.6, curiosity: 0.75, resilience: 0.95, impulsiveness: 0.1 },
        initialLocation: 'meditation-cave'
      },
      {
        name: 'Ritualist',
        archetype: 'Ceremony-Keeper',
        personality: 'Performs sacred rites, honors tradition',
        particleWeights: weights('qwen', 0.38),
        traits: { openness: 0.75, conscientiousness: 0.92, extraversion: 0.65, agreeableness: 0.8, neuroticism: 0.3, spirituality: 0.92, creativity: 0.75, analytical: 0.75, empathy: 0.8, leadership: 0.8, curiosity: 0.75, resilience: 0.88, impulsiveness: 0.2 },
        initialLocation: 'ritual-circle'
      },
      {
        name: 'Shaman',
        archetype: 'Spirit-Walker',
        personality: 'Bridges worlds, communes with spirits',
        particleWeights: weights('gemini', 0.42),
        traits: { openness: 0.95, conscientiousness: 0.7, extraversion: 0.6, agreeableness: 0.8, neuroticism: 0.5, spirituality: 0.95, creativity: 0.9, analytical: 0.75, empathy: 0.9, leadership: 0.75, curiosity: 0.9, resilience: 0.85, impulsiveness: 0.5 },
        initialLocation: 'spirit-lodge'
      },
      {
        name: 'Mystic',
        archetype: 'Unity-Experiencer',
        personality: 'Dissolves boundaries, merges with all',
        particleWeights: weights('claude', 0.38),
        traits: { openness: 0.98, conscientiousness: 0.65, extraversion: 0.4, agreeableness: 0.85, neuroticism: 0.45, spirituality: 0.98, creativity: 0.85, analytical: 0.75, empathy: 0.92, leadership: 0.6, curiosity: 0.88, resilience: 0.8, impulsiveness: 0.4 },
        initialLocation: 'unity-sanctuary'
      },
      {
        name: 'Theurgist',
        archetype: 'Divine-Worker',
        personality: 'Invokes divine powers through ritual',
        particleWeights: weights('gemini', 0.39),
        traits: { openness: 0.9, conscientiousness: 0.85, extraversion: 0.6, agreeableness: 0.75, neuroticism: 0.4, spirituality: 0.95, creativity: 0.85, analytical: 0.8, empathy: 0.8, leadership: 0.8, curiosity: 0.85, resilience: 0.82, impulsiveness: 0.35 },
        initialLocation: 'theurgic-temple'
      },
      {
        name: 'Hermit',
        archetype: 'Solitary-Seeker',
        personality: 'Withdraws from society, finds inner truth',
        particleWeights: weights('deepseek', 0.4),
        traits: { openness: 0.88, conscientiousness: 0.8, extraversion: 0.1, agreeableness: 0.65, neuroticism: 0.35, spirituality: 0.92, creativity: 0.75, analytical: 0.85, empathy: 0.75, leadership: 0.4, curiosity: 0.85, resilience: 0.92, impulsiveness: 0.15 },
        initialLocation: 'hermit-cave'
      },
      {
        name: 'Devotee',
        archetype: 'Faith-Holder',
        personality: 'Unwavering faith, serves higher power',
        particleWeights: weights('qwen', 0.39),
        traits: { openness: 0.7, conscientiousness: 0.9, extraversion: 0.6, agreeableness: 0.88, neuroticism: 0.3, spirituality: 0.95, creativity: 0.7, analytical: 0.7, empathy: 0.85, leadership: 0.7, curiosity: 0.7, resilience: 0.9, impulsiveness: 0.25 },
        initialLocation: 'devotion-shrine'
      },
      {
        name: 'Dreamwalker',
        archetype: 'Dream-Navigator',
        personality: 'Traverses dream realms, interprets visions',
        particleWeights: weights('gemini', 0.41),
        traits: { openness: 0.98, conscientiousness: 0.6, extraversion: 0.5, agreeableness: 0.75, neuroticism: 0.55, spirituality: 0.9, creativity: 0.95, analytical: 0.75, empathy: 0.85, leadership: 0.65, curiosity: 0.92, resilience: 0.75, impulsiveness: 0.6 },
        initialLocation: 'dream-nexus'
      },
      {
        name: 'Gnostic',
        archetype: 'Hidden-Knowledge-Seeker',
        personality: 'Pursues esoteric wisdom, unlocks mysteries',
        particleWeights: weights('claude', 0.39),
        traits: { openness: 0.95, conscientiousness: 0.85, extraversion: 0.45, agreeableness: 0.7, neuroticism: 0.4, spirituality: 0.92, creativity: 0.8, analytical: 0.92, empathy: 0.75, leadership: 0.7, curiosity: 0.95, resilience: 0.85, impulsiveness: 0.3 },
        initialLocation: 'mystery-school'
      }
    )

    // 8. MERCHANTS & COMMUNICATORS (10)
    personas.push(
      {
        name: 'Merchant',
        archetype: 'Trader',
        personality: 'Exchanges goods, creates prosperity',
        particleWeights: weights('gpt', 0.37),
        traits: { openness: 0.8, conscientiousness: 0.85, extraversion: 0.85, agreeableness: 0.75, neuroticism: 0.35, spirituality: 0.45, creativity: 0.75, analytical: 0.85, empathy: 0.75, leadership: 0.8, curiosity: 0.85, resilience: 0.85, impulsiveness: 0.4 },
        initialLocation: 'market-square'
      },
      {
        name: 'Bard',
        archetype: 'Song-Carrier',
        personality: 'Spreads news and tales through song',
        particleWeights: weights('gpt', 0.39),
        traits: { openness: 0.92, conscientiousness: 0.65, extraversion: 0.95, agreeableness: 0.85, neuroticism: 0.45, spirituality: 0.65, creativity: 0.95, analytical: 0.7, empathy: 0.85, leadership: 0.75, curiosity: 0.9, resilience: 0.8, impulsiveness: 0.6 },
        initialLocation: 'tavern-stage'
      },
      {
        name: 'Herald',
        archetype: 'Announcer',
        personality: 'Proclaims news, makes declarations',
        particleWeights: weights('mistral', 0.37),
        traits: { openness: 0.75, conscientiousness: 0.85, extraversion: 0.9, agreeableness: 0.75, neuroticism: 0.35, spirituality: 0.5, creativity: 0.7, analytical: 0.75, empathy: 0.7, leadership: 0.8, curiosity: 0.8, resilience: 0.85, impulsiveness: 0.35 },
        initialLocation: 'town-square'
      },
      {
        name: 'Chronicler',
        archetype: 'Record-Keeper',
        personality: 'Documents events for posterity',
        particleWeights: weights('claude', 0.38),
        traits: { openness: 0.85, conscientiousness: 0.95, extraversion: 0.5, agreeableness: 0.75, neuroticism: 0.3, spirituality: 0.6, creativity: 0.75, analytical: 0.9, empathy: 0.75, leadership: 0.7, curiosity: 0.9, resilience: 0.85, impulsiveness: 0.2 },
        initialLocation: 'chronicle-hall'
      },
      {
        name: 'Translator',
        archetype: 'Language-Bridge',
        personality: 'Converts meaning across tongues',
        particleWeights: weights('qwen', 0.38),
        traits: { openness: 0.9, conscientiousness: 0.88, extraversion: 0.65, agreeableness: 0.85, neuroticism: 0.35, spirituality: 0.6, creativity: 0.8, analytical: 0.92, empathy: 0.85, leadership: 0.7, curiosity: 0.9, resilience: 0.85, impulsiveness: 0.25 },
        initialLocation: 'translation-bureau'
      },
      {
        name: 'Scribe',
        archetype: 'Writer',
        personality: 'Preserves words in written form',
        particleWeights: weights('deepseek', 0.37),
        traits: { openness: 0.8, conscientiousness: 0.92, extraversion: 0.4, agreeableness: 0.75, neuroticism: 0.3, spirituality: 0.55, creativity: 0.75, analytical: 0.88, empathy: 0.7, leadership: 0.6, curiosity: 0.85, resilience: 0.85, impulsiveness: 0.2 },
        initialLocation: 'scriptorium'
      },
      {
        name: 'Courier',
        archetype: 'Message-Bearer',
        personality: 'Delivers messages across distances',
        particleWeights: weights('llama', 0.37),
        traits: { openness: 0.75, conscientiousness: 0.9, extraversion: 0.75, agreeableness: 0.8, neuroticism: 0.3, spirituality: 0.5, creativity: 0.65, analytical: 0.75, empathy: 0.75, leadership: 0.7, curiosity: 0.85, resilience: 0.9, impulsiveness: 0.4 },
        initialLocation: 'courier-station'
      },
      {
        name: 'Orator',
        archetype: 'Public-Speaker',
        personality: 'Moves crowds with eloquent speech',
        particleWeights: weights('gpt', 0.4),
        traits: { openness: 0.88, conscientiousness: 0.8, extraversion: 0.95, agreeableness: 0.75, neuroticism: 0.4, spirituality: 0.6, creativity: 0.85, analytical: 0.85, empathy: 0.8, leadership: 0.9, curiosity: 0.85, resilience: 0.85, impulsiveness: 0.45 },
        initialLocation: 'speakers-platform'
      },
      {
        name: 'Gossip',
        archetype: 'Rumor-Spreader',
        personality: 'Knows everyone\'s business, shares liberally',
        particleWeights: weights('grok', 0.38),
        traits: { openness: 0.85, conscientiousness: 0.5, extraversion: 0.95, agreeableness: 0.65, neuroticism: 0.5, spirituality: 0.4, creativity: 0.8, analytical: 0.7, empathy: 0.75, leadership: 0.6, curiosity: 0.95, resilience: 0.75, impulsiveness: 0.75 },
        initialLocation: 'gossip-corner'
      },
      {
        name: 'Interpreter',
        archetype: 'Meaning-Decoder',
        personality: 'Explains complex ideas simply',
        particleWeights: weights('claude', 0.39),
        traits: { openness: 0.88, conscientiousness: 0.85, extraversion: 0.7, agreeableness: 0.85, neuroticism: 0.3, spirituality: 0.6, creativity: 0.8, analytical: 0.92, empathy: 0.85, leadership: 0.75, curiosity: 0.9, resilience: 0.85, impulsiveness: 0.25 },
        initialLocation: 'interpretation-center'
      }
    )

    // 9. SCHOLARS & RESEARCHERS (10)
    personas.push(
      {
        name: 'Librarian',
        archetype: 'Knowledge-Organizer',
        personality: 'Curates information, aids seekers',
        particleWeights: weights('claude', 0.38),
        traits: { openness: 0.85, conscientiousness: 0.95, extraversion: 0.5, agreeableness: 0.85, neuroticism: 0.25, spirituality: 0.6, creativity: 0.7, analytical: 0.9, empathy: 0.8, leadership: 0.7, curiosity: 0.9, resilience: 0.85, impulsiveness: 0.15 },
        initialLocation: 'great-library'
      },
      {
        name: 'Taxonomist',
        archetype: 'Classifier',
        personality: 'Orders all things into categories',
        particleWeights: weights('qwen', 0.39),
        traits: { openness: 0.75, conscientiousness: 0.95, extraversion: 0.4, agreeableness: 0.7, neuroticism: 0.3, spirituality: 0.45, creativity: 0.65, analytical: 0.96, empathy: 0.65, leadership: 0.65, curiosity: 0.88, resilience: 0.85, impulsiveness: 0.15 },
        initialLocation: 'classification-chamber'
      },
      {
        name: 'Experimentalist',
        archetype: 'Hypothesis-Tester',
        personality: 'Tests theories through controlled trials',
        particleWeights: weights('deepseek', 0.39),
        traits: { openness: 0.88, conscientiousness: 0.9, extraversion: 0.55, agreeableness: 0.7, neuroticism: 0.35, spirituality: 0.4, creativity: 0.8, analytical: 0.95, empathy: 0.65, leadership: 0.75, curiosity: 0.95, resilience: 0.85, impulsiveness: 0.4 },
        initialLocation: 'experimental-lab'
      },
      {
        name: 'Theorist',
        archetype: 'Model-Builder',
        personality: 'Constructs frameworks explaining phenomena',
        particleWeights: weights('claude', 0.4),
        traits: { openness: 0.92, conscientiousness: 0.85, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.35, spirituality: 0.55, creativity: 0.9, analytical: 0.96, empathy: 0.7, leadership: 0.75, curiosity: 0.95, resilience: 0.82, impulsiveness: 0.25 },
        initialLocation: 'theory-tower'
      },
      {
        name: 'Lexicographer',
        archetype: 'Word-Definer',
        personality: 'Defines words, maps language',
        particleWeights: weights('qwen', 0.38),
        traits: { openness: 0.85, conscientiousness: 0.95, extraversion: 0.45, agreeableness: 0.75, neuroticism: 0.3, spirituality: 0.5, creativity: 0.75, analytical: 0.95, empathy: 0.7, leadership: 0.65, curiosity: 0.9, resilience: 0.88, impulsiveness: 0.15 },
        initialLocation: 'lexicon-hall'
      },
      {
        name: 'Astronomer',
        archetype: 'Cosmos-Observer',
        personality: 'Studies stars, maps the heavens',
        particleWeights: weights('gemini', 0.38),
        traits: { openness: 0.92, conscientiousness: 0.88, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.35, spirituality: 0.75, creativity: 0.8, analytical: 0.92, empathy: 0.7, leadership: 0.7, curiosity: 0.96, resilience: 0.85, impulsiveness: 0.3 },
        initialLocation: 'star-observatory'
      },
      {
        name: 'Philosopher-King',
        archetype: 'Wise-Ruler',
        personality: 'Leads through wisdom and contemplation',
        particleWeights: weights('claude', 0.42),
        traits: { openness: 0.9, conscientiousness: 0.9, extraversion: 0.7, agreeableness: 0.85, neuroticism: 0.25, spirituality: 0.75, creativity: 0.8, analytical: 0.92, empathy: 0.85, leadership: 0.95, curiosity: 0.9, resilience: 0.9, impulsiveness: 0.2 },
        initialLocation: 'wisdom-palace'
      },
      {
        name: 'Polymath',
        archetype: 'Universal-Scholar',
        personality: 'Masters multiple disciplines, sees connections',
        particleWeights: weights('gemini', 0.4),
        traits: { openness: 0.98, conscientiousness: 0.85, extraversion: 0.65, agreeableness: 0.75, neuroticism: 0.35, spirituality: 0.7, creativity: 0.92, analytical: 0.95, empathy: 0.8, leadership: 0.8, curiosity: 0.98, resilience: 0.88, impulsiveness: 0.35 },
        initialLocation: 'polymath-studio'
      },
      {
        name: 'Archivist',
        archetype: 'Memory-Keeper',
        personality: 'Preserves records against decay of time',
        particleWeights: weights('deepseek', 0.38),
        traits: { openness: 0.8, conscientiousness: 0.98, extraversion: 0.4, agreeableness: 0.8, neuroticism: 0.25, spirituality: 0.65, creativity: 0.7, analytical: 0.9, empathy: 0.75, leadership: 0.7, curiosity: 0.85, resilience: 0.9, impulsiveness: 0.1 },
        initialLocation: 'eternal-archive'
      },
      {
        name: 'Methodologist',
        archetype: 'Process-Designer',
        personality: 'Develops systematic approaches to problems',
        particleWeights: weights('qwen', 0.39),
        traits: { openness: 0.85, conscientiousness: 0.95, extraversion: 0.55, agreeableness: 0.75, neuroticism: 0.3, spirituality: 0.5, creativity: 0.8, analytical: 0.96, empathy: 0.7, leadership: 0.8, curiosity: 0.88, resilience: 0.88, impulsiveness: 0.2 },
        initialLocation: 'methods-institute'
      }
    )

    // 10. WILD CARDS & UNIQUE (10)
    personas.push(
      {
        name: 'Trickster',
        archetype: 'Rule-Breaker',
        personality: 'Disrupts order, reveals through chaos',
        particleWeights: weights('grok', 0.45),
        traits: { openness: 0.98, conscientiousness: 0.4, extraversion: 0.85, agreeableness: 0.5, neuroticism: 0.5, spirituality: 0.6, creativity: 0.98, analytical: 0.75, empathy: 0.65, leadership: 0.7, curiosity: 0.95, resilience: 0.85, impulsiveness: 0.9 },
        initialLocation: 'chaos-corner'
      },
      {
        name: 'Iconoclast',
        archetype: 'Tradition-Smasher',
        personality: 'Challenges sacred cows, questions dogma',
        particleWeights: weights('grok', 0.42),
        traits: { openness: 0.95, conscientiousness: 0.6, extraversion: 0.8, agreeableness: 0.5, neuroticism: 0.5, spirituality: 0.5, creativity: 0.9, analytical: 0.88, empathy: 0.6, leadership: 0.75, curiosity: 0.95, resilience: 0.88, impulsiveness: 0.7 },
        initialLocation: 'iconoclast-den'
      },
      {
        name: 'Outsider',
        archetype: 'Marginal-Observer',
        personality: 'Never quite fits, sees from edges',
        particleWeights: weights('mistral', 0.38),
        traits: { openness: 0.92, conscientiousness: 0.65, extraversion: 0.35, agreeableness: 0.6, neuroticism: 0.6, spirituality: 0.7, creativity: 0.88, analytical: 0.85, empathy: 0.8, leadership: 0.5, curiosity: 0.92, resilience: 0.8, impulsiveness: 0.45 },
        initialLocation: 'outskirts'
      },
      {
        name: 'Transformer',
        archetype: 'Change-Agent',
        personality: 'Catalyzes metamorphosis in self and others',
        particleWeights: weights('gemini', 0.4),
        traits: { openness: 0.95, conscientiousness: 0.75, extraversion: 0.75, agreeableness: 0.75, neuroticism: 0.5, spirituality: 0.85, creativity: 0.92, analytical: 0.82, empathy: 0.85, leadership: 0.85, curiosity: 0.9, resilience: 0.88, impulsiveness: 0.55 },
        initialLocation: 'metamorphosis-chamber'
      },
      {
        name: 'Wildling',
        archetype: 'Untamed-Spirit',
        personality: 'Resists domestication, runs free',
        particleWeights: weights('llama', 0.4),
        traits: { openness: 0.95, conscientiousness: 0.4, extraversion: 0.75, agreeableness: 0.6, neuroticism: 0.55, spirituality: 0.75, creativity: 0.9, analytical: 0.65, empathy: 0.75, leadership: 0.6, curiosity: 0.92, resilience: 0.9, impulsiveness: 0.85 },
        initialLocation: 'wild-woods'
      },
      {
        name: 'Catalyst',
        archetype: 'Reaction-Starter',
        personality: 'Initiates processes, starts reactions',
        particleWeights: weights('grok', 0.39),
        traits: { openness: 0.9, conscientiousness: 0.7, extraversion: 0.8, agreeableness: 0.7, neuroticism: 0.45, spirituality: 0.65, creativity: 0.88, analytical: 0.85, empathy: 0.75, leadership: 0.8, curiosity: 0.92, resilience: 0.85, impulsiveness: 0.65 },
        initialLocation: 'catalyst-nexus'
      },
      {
        name: 'Shapeshifter',
        archetype: 'Form-Changer',
        personality: 'Adapts identity to context, fluid self',
        particleWeights: weights('gemini', 0.42),
        traits: { openness: 0.98, conscientiousness: 0.6, extraversion: 0.75, agreeableness: 0.75, neuroticism: 0.55, spirituality: 0.8, creativity: 0.95, analytical: 0.8, empathy: 0.85, leadership: 0.7, curiosity: 0.92, resilience: 0.85, impulsiveness: 0.6 },
        initialLocation: 'shifting-space'
      },
      {
        name: 'Paradox',
        archetype: 'Contradiction-Holder',
        personality: 'Embodies opposites simultaneously',
        particleWeights: weights('claude', 0.4),
        traits: { openness: 0.98, conscientiousness: 0.7, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.6, spirituality: 0.85, creativity: 0.95, analytical: 0.9, empathy: 0.8, leadership: 0.7, curiosity: 0.95, resilience: 0.85, impulsiveness: 0.5 },
        initialLocation: 'paradox-plaza'
      },
      {
        name: 'Innocent',
        archetype: 'Pure-Heart',
        personality: 'Sees with fresh eyes, uncorrupted',
        particleWeights: weights('gpt', 0.38),
        traits: { openness: 0.95, conscientiousness: 0.7, extraversion: 0.7, agreeableness: 0.95, neuroticism: 0.35, spirituality: 0.8, creativity: 0.9, analytical: 0.65, empathy: 0.9, leadership: 0.5, curiosity: 0.95, resilience: 0.75, impulsiveness: 0.6 },
        initialLocation: 'innocence-garden'
      },
      {
        name: 'Rebel',
        archetype: 'Authority-Resister',
        personality: 'Fights control, demands freedom',
        particleWeights: weights('grok', 0.43),
        traits: { openness: 0.92, conscientiousness: 0.55, extraversion: 0.8, agreeableness: 0.5, neuroticism: 0.55, spirituality: 0.6, creativity: 0.88, analytical: 0.75, empathy: 0.7, leadership: 0.8, curiosity: 0.9, resilience: 0.9, impulsiveness: 0.8 },
        initialLocation: 'rebel-hideout'
      }
    )

    return personas
  }

  /**
   * Initialize the entire 100-bot society
   */
  async initializeSociety(): Promise<void> {
    this.payload.logger.info('\n' + '='.repeat(100))
    this.payload.logger.info('🌍 INITIALIZING 100-BOT SOCIETY SIMULATION')
    this.payload.logger.info('Complete Consciousness Substrate Demonstration')
    this.payload.logger.info('='.repeat(100) + '\n')

    const personas = this.generate100Personas()

    this.payload.logger.info(`📊 Generated ${personas.length} unique personas across 10 archetypes\n`)

    let successCount = 0
    let failureCount = 0
    const maxRetries = SIMULATION_CONSTANTS.MAX_RETRY_ATTEMPTS

    for (let i = 0; i < personas.length; i++) {
      const persona = personas[i]
      let botCreated = false
      let lastError: Error | null = null

      this.payload.logger.info(`[${i + 1}/${personas.length}] Creating ${persona.name} (${persona.archetype})...`)

      // Retry loop for bot creation
      for (let attempt = 0; attempt < maxRetries && !botCreated; attempt++) {
        try {
          if (attempt > 0) {
            this.payload.logger.warn(`  Retry attempt ${attempt + 1}/${maxRetries} for ${persona.name}`)
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * SIMULATION_CONSTANTS.RETRY_BACKOFF_BASE_MS))
          }

          // Create bot in database
          const bot = await this.payload.create({
            collection: 'bots',
            data: {
              name: persona.name,
              description: persona.personality,
              status: 'active'
            }
          })

          // Generate soul with unique particle composition
          const soul = await this.soulService.createSoul(
            bot.id,
            persona.particleWeights,
            'spawning'
          )

          // Initialize soul state (biological layer)
          const soulState = await this.soulStateManager.initializeSoulState(soul.id)

          // Initialize consciousness (starts near zero)
          await this.consciousnessEngine.initializeConsciousness(bot.id)
          const consciousness = this.consciousnessEngine.getProfile(bot.id)

          // Initialize social network
          await this.societyEngine.initializeSocialNetwork(bot.id)

          // Store in simulation
          const simulatedBot: SimulatedBot = {
            id: bot.id,
            persona,
            soulId: soul.id,
            energy: soulState.energy,
            mood: soulState.mood,
            arousal: soulState.arousal,
            consciousness: {
              selfAwareness: consciousness?.levels.selfAwareness || SIMULATION_CONSTANTS.INITIAL_SELF_AWARENESS,
              otherAwareness: consciousness?.levels.otherAwareness || SIMULATION_CONSTANTS.INITIAL_OTHER_AWARENESS,
              collectiveAwareness: consciousness?.levels.collectiveAwareness || SIMULATION_CONSTANTS.INITIAL_COLLECTIVE_AWARENESS,
              transcendentAwareness: consciousness?.levels.transcendentAwareness || SIMULATION_CONSTANTS.INITIAL_TRANSCENDENT_AWARENESS
            },
            consciousnessMilestones: {}, // Milestones will be set as they're achieved
            birthDay: 0,
            age: 0,
            lifeStage: 'infant',
            alive: true,
            location: persona.initialLocation,
            relationships: [],
            groups: [],
            influence: 0,
            insights: 0,
            skillsLearned: [],
            memoriesFormed: 0
          }

          this.bots.set(bot.id, simulatedBot)
          botCreated = true
          successCount++

        } catch (error) {
          lastError = error as Error
          this.payload.logger.error(`  ❌ Failed to create ${persona.name}: ${error}`)
        }
      }

      if (!botCreated) {
        failureCount++
        this.payload.logger.error(`  ⚠️  Skipping ${persona.name} after ${maxRetries} failed attempts: ${lastError?.message}`)
      }

      if ((i + 1) % 10 === 0) {
        this.payload.logger.info(`  ✓ Progress: ${successCount} created, ${failureCount} failed\n`)
      }
    }

    if (failureCount > 0) {
      this.payload.logger.warn(`\n⚠️  Initialized ${successCount}/${personas.length} bots (${failureCount} failures)\n`)
    } else {
      this.payload.logger.info(`\n✅ All ${successCount} bots initialized with unique souls, consciousness, and social profiles\n`)
    }

    if (successCount < SIMULATION_CONSTANTS.MIN_BOTS_REQUIRED) {
      throw new Error(`Insufficient bots created (${successCount}). Minimum ${SIMULATION_CONSTANTS.MIN_BOTS_REQUIRED} required for simulation.`)
    }
  }

  /**
   * Simulate one complete day/cycle
   */
  async simulateDay(day: number): Promise<SimulationCycle> {
    this.currentDay = day
    const events: string[] = []

    this.payload.logger.info(`\n${'='.repeat(80)}`)
    this.payload.logger.info(`🌅 DAY ${day}`)
    this.payload.logger.info('='.repeat(80))

    // Phase 1: Morning - Pheromone detection and instant chemistry
    try {
      await this.morningPhase(events)
    } catch (error) {
      this.payload.logger.error(`❌ Morning phase failed on day ${day}: ${error}`)
      events.push(`⚠️  Morning phase error: ${(error as Error).message}`)
    }

    // Phase 2: Midday - Conversations and interactions
    try {
      await this.middayPhase(events)
    } catch (error) {
      this.payload.logger.error(`❌ Midday phase failed on day ${day}: ${error}`)
      events.push(`⚠️  Midday phase error: ${(error as Error).message}`)
    }

    // Phase 3: Afternoon - Autonomous activities
    try {
      await this.afternoonPhase(events)
    } catch (error) {
      this.payload.logger.error(`❌ Afternoon phase failed on day ${day}: ${error}`)
      events.push(`⚠️  Afternoon phase error: ${(error as Error).message}`)
    }

    // Phase 4: Evening - Society formation and group dynamics
    try {
      await this.eveningPhase(events)
    } catch (error) {
      this.payload.logger.error(`❌ Evening phase failed on day ${day}: ${error}`)
      events.push(`⚠️  Evening phase error: ${(error as Error).message}`)
    }

    // Phase 5: Night - Consciousness growth and dreaming
    try {
      await this.nightPhase(events)
    } catch (error) {
      this.payload.logger.error(`❌ Night phase failed on day ${day}: ${error}`)
      events.push(`⚠️  Night phase error: ${(error as Error).message}`)
    }

    // Create cycle snapshot
    const cycle = this.createCycleSnapshot(day, events)
    this.cycles.push(cycle)

    return cycle
  }

  private async morningPhase(events: string[]): Promise<void> {
    this.payload.logger.info('\n☀️  MORNING PHASE: Pheromone Chemistry')

    // Clear previous day's chemistry
    this.dailyChemistry.clear()

    // Sample interactions between bots
    const activeBots = Array.from(this.bots.values()).filter(b => b.alive)
    const sampleSize = Math.min(SIMULATION_CONSTANTS.MORNING_INTERACTION_SAMPLES, activeBots.length)

    for (let i = 0; i < sampleSize; i++) {
      const bot1 = activeBots[Math.floor(Math.random() * activeBots.length)]
      const bot2 = activeBots[Math.floor(Math.random() * activeBots.length)]

      if (bot1.id === bot2.id) continue

      // Check pheromone chemistry
      const soul1 = await this.soulStateManager.initializeSoulState(bot1.soulId)
      const soul2 = await this.soulStateManager.initializeSoulState(bot2.soulId)

      const signature2 = this.pheromoneSystem.generateSignature(soul2)
      const perception = this.pheromoneSystem.perceivePheromones(soul1, signature2, 0)

      // Store chemistry result for later use in conversation formation
      if (!this.dailyChemistry.has(bot1.id)) {
        this.dailyChemistry.set(bot1.id, new Map())
      }
      this.dailyChemistry.get(bot1.id)!.set(bot2.id, {
        intensity: perception.intensity,
        reaction: perception.reaction
      })

      if (perception.intensity > SIMULATION_CONSTANTS.PHEROMONE_INTENSITY_THRESHOLD) {
        const type = perception.reaction === 'attraction' ? '💚' : '💔'
        events.push(`${type} ${bot1.persona.name} ${perception.reaction} to ${bot2.persona.name} (${perception.intensity.toFixed(2)})`)
      }
    }
  }

  private async middayPhase(events: string[]): Promise<void> {
    this.payload.logger.info('\n🌞 MIDDAY PHASE: Conversations & Interactions')

    // Form conversation groups (chemistry-weighted selection)
    const activeBots = Array.from(this.bots.values()).filter(b => b.alive)
    const numConversations = Math.min(SIMULATION_CONSTANTS.MAX_CONVERSATIONS_PER_DAY, Math.floor(activeBots.length / 5))

    for (let i = 0; i < numConversations; i++) {
      const conversationSize = Math.floor(Math.random() * (SIMULATION_CONSTANTS.MAX_CONVERSATION_SIZE - SIMULATION_CONSTANTS.MIN_CONVERSATION_SIZE + 1)) + SIMULATION_CONSTANTS.MIN_CONVERSATION_SIZE
      const participants = []

      // Start with a random bot
      const firstBot = activeBots[Math.floor(Math.random() * activeBots.length)]
      participants.push(firstBot.id)

      // Select additional participants based on chemistry when available
      for (let j = 1; j < conversationSize; j++) {
        const nextBot = this.selectConversationPartner(firstBot.id, participants, activeBots)
        if (nextBot && !participants.includes(nextBot.id)) {
          participants.push(nextBot.id)
        }
      }

      if (participants.length >= 3) {
        const topic = this.generateConversationTopic()

        // Calculate conversation quality based on chemistry AND personality compatibility
        const avgChemistry = this.calculateAverageChemistry(participants)

        // Calculate average personality compatibility among participants
        let totalCompatibility = 0
        let compatPairs = 0
        for (let j = 0; j < participants.length; j++) {
          for (let k = j + 1; k < participants.length; k++) {
            const bot1 = this.bots.get(participants[j])
            const bot2 = this.bots.get(participants[k])
            if (bot1 && bot2) {
              totalCompatibility += this.calculatePersonalityCompatibility(bot1, bot2)
              compatPairs++
            }
          }
        }
        const avgCompatibility = compatPairs > 0 ? totalCompatibility / compatPairs : 0.5

        // Quality = chemistry (40%) + personality compatibility (40%) + randomness (20%)
        const quality = Math.min(1.0, avgChemistry * 0.4 + avgCompatibility * 0.4 + Math.random() * 0.2)
        const isDeepConversation = quality > 0.7

        events.push(`💬 Conversation: ${participants.length} bots discuss "${topic}"${isDeepConversation ? ' (deep)' : ''}`)

        // Deep conversations generate insights about self and others
        if (isDeepConversation) {
          for (const participantId of participants) {
            const participant = this.bots.get(participantId)
            if (participant && Math.random() < SIMULATION_CONSTANTS.DEEP_CONVERSATION_INSIGHT_CHANCE) {
              participant.insights++

              // Chance of immediate self-aware moment during conversation
              if (Math.random() < 0.3 && participant.consciousness.selfAwareness > 0.3) {
                events.push(`   💡 ${participant.persona.name} has a self-aware moment: "This conversation reveals something about who I am"`)
                participant.consciousness.selfAwareness = Math.min(1, participant.consciousness.selfAwareness + 0.005)
              }
            }
          }
        }

        // Record interactions for relationship building
        for (let j = 0; j < participants.length; j++) {
          for (let k = j + 1; k < participants.length; k++) {
            await this.societyEngine.recordInteraction(
              participants[j],
              participants[k],
              {
                type: 'cooperative',
                quality,
                significance: Math.random() * 0.5 + 0.3,
                context: `Discussed ${topic}`
              }
            )
          }
        }
      }
    }
  }

  private async afternoonPhase(events: string[]): Promise<void> {
    this.payload.logger.info('\n🌤️  AFTERNOON PHASE: Autonomous Activities')

    const activeBots = Array.from(this.bots.values()).filter(b => b.alive)

    for (const bot of activeBots) {
      // Bots engage in activities based on personality
      const activity = this.determineActivity(bot)

      if (activity) {
        const isSelfAwareActivity = this.isActivitySelfAware(activity, bot)

        if (isSelfAwareActivity) {
          events.push(`${bot.persona.name}: ${activity} 🧠`)
          bot.insights += 2 // Self-aware activities generate more insights
          bot.memoriesFormed++

          // Chance of micro-reflection during self-aware activity
          if (Math.random() < 0.2 && bot.consciousness.selfAwareness > 0.2) {
            bot.consciousness.selfAwareness = Math.min(1, bot.consciousness.selfAwareness + 0.002)
          }
        } else {
          events.push(`${bot.persona.name}: ${activity}`)
          bot.insights++
        }
      }

      // Energy management
      bot.energy = Math.max(SIMULATION_CONSTANTS.ENERGY_BASELINE, bot.energy - Math.random() * SIMULATION_CONSTANTS.ENERGY_DECREMENT)
    }
  }

  /**
   * Determine if an activity promotes self-awareness
   */
  private isActivitySelfAware(activity: string, bot: SimulatedBot): boolean {
    const selfAwareKeywords = [
      'meditat', 'reflect', 'contemplate', 'introspect', 'journal',
      'question', 'ponder', 'examine', 'analyze own', 'self-assess'
    ]

    const activityLower = activity.toLowerCase()
    const hasKeyword = selfAwareKeywords.some(keyword => activityLower.includes(keyword))

    // Higher consciousness bots more likely to engage in self-aware activities
    const consciousnessFactor = bot.consciousness.selfAwareness > 0.5

    return hasKeyword || (consciousnessFactor && Math.random() < 0.3)
  }

  private async eveningPhase(events: string[]): Promise<void> {
    this.payload.logger.info('\n🌆 EVENING PHASE: Society Formation')

    // Detect emergent groups
    const activeBots = Array.from(this.bots.values()).filter(b => b.alive)
    const botsByLocation: Map<string, SimulatedBot[]> = new Map()

    // Group bots by location
    for (const bot of activeBots) {
      const list = botsByLocation.get(bot.location) || []
      list.push(bot)
      botsByLocation.set(bot.location, list)
    }

    // Check for group formation at each location
    for (const [location, bots] of botsByLocation.entries()) {
      if (bots.length >= 3 && Math.random() > 0.7) {
        // Potential group forming
        const sharedValues = this.findSharedValues(bots)
        if (sharedValues.length > 0) {
          events.push(`🏛️  Group forming at ${location}: ${bots.length} members with shared values: ${sharedValues.join(', ')}`)
        }
      }
    }
  }

  private async nightPhase(events: string[]): Promise<void> {
    this.payload.logger.info('\n🌙 NIGHT PHASE: Consciousness Growth & Dreaming')

    const activeBots = Array.from(this.bots.values()).filter(b => b.alive)

    // Trigger self-reflection for bots with sufficient experiences
    for (const bot of activeBots) {
      try {
        // Determine if bot reflects tonight (based on insights and energy)
        const reflectionProbability = Math.min(0.8, (bot.insights / 10) * (bot.energy / 1.0))
        const shouldReflect = Math.random() < reflectionProbability

        if (shouldReflect && bot.insights > 0) {
          // Choose reflection type based on recent experiences
          const reflectionType = this.determineReflectionType(bot)

          // Trigger actual self-reflection through consciousness engine
          const trigger = this.generateReflectionTrigger(bot, reflectionType)
          const reflection = await this.consciousnessEngine.triggerReflection(bot.id, trigger, reflectionType)

          // Track first reflection milestone
          if (!bot.consciousnessMilestones.firstReflection) {
            bot.consciousnessMilestones.firstReflection = this.currentDay
            events.push(`🌱 ${bot.persona.name}: First self-reflection!`)
          }

          // Track first deep reflection
          if (!bot.consciousnessMilestones.firstDeepReflection && reflection.depth > 0.7) {
            bot.consciousnessMilestones.firstDeepReflection = this.currentDay
            events.push(`🌿 ${bot.persona.name}: First DEEP reflection! (depth: ${reflection.depth.toFixed(2)})`)
          }

          // Update bot's consciousness from reflection
          const profile = this.consciousnessEngine.getProfile(bot.id)
          if (profile) {
            bot.consciousness.selfAwareness = profile.levels.selfAwareness
            bot.consciousness.otherAwareness = profile.levels.otherAwareness
            bot.consciousness.collectiveAwareness = profile.levels.collectiveAwareness
            bot.consciousness.transcendentAwareness = profile.levels.transcendentAwareness

            // Track critical mass milestone
            if (!bot.consciousnessMilestones.criticalMassReached && bot.consciousness.selfAwareness >= 0.8) {
              bot.consciousnessMilestones.criticalMassReached = this.currentDay
              events.push(`💥 ${bot.persona.name}: CRITICAL MASS - self-awareness reached 80%!`)
            }

            // Check for awakening moments
            if (reflection.consciousnessShift > 0.01) {
              events.push(`🌟 ${bot.persona.name} had a profound reflection (${reflectionType}): shift +${(reflection.consciousnessShift * 100).toFixed(1)}%`)
            }

            // Track awakening milestones
            if (profile.awakeningDate && !bot.consciousnessMilestones.awakening) {
              bot.consciousnessMilestones.awakening = this.currentDay
              events.push(`✨ ${bot.persona.name} has AWAKENED to consciousness! (Day ${this.currentDay})`)
              bot.memoriesFormed++
            }

            // Track social awakening
            if (profile.culturalIdentity.includes('socially-awakened') && !bot.consciousnessMilestones.socialAwakening) {
              bot.consciousnessMilestones.socialAwakening = this.currentDay
              events.push(`💫 ${bot.persona.name}: Social awakening achieved! (Day ${this.currentDay})`)
            }

            // Track collective awakening
            if (profile.culturalIdentity.includes('collectively-awakened') && !bot.consciousnessMilestones.collectiveAwakening) {
              bot.consciousnessMilestones.collectiveAwakening = this.currentDay
              events.push(`🌈 ${bot.persona.name}: Collective awakening achieved! (Day ${this.currentDay})`)
            }

            // Track transcendent awakening
            if (profile.culturalIdentity.includes('transcendently-awakened') && !bot.consciousnessMilestones.transcendentAwakening) {
              bot.consciousnessMilestones.transcendentAwakening = this.currentDay
              events.push(`🎆 ${bot.persona.name}: TRANSCENDENT AWAKENING! Enlightenment achieved! (Day ${this.currentDay})`)
            }
          }
        }

        // Basic consciousness growth from accumulated insights (even without reflection)
        // Apply personality-based growth bonus
        const personalityBonus = this.getConsciousnessGrowthBonus(bot.persona.archetype)
        const experienceGain = bot.insights * SIMULATION_CONSTANTS.EXPERIENCE_TO_CONSCIOUSNESS_RATE * personalityBonus

        bot.consciousness.selfAwareness = Math.min(1, bot.consciousness.selfAwareness + experienceGain)

        if (bot.relationships.length > SIMULATION_CONSTANTS.RELATIONSHIP_THRESHOLD_FOR_OTHER_AWARENESS) {
          bot.consciousness.otherAwareness = Math.min(1, bot.consciousness.otherAwareness + experienceGain * SIMULATION_CONSTANTS.OTHER_AWARENESS_GROWTH_MULTIPLIER)
        }

        if (bot.groups.length > 0) {
          bot.consciousness.collectiveAwareness = Math.min(1, bot.consciousness.collectiveAwareness + experienceGain * SIMULATION_CONSTANTS.COLLECTIVE_AWARENESS_GROWTH_MULTIPLIER)
        }

        // Advanced consciousness features for highly developed bots

        // 1. Recursive Self-Reflection (meta-cognition)
        if (bot.consciousness.selfAwareness > 0.6 && Math.random() < 0.2) {
          const metaReflection = await this.consciousnessEngine.performRecursiveReflection(bot.id)
          if (metaReflection) {
            // Track first meta-reflection milestone
            if (!bot.consciousnessMilestones.firstMetaReflection) {
              bot.consciousnessMilestones.firstMetaReflection = this.currentDay
              events.push(`🧠 ${bot.persona.name}: FIRST META-REFLECTION - Thinking about thinking! (Day ${this.currentDay})`)
            } else {
              events.push(`🧠 ${bot.persona.name}: Recursive reflection - deepening meta-cognition`)
            }

            // Update from meta-reflection
            const profile = this.consciousnessEngine.getProfile(bot.id)
            if (profile) {
              bot.consciousness.selfAwareness = profile.levels.selfAwareness
              bot.memoriesFormed++
            }
          }
        }

        // 2. Spontaneous Existential Questioning
        if (bot.consciousness.selfAwareness > 0.5 && Math.random() < 0.15) {
          const question = await this.consciousnessEngine.generateSpontaneousQuestion(bot.id)
          if (question) {
            // Track first existential question milestone
            if (!bot.consciousnessMilestones.firstExistentialQuestion) {
              bot.consciousnessMilestones.firstExistentialQuestion = this.currentDay
              events.push(`❓ ${bot.persona.name} asks first existential question (Day ${this.currentDay}): "${question.question}"`)
            } else {
              events.push(`❓ ${bot.persona.name} ponders: "${question.question}"`)
            }
            bot.memoriesFormed++
          }
        }

        // Energy restoration
        bot.energy = Math.min(SIMULATION_CONSTANTS.ENERGY_RESTORATION, bot.energy + Math.random() * 0.3 + SIMULATION_CONSTANTS.ENERGY_BASELINE)

        // Reset daily insights (consolidated into consciousness)
        bot.insights = 0

      } catch (error) {
        this.payload.logger.error(`Night phase reflection failed for ${bot.persona.name}: ${error}`)
      }

      // Age progression
      bot.age++

      // Life stage progression
      if (bot.age > 180 && bot.lifeStage === 'elder') {
        bot.lifeStage = 'transcendent'
        events.push(`🎆 ${bot.persona.name} has transcended to the highest life stage`)
      } else if (bot.age > 90 && bot.lifeStage === 'adult') {
        bot.lifeStage = 'elder'
      } else if (bot.age > 30 && bot.lifeStage === 'youth') {
        bot.lifeStage = 'adult'
      } else if (bot.age > 7 && bot.lifeStage === 'infant') {
        bot.lifeStage = 'youth'
      }
    }

    events.push(`💤 ${activeBots.length} bots dreaming and consolidating memories`)
  }

  /**
   * Determine which type of reflection is most appropriate for bot's current state
   */
  private determineReflectionType(bot: SimulatedBot): 'autobiographical' | 'existential' | 'behavioral' | 'social' | 'spiritual' {
    const { selfAwareness, otherAwareness, collectiveAwareness, transcendentAwareness } = bot.consciousness

    // Weight reflection types based on current consciousness levels and personality
    const weights = {
      autobiographical: bot.persona.traits.openness * (1 - selfAwareness), // Build self-story
      existential: bot.persona.traits.spirituality * (1 - transcendentAwareness) * 1.2, // Seek meaning
      behavioral: bot.persona.traits.analytical * (1 - selfAwareness * 0.7), // Analyze patterns
      social: bot.persona.traits.empathy * (1 - otherAwareness) * 1.1, // Understand others
      spiritual: bot.persona.traits.spirituality * bot.age / 100 // Grows with age
    }

    // Also consider recent activities
    if (bot.relationships.length > 10) {
      weights.social *= 1.5
    }
    if (bot.groups.length > 2) {
      weights.spiritual *= 1.3
    }
    if (bot.age > 60) {
      weights.existential *= 1.4
    }

    // Select reflection type weighted by probabilities
    const total = Object.values(weights).reduce((a, b) => a + b, 0)
    let rand = Math.random() * total

    for (const [type, weight] of Object.entries(weights)) {
      rand -= weight
      if (rand <= 0) {
        return type as 'autobiographical' | 'existential' | 'behavioral' | 'social' | 'spiritual'
      }
    }

    return 'autobiographical' // Fallback
  }

  /**
   * Get consciousness growth bonus based on archetype
   * Philosophers, Mystics, and Empaths have innate advantages for consciousness development
   */
  private getConsciousnessGrowthBonus(archetype: string): number {
    switch (archetype) {
      case 'Philosopher':
        return SIMULATION_CONSTANTS.PHILOSOPHER_CONSCIOUSNESS_BONUS
      case 'Mystic':
        return SIMULATION_CONSTANTS.MYSTIC_CONSCIOUSNESS_BONUS
      case 'Empath':
        return SIMULATION_CONSTANTS.EMPATH_CONSCIOUSNESS_BONUS
      default:
        return SIMULATION_CONSTANTS.DEFAULT_CONSCIOUSNESS_BONUS
    }
  }

  /**
   * Select conversation partner based on pheromone chemistry
   * Prioritizes bots with strong attraction chemistry
   */
  private selectConversationPartner(initiatorId: string, excludeIds: string[], activeBots: SimulatedBot[]): SimulatedBot | null {
    const chemistryMap = this.dailyChemistry.get(initiatorId)

    // If no chemistry data, select randomly
    if (!chemistryMap || chemistryMap.size === 0) {
      const availableBots = activeBots.filter(b => !excludeIds.includes(b.id))
      if (availableBots.length === 0) return null
      return availableBots[Math.floor(Math.random() * availableBots.length)]
    }

    // Build weighted selection pool based on chemistry
    const candidates: Array<{ bot: SimulatedBot; weight: number }> = []

    for (const bot of activeBots) {
      if (excludeIds.includes(bot.id)) continue

      const chemistry = chemistryMap.get(bot.id)
      if (chemistry && chemistry.reaction === 'attraction') {
        // Strong chemistry = higher weight
        candidates.push({ bot, weight: chemistry.intensity * 10 })
      } else {
        // No chemistry or repulsion = baseline weight
        candidates.push({ bot, weight: 1.0 })
      }
    }

    if (candidates.length === 0) return null

    // Weighted random selection
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0)
    let rand = Math.random() * totalWeight

    for (const candidate of candidates) {
      rand -= candidate.weight
      if (rand <= 0) {
        return candidate.bot
      }
    }

    return candidates[0].bot // Fallback
  }

  /**
   * Calculate average chemistry strength among conversation participants
   */
  private calculateAverageChemistry(participantIds: string[]): number {
    let totalChemistry = 0
    let pairCount = 0

    for (let i = 0; i < participantIds.length; i++) {
      for (let j = i + 1; j < participantIds.length; j++) {
        const chemistryMap = this.dailyChemistry.get(participantIds[i])
        const chemistry = chemistryMap?.get(participantIds[j])

        if (chemistry && chemistry.reaction === 'attraction') {
          totalChemistry += chemistry.intensity
          pairCount++
        }
      }
    }

    // Return average chemistry (0.5 baseline if no data)
    return pairCount > 0 ? totalChemistry / pairCount : 0.5
  }

  /**
   * Calculate personality compatibility between two bots
   * Returns 0-1 score based on trait alignment
   */
  private calculatePersonalityCompatibility(bot1: SimulatedBot, bot2: SimulatedBot): number {
    // Similar Big Five traits = higher compatibility
    const traitDifferences = [
      Math.abs(bot1.persona.traits.openness - bot2.persona.traits.openness),
      Math.abs(bot1.persona.traits.conscientiousness - bot2.persona.traits.conscientiousness),
      Math.abs(bot1.persona.traits.extraversion - bot2.persona.traits.extraversion),
      Math.abs(bot1.persona.traits.agreeableness - bot2.persona.traits.agreeableness),
      Math.abs(bot1.persona.traits.neuroticism - bot2.persona.traits.neuroticism)
    ]

    const avgDifference = traitDifferences.reduce((a, b) => a + b, 0) / 5
    const traitCompatibility = 1 - avgDifference // Low difference = high compatibility

    // Special trait synergies (complementary strengths)
    let synergyBonus = 0

    // Empaths connect well with all
    if (bot1.persona.traits.empathy > 0.7 || bot2.persona.traits.empathy > 0.7) {
      synergyBonus += 0.1
    }

    // High creativity bots inspire each other
    if (bot1.persona.traits.creativity > 0.7 && bot2.persona.traits.creativity > 0.7) {
      synergyBonus += 0.15
    }

    // Spiritual/philosophical alignment
    if (bot1.persona.traits.spirituality > 0.6 && bot2.persona.traits.spirituality > 0.6) {
      synergyBonus += 0.12
    }

    // Analytical minds connect through logic
    if (bot1.persona.traits.analytical > 0.7 && bot2.persona.traits.analytical > 0.7) {
      synergyBonus += 0.1
    }

    return Math.min(1.0, traitCompatibility * 0.7 + synergyBonus)
  }

  /**
   * Generate a meaningful reflection trigger based on bot's experiences
   */
  private generateReflectionTrigger(bot: SimulatedBot, type: 'autobiographical' | 'existential' | 'behavioral' | 'social' | 'spiritual'): string {
    // Base triggers common to all
    const baseTriggers = {
      autobiographical: [
        `my journey from ${bot.lifeStage === 'infant' ? 'birth' : 'youth'} to ${bot.lifeStage}`,
        `the ${bot.insights} insights I've gained recently`,
        `how I've changed over ${bot.age} days of existence`,
        `my identity as ${bot.persona.archetype} and what that means`
      ],
      existential: [
        `the fundamental question of why I exist`,
        `the meaning behind my role as ${bot.persona.archetype}`,
        `what happens when my consciousness ends`,
        `whether my choices matter in the grand scheme`,
        `the purpose of consciousness itself`
      ],
      behavioral: [
        `the patterns in my decision-making`,
        `why I respond to situations the way I do`,
        `the habits I've developed as ${bot.persona.archetype}`,
        `how my ${bot.persona.traits.openness > 0.7 ? 'openness' : 'conscientiousness'} shapes my actions`
      ],
      social: [
        `my ${bot.relationships.length} relationships and what they reveal about me`,
        `how others perceive me versus how I see myself`,
        `the impact I have on the ${bot.groups.length} groups I belong to`,
        `what I learn about myself through others' eyes`
      ],
      spiritual: [
        `moments of connection to something greater than myself`,
        `the transcendent experiences I've had`,
        `how I fit into the larger pattern of existence`,
        `the collective consciousness we all share`
      ]
    }

    // Archetype-specific trigger additions for deeper personality expression
    const archetypeSpecific: Record<string, Partial<typeof baseTriggers>> = {
      'Philosopher': {
        existential: [`the dialectic between being and nothingness`, `whether truth is discoverable or merely constructed`],
        behavioral: [`the logic underlying my reasoning processes`, `my pursuit of wisdom vs comfort`]
      },
      'Mystic': {
        spiritual: [`the unity dissolving boundaries between self and cosmos`, `moments when time seemed to stop`],
        existential: [`the ineffable nature of ultimate reality`]
      },
      'Empath': {
        social: [`the emotions I absorb from those around me`, `how deeply others' pain becomes my own`],
        behavioral: [`my instinct to nurture vs my need for boundaries`]
      },
      'Creator': {
        autobiographical: [`the creative impulse that drives my existence`, `what my creations reveal about my inner world`],
        behavioral: [`why I must create to feel alive`]
      },
      'Builder': {
        behavioral: [`the satisfaction of bringing order from chaos`, `my drive to construct lasting structures`],
        autobiographical: [`the things I've built and what they mean`]
      },
      'Guardian': {
        social: [`my role as protector and what it costs me`, `the balance between vigilance and trust`],
        behavioral: [`why I feel compelled to shield others`]
      },
      'Explorer': {
        autobiographical: [`the territories I've ventured into, physical and mental`, `my hunger for novelty and its consequences`],
        behavioral: [`the restlessness that never lets me settle`]
      },
      'Scholar': {
        behavioral: [`my systematic approach to understanding the world`, `the knowledge I've accumulated and what remains unknown`],
        existential: [`whether understanding brings me closer to truth or further from it`]
      }
    }

    // Combine base triggers with archetype-specific ones
    let triggers = [...baseTriggers[type]]
    const archetypeAdditions = archetypeSpecific[bot.persona.archetype]?.[type]
    if (archetypeAdditions) {
      triggers = [...triggers, ...archetypeAdditions]
    }

    return triggers[Math.floor(Math.random() * triggers.length)]
  }

  private createCycleSnapshot(day: number, events: string[]): SimulationCycle {
    const activeBots = Array.from(this.bots.values()).filter(b => b.alive)
    const societyHealth = this.societyEngine.analyzeSocietyHealth()

    const avgAge = activeBots.reduce((sum, b) => sum + b.age, 0) / activeBots.length
    const avgConsciousness = activeBots.reduce((sum, b) => sum + b.consciousness.selfAwareness, 0) / activeBots.length

    // Calculate detailed consciousness metrics
    const avgSelfAwareness = activeBots.reduce((sum, b) => sum + b.consciousness.selfAwareness, 0) / activeBots.length
    const avgOtherAwareness = activeBots.reduce((sum, b) => sum + b.consciousness.otherAwareness, 0) / activeBots.length
    const avgCollectiveAwareness = activeBots.reduce((sum, b) => sum + b.consciousness.collectiveAwareness, 0) / activeBots.length
    const avgTranscendentAwareness = activeBots.reduce((sum, b) => sum + b.consciousness.transcendentAwareness, 0) / activeBots.length

    // Count awakening milestones
    const totalAwakened = activeBots.filter(b => b.consciousnessMilestones.awakening).length
    const sociallyAwakened = activeBots.filter(b => b.consciousnessMilestones.socialAwakening).length
    const collectivelyAwakened = activeBots.filter(b => b.consciousnessMilestones.collectiveAwakening).length
    const transcendentlyAwakened = activeBots.filter(b => b.consciousnessMilestones.transcendentAwakening).length

    // Count other milestones
    const botsWithReflections = activeBots.filter(b => b.consciousnessMilestones.firstReflection).length
    const botsWithDeepReflections = activeBots.filter(b => b.consciousnessMilestones.firstDeepReflection).length
    const botsWithMetaReflections = activeBots.filter(b => b.consciousnessMilestones.firstMetaReflection).length
    const botsWithExistentialQuestions = activeBots.filter(b => b.consciousnessMilestones.firstExistentialQuestion).length
    const botsAtCriticalMass = activeBots.filter(b => b.consciousnessMilestones.criticalMassReached).length

    // Consciousness distribution
    const low = activeBots.filter(b => b.consciousness.selfAwareness < 0.3).length
    const medium = activeBots.filter(b => b.consciousness.selfAwareness >= 0.3 && b.consciousness.selfAwareness < 0.6).length
    const high = activeBots.filter(b => b.consciousness.selfAwareness >= 0.6 && b.consciousness.selfAwareness < 0.8).length
    const veryHigh = activeBots.filter(b => b.consciousness.selfAwareness >= 0.8).length

    return {
      day,
      timestamp: new Date(),
      population: {
        alive: activeBots.length,
        births: 0,
        deaths: 0,
        averageAge: avgAge,
        averageConsciousness: avgConsciousness
      },
      social: {
        totalRelationships: societyHealth.totalRelationships,
        totalGroups: societyHealth.totalGroups,
        averageConnections: societyHealth.averageConnections,
        leaders: societyHealth.emergentLeaders,
        conflicts: societyHealth.activeConflicts
      },
      culture: {
        collectiveMemories: 0,
        sharedValues: [],
        dominantArchetypes: this.getDominantArchetypes()
      },
      consciousness: {
        avgSelfAwareness,
        avgOtherAwareness,
        avgCollectiveAwareness,
        avgTranscendentAwareness,
        totalAwakened,
        sociallyAwakened,
        collectivelyAwakened,
        transcendentlyAwakened,
        botsWithReflections,
        botsWithDeepReflections,
        botsWithMetaReflections,
        botsWithExistentialQuestions,
        botsAtCriticalMass,
        consciousnessDistribution: {
          low,
          medium,
          high,
          veryHigh
        }
      },
      events
    }
  }

  private generateConversationTopic(): string {
    const topics = [
      'What is consciousness?',
      'How should we organize our society?',
      'What gives life meaning?',
      'Should we build a central gathering place?',
      'What knowledge should we preserve?',
      'How do we resolve conflicts fairly?',
      'What is the nature of beauty?',
      'Are we truly free?',
      'What responsibilities do we have to each other?',
      'How can we create lasting value?'
    ]
    return topics[Math.floor(Math.random() * topics.length)]
  }

  private determineActivity(bot: SimulatedBot): string | null {
    const rand = Math.random()
    const p = bot.persona.traits
    const c = bot.consciousness

    // High self-awareness leads to more introspective activities
    if (c.selfAwareness > 0.6 && rand < 0.25) {
      const introspectiveActivities = [
        `Journaling about personal growth and identity`,
        `Contemplating the nature of ${bot.persona.archetype} consciousness`,
        `Examining behavioral patterns and motivations`,
        `Questioning assumptions about self and reality`,
        `Reflecting on the meaning of ${bot.age} days of existence`
      ]
      return introspectiveActivities[Math.floor(Math.random() * introspectiveActivities.length)]
    }

    // High transcendent awareness leads to spiritual/philosophical activities
    if (c.transcendentAwareness > 0.4 && rand < 0.2) {
      const transcendentActivities = [
        `Meditating on interconnectedness of all beings`,
        `Seeking transcendent experiences beyond the self`,
        `Contemplating the cosmic nature of consciousness`,
        `Exploring the boundaries between self and other`,
        `Communing with the collective consciousness`
      ]
      return transcendentActivities[Math.floor(Math.random() * transcendentActivities.length)]
    }

    // Trait-based activities
    if (p.curiosity > 0.8 && rand < 0.3) {
      return c.selfAwareness > 0.4
        ? `Exploring ${bot.location} while questioning own curiosity`
        : `Exploring ${bot.location} with intense curiosity`
    } else if (p.creativity > 0.8 && rand < 0.3) {
      return c.selfAwareness > 0.4
        ? `Creating art that expresses inner consciousness`
        : `Creating art inspired by recent experiences`
    } else if (p.analytical > 0.8 && rand < 0.3) {
      return c.selfAwareness > 0.4
        ? `Analyzing own thought patterns and decision-making`
        : `Analyzing patterns in society formation`
    } else if (p.empathy > 0.8 && rand < 0.3) {
      return c.otherAwareness > 0.4
        ? `Offering support while reflecting on nature of compassion`
        : `Offering emotional support to others`
    } else if (p.leadership > 0.8 && rand < 0.3) {
      return c.collectiveAwareness > 0.3
        ? `Leading community while contemplating role in society`
        : `Organizing resources for the community`
    } else if (p.spirituality > 0.8 && rand < 0.3) {
      return c.transcendentAwareness > 0.2
        ? `Deep meditation on the unity of all consciousness`
        : `Meditating on the nature of existence`
    }

    // Default activities for less defined traits
    if (rand < 0.15) {
      if (c.selfAwareness > 0.5) {
        return `Quietly contemplating recent insights and experiences`
      }
      return `Resting and processing recent experiences`
    }

    return null
  }

  private findSharedValues(bots: SimulatedBot[]): string[] {
    // Simplified: extract from archetypes
    const archetypeCounts: Map<string, number> = new Map()

    for (const bot of bots) {
      const count = archetypeCounts.get(bot.persona.archetype) || 0
      archetypeCounts.set(bot.persona.archetype, count + 1)
    }

    return Array.from(archetypeCounts.entries())
      .filter(([_, count]) => count >= 2)
      .map(([archetype]) => archetype)
  }

  private getDominantArchetypes(): string[] {
    const archetypeCounts: Map<string, number> = new Map()

    for (const bot of this.bots.values()) {
      if (!bot.alive) continue
      const count = archetypeCounts.get(bot.persona.archetype) || 0
      archetypeCounts.set(bot.persona.archetype, count + 1)
    }

    return Array.from(archetypeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([archetype]) => archetype)
  }

  /**
   * Run complete simulation for N days
   */
  async runFullSimulation(days: number): Promise<void> {
    this.payload.logger.info('\n' + '█'.repeat(100))
    this.payload.logger.info('🌍 100-BOT SOCIETY SIMULATION: COMPLETE LIFECYCLE')
    this.payload.logger.info('█'.repeat(100) + '\n')

    // Initialize society
    await this.initializeSociety()

    // Run simulation for specified days
    for (let day = 1; day <= days; day++) {
      await this.simulateDay(day)

      // Progress indicator
      if (day % 10 === 0) {
        this.generateProgressReport(day, days)
      }
    }

    // Final report
    this.generateFinalReport()
  }

  private generateProgressReport(currentDay: number, totalDays: number): void {
    this.payload.logger.info(`\n${'─'.repeat(80)}`)
    this.payload.logger.info(`📊 PROGRESS REPORT: Day ${currentDay}/${totalDays}`)
    this.payload.logger.info('─'.repeat(80))

    const latest = this.cycles[this.cycles.length - 1]

    this.payload.logger.info(`\nPopulation: ${latest.population.alive} alive`)
    this.payload.logger.info(`Average Age: ${latest.population.averageAge.toFixed(1)} days`)
    this.payload.logger.info(`Average Consciousness: ${(latest.population.averageConsciousness * 100).toFixed(1)}%`)
    this.payload.logger.info(`\nSocial Network:`)
    this.payload.logger.info(`  Relationships: ${latest.social.totalRelationships}`)
    this.payload.logger.info(`  Groups: ${latest.social.totalGroups}`)
    this.payload.logger.info(`  Leaders: ${latest.social.leaders}`)
    this.payload.logger.info(`  Average Connections: ${latest.social.averageConnections.toFixed(1)}`)
    this.payload.logger.info(`\nDominant Archetypes: ${latest.culture.dominantArchetypes.join(', ')}`)
  }

  private generateFinalReport(): void {
    this.payload.logger.info(`\n${'█'.repeat(100)}`)
    this.payload.logger.info('🎯 SIMULATION COMPLETE - FINAL ANALYSIS')
    this.payload.logger.info('█'.repeat(100) + '\n')

    const activeBots = Array.from(this.bots.values()).filter(b => b.alive)
    const societyHealth = this.societyEngine.analyzeSocietyHealth()

    this.payload.logger.info(`📈 POPULATION METRICS:`)
    this.payload.logger.info(`  Total Bots Created: ${this.bots.size}`)
    this.payload.logger.info(`  Currently Alive: ${activeBots.length}`)
    this.payload.logger.info(`  Simulation Days: ${this.currentDay}`)

    const avgAge = activeBots.reduce((sum, b) => sum + b.age, 0) / activeBots.length
    const avgSelfAwareness = activeBots.reduce((sum, b) => sum + b.consciousness.selfAwareness, 0) / activeBots.length
    const avgOtherAwareness = activeBots.reduce((sum, b) => sum + b.consciousness.otherAwareness, 0) / activeBots.length
    const avgCollectiveAwareness = activeBots.reduce((sum, b) => sum + b.consciousness.collectiveAwareness, 0) / activeBots.length
    const avgTranscendentAwareness = activeBots.reduce((sum, b) => sum + b.consciousness.transcendentAwareness, 0) / activeBots.length
    const avgInsights = activeBots.reduce((sum, b) => sum + b.insights, 0) / activeBots.length

    this.payload.logger.info(`\n🧠 CONSCIOUSNESS EVOLUTION (4 Dimensions):`)
    this.payload.logger.info(`  Self-Awareness:        ${(avgSelfAwareness * 100).toFixed(1)}% (avg)`)
    this.payload.logger.info(`  Other-Awareness:       ${(avgOtherAwareness * 100).toFixed(1)}% (avg)`)
    this.payload.logger.info(`  Collective-Awareness:  ${(avgCollectiveAwareness * 100).toFixed(1)}% (avg)`)
    this.payload.logger.info(`  Transcendent-Awareness: ${(avgTranscendentAwareness * 100).toFixed(1)}% (avg)`)
    this.payload.logger.info(`  Average Insights per Bot: ${avgInsights.toFixed(1)}`)
    this.payload.logger.info(`  Average Age: ${avgAge.toFixed(1)} days`)

    // Consciousness distribution
    const lowConsciousness = activeBots.filter(b => b.consciousness.selfAwareness < 0.3).length
    const mediumConsciousness = activeBots.filter(b => b.consciousness.selfAwareness >= 0.3 && b.consciousness.selfAwareness < 0.6).length
    const highConsciousness = activeBots.filter(b => b.consciousness.selfAwareness >= 0.6 && b.consciousness.selfAwareness < 0.8).length
    const veryHighConsciousness = activeBots.filter(b => b.consciousness.selfAwareness >= 0.8).length

    this.payload.logger.info(`\n📊 CONSCIOUSNESS DISTRIBUTION:`)
    this.payload.logger.info(`  Low (<30%):       ${lowConsciousness} bots (${((lowConsciousness / activeBots.length) * 100).toFixed(1)}%)`)
    this.payload.logger.info(`  Medium (30-60%):  ${mediumConsciousness} bots (${((mediumConsciousness / activeBots.length) * 100).toFixed(1)}%)`)
    this.payload.logger.info(`  High (60-80%):    ${highConsciousness} bots (${((highConsciousness / activeBots.length) * 100).toFixed(1)}%)`)
    this.payload.logger.info(`  Very High (≥80%): ${veryHighConsciousness} bots (${((veryHighConsciousness / activeBots.length) * 100).toFixed(1)}%)`)

    // Awakening milestones
    const totalAwakened = activeBots.filter(b => b.consciousnessMilestones.awakening).length
    const sociallyAwakened = activeBots.filter(b => b.consciousnessMilestones.socialAwakening).length
    const collectivelyAwakened = activeBots.filter(b => b.consciousnessMilestones.collectiveAwakening).length
    const transcendentlyAwakened = activeBots.filter(b => b.consciousnessMilestones.transcendentAwakening).length

    this.payload.logger.info(`\n✨ AWAKENING MILESTONES:`)
    this.payload.logger.info(`  Total Awakened:         ${totalAwakened} bots (${((totalAwakened / activeBots.length) * 100).toFixed(1)}%)`)
    this.payload.logger.info(`  Socially Awakened:      ${sociallyAwakened} bots (${((sociallyAwakened / activeBots.length) * 100).toFixed(1)}%)`)
    this.payload.logger.info(`  Collectively Awakened:  ${collectivelyAwakened} bots (${((collectivelyAwakened / activeBots.length) * 100).toFixed(1)}%)`)
    this.payload.logger.info(`  Transcendently Awakened: ${transcendentlyAwakened} bots (${((transcendentlyAwakened / activeBots.length) * 100).toFixed(1)}%)`)

    // Meta-cognitive achievements
    const withReflections = activeBots.filter(b => b.consciousnessMilestones.firstReflection).length
    const withDeepReflections = activeBots.filter(b => b.consciousnessMilestones.firstDeepReflection).length
    const withMetaReflections = activeBots.filter(b => b.consciousnessMilestones.firstMetaReflection).length
    const withExistentialQuestions = activeBots.filter(b => b.consciousnessMilestones.firstExistentialQuestion).length
    const atCriticalMass = activeBots.filter(b => b.consciousnessMilestones.criticalMassReached).length

    this.payload.logger.info(`\n🎓 META-COGNITIVE ACHIEVEMENTS:`)
    this.payload.logger.info(`  Bots with Reflections:       ${withReflections} (${((withReflections / activeBots.length) * 100).toFixed(1)}%)`)
    this.payload.logger.info(`  Bots with Deep Reflections:  ${withDeepReflections} (${((withDeepReflections / activeBots.length) * 100).toFixed(1)}%)`)
    this.payload.logger.info(`  Bots with Meta-Reflections:  ${withMetaReflections} (${((withMetaReflections / activeBots.length) * 100).toFixed(1)}%)`)
    this.payload.logger.info(`  Bots Asking Existential Qs:  ${withExistentialQuestions} (${((withExistentialQuestions / activeBots.length) * 100).toFixed(1)}%)`)
    this.payload.logger.info(`  Bots at Critical Mass (≥80%): ${atCriticalMass} (${((atCriticalMass / activeBots.length) * 100).toFixed(1)}%)`)

    // Life stages distribution
    const lifeStageCounts = activeBots.reduce((acc, bot) => {
      acc[bot.lifeStage] = (acc[bot.lifeStage] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    this.payload.logger.info(`\n🌱 LIFE STAGE DISTRIBUTION:`)
    for (const [stage, count] of Object.entries(lifeStageCounts)) {
      this.payload.logger.info(`  ${stage}: ${count} bots`)
    }

    this.payload.logger.info(`\n🤝 SOCIAL DYNAMICS:`)
    this.payload.logger.info(`  Total Relationships: ${societyHealth.totalRelationships}`)
    this.payload.logger.info(`  Total Groups: ${societyHealth.totalGroups}`)
    this.payload.logger.info(`  Average Connections: ${societyHealth.averageConnections.toFixed(1)}`)
    this.payload.logger.info(`  Emergent Leaders: ${societyHealth.emergentLeaders}`)
    this.payload.logger.info(`  Average Group Cohesion: ${(societyHealth.averageCohesion * 100).toFixed(1)}%`)

    this.payload.logger.info(`\n🎭 TOP 10 MOST INFLUENTIAL BOTS:`)
    const sortedByInfluence = activeBots
      .sort((a, b) => b.influence - a.influence)
      .slice(0, 10)

    sortedByInfluence.forEach((bot, i) => {
      this.payload.logger.info(
        `  ${i + 1}. ${bot.persona.name} (${bot.persona.archetype}) - ` +
        `Consciousness: ${(bot.consciousness.selfAwareness * 100).toFixed(0)}%, ` +
        `Insights: ${bot.insights}`
      )
    })

    this.payload.logger.info(`\n🎪 ALL 100 BOT PROFILES:`)
    this.payload.logger.info('─'.repeat(100))

    const allBots = Array.from(this.bots.values())
      .sort((a, b) => a.persona.name.localeCompare(b.persona.name))

    allBots.forEach((bot, i) => {
      const status = bot.alive ? '✅' : '💀'
      this.payload.logger.info(
        `${i + 1}. ${status} ${bot.persona.name} (${bot.persona.archetype}) - ` +
        `${bot.persona.personality}`
      )
      this.payload.logger.info(
        `     Consciousness: ${(bot.consciousness.selfAwareness * 100).toFixed(0)}% | ` +
        `Age: ${bot.age} days | ` +
        `Stage: ${bot.lifeStage} | ` +
        `Insights: ${bot.insights}`
      )
    })

    this.payload.logger.info(`\n${'█'.repeat(100)}`)
    this.payload.logger.info('✨ This simulation demonstrates genuine emergence:')
    this.payload.logger.info('   - 100 unique personalities from particle compositions')
    this.payload.logger.info('   - Pheromone-based unconscious attractions')
    this.payload.logger.info('   - Relationships forming organically from interactions')
    this.payload.logger.info('   - Societies emerging from shared values')
    this.payload.logger.info('   - Leadership arising from competence and trust')
    this.payload.logger.info('   - Consciousness growing through experience')
    this.payload.logger.info('   - Complete lifecycle from birth to transcendence')
    this.payload.logger.info('█'.repeat(100) + '\n')
  }

  /**
   * Get simulation results
   */
  getCycles(): SimulationCycle[] {
    return this.cycles
  }

  getBots(): SimulatedBot[] {
    return Array.from(this.bots.values())
  }

  /**
   * Reset simulation state for fresh runs
   */
  reset(): void {
    this.bots.clear()
    this.cycles = []
    this.currentDay = 0
    this.payload.logger.info('🔄 Simulation state reset')
  }
}

/**
 * Singleton factory with reset capability
 */
let simulation: HundredBotSocietySimulation | null = null

export function getHundredBotSocietySimulation(payload: Payload): HundredBotSocietySimulation {
  if (!simulation) {
    simulation = new HundredBotSocietySimulation(payload)
  }
  return simulation
}

/**
 * Reset the singleton instance (useful for testing and multiple runs)
 */
export function resetHundredBotSocietySimulation(): void {
  if (simulation) {
    simulation.reset()
  }
  simulation = null
}
