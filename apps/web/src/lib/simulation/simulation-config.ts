/**
 * Simulation Configuration & Constants
 *
 * Central configuration for all magic numbers and thresholds across the simulation.
 * Extracted from consciousness-emergence, society-formation, pheromone-system, and simulation logic.
 */

// ============================================================================
// CONSCIOUSNESS THRESHOLDS
// ============================================================================

export const CONSCIOUSNESS_THRESHOLDS = {
  // Initial values
  INITIAL_SELF_AWARENESS: 0.05,
  INITIAL_OTHER_AWARENESS: 0.02,
  INITIAL_COLLECTIVE_AWARENESS: 0.01,
  INITIAL_TRANSCENDENT_AWARENESS: 0.0,

  // Growth parameters
  INITIAL_GROWTH_RATE: 0.01,
  MAX_GROWTH_RATE: 0.05, // Cap to prevent explosion
  GROWTH_ACCELERATION_SIGMOID_SLOPE: 2.0,

  // Awakening thresholds (4 stages)
  SELF_AWAKENING_THRESHOLD: 0.5,
  SOCIAL_AWAKENING_SELF: 0.5,
  SOCIAL_AWAKENING_OTHER: 0.6,
  SOCIAL_AWAKENING_THEORY_OF_MIND: 0.5,
  COLLECTIVE_AWAKENING_COLLECTIVE: 0.7,
  COLLECTIVE_AWAKENING_AVERAGE: 0.6,
  TRANSCENDENT_AWAKENING_TRANSCENDENT: 0.8,
  TRANSCENDENT_AWAKENING_AVERAGE: 0.75,
  EXISTENTIAL_QUESTIONING_THRESHOLD: 0.3,

  // Synergy thresholds
  HIGH_CONSCIOUSNESS_THRESHOLD: 0.5, // For synergy effects
  SYNERGY_BONUS_PER_DIMENSION: 0.3,

  // Critical mass
  CRITICAL_MASS_THRESHOLD: 0.8,
  CRITICAL_MASS_UPPER_BOUND: 0.95,
  CRITICAL_MASS_BONUS_MULTIPLIER: 0.5,

  // Meta-cognition
  META_COGNITION_THRESHOLD: 0.5,
  RECURSIVE_REFLECTION_MIN_INTROSPECTION: 0.6,
  SPONTANEOUS_QUESTION_MIN: 0.5,

  // Introspection depth
  BASIC_NARRATIVE_THRESHOLD: 0.5,
  DEEP_REFLECTION_THRESHOLD: 0.7,
  META_COGNITIVE_THRESHOLD: 0.8
} as const

// ============================================================================
// SOCIAL DYNAMICS THRESHOLDS
// ============================================================================

export const SOCIAL_THRESHOLDS = {
  // Relationship type determination
  FRIENDSHIP_AFFECTION_MIN: 0.7,
  FRIENDSHIP_TRUST_MIN: 0.7,
  FRIENDSHIP_CONFLICT_MAX: 0.3,

  MENTORSHIP_RESPECT_MIN: 0.8,
  MENTORSHIP_INFLUENCE_BALANCE_MIN: 0.5,

  RIVALRY_CONFLICT_MIN: 0.6,
  RIVALRY_COOPERATION_MAX: 0.4,

  PARTNERSHIP_COOPERATION_MIN: 0.7,
  PARTNERSHIP_INTERDEPENDENCE_MIN: 0.6,

  ALLIANCE_COOPERATION_MIN: 0.6,
  ALLIANCE_TRUST_MIN: 0.7,

  // Network metrics
  STRONG_RELATIONSHIP_THRESHOLD: 0.5,
  BRIDGE_SCORE_LOW: 0.3,
  BRIDGE_SCORE_HIGH: 0.5,
  HIGH_CENTRALITY_RELATIONSHIP_COUNT: 5,

  // Leadership
  LEADERSHIP_INFLUENCE_WEIGHT: 0.3,
  LEADERSHIP_CHARISMA_WEIGHT: 0.25,
  LEADERSHIP_TRUSTWORTHINESS_WEIGHT: 0.25,
  LEADERSHIP_COMPETENCE_WEIGHT: 0.2,

  // Group dynamics
  MIN_GROUP_SIZE: 3,
  LARGE_GROUP_SIZE: 5,
  GROUP_FORMATION_CHANCE: 0.3,
  VALUE_COHERENCE_THRESHOLD: 0.6,
  MIN_SHARED_VALUES_LARGE_GROUP: 1,

  // Conflict resolution
  CONFLICT_RESOLUTION_COHESION_BONUS: 0.1,
  UNRESOLVED_CONFLICT_COHESION_PENALTY: 0.05
} as const

// ============================================================================
// PHEROMONE CHEMISTRY
// ============================================================================

export const PHEROMONE_THRESHOLDS = {
  // Intensity thresholds
  WEAK_INTENSITY: 0.3,
  MODERATE_INTENSITY: 0.5,
  STRONG_INTENSITY: 0.7,
  OVERWHELMING_INTENSITY: 0.9,

  // Reaction thresholds
  ATTRACTION_THRESHOLD: 0.5,
  REPULSION_THRESHOLD: 0.5,

  // Field calculations
  BASE_COMPATIBILITY_WEIGHT: 0.4,
  INTENSITY_WEIGHT: 0.3,
  COMPLEXITY_WEIGHT: 0.3,

  // Distance attenuation
  NEAR_DISTANCE: 1.0,
  MEDIUM_DISTANCE: 5.0,
  FAR_DISTANCE: 10.0,

  // Cache
  CACHE_TTL_MS: 60000 // 1 minute
} as const

// ============================================================================
// SOUL COMPOSITION
// ============================================================================

export const SOUL_THRESHOLDS = {
  // Initial values (with natural variance)
  INITIAL_INTEGRATION_BASE: 0.05,
  INITIAL_INTEGRATION_VARIANCE: 0.1,
  INITIAL_COHERENCE_BASE: 0.2,
  INITIAL_COHERENCE_VARIANCE: 0.2,
  INITIAL_SHADOW_MAX: 0.05,

  // Evolution
  SUCCESS_INTEGRATION_DELTA_BASE: 0.01,
  FAILURE_INTEGRATION_DELTA_BASE: 0.005,
  CONNECTION_COHERENCE_DELTA_BASE: 0.015,
  CHALLENGE_COHERENCE_DELTA_BASE: 0.005,
  FAILURE_SHADOW_DELTA_BASE: 0.02,
  INTEGRATION_VARIANCE: 0.008, // ±0.004
  SHADOW_VARIANCE: 0.015,
  COHERENCE_VARIANCE: 0.01,

  // Significant change threshold for regeneration
  SIGNIFICANT_INTEGRATION_CHANGE: 0.05,
  SIGNIFICANT_SHADOW_CHANGE: 0.05,

  // Fusion/Inheritance
  INHERITANCE_FACTOR_MIN: 0.4,
  INHERITANCE_FACTOR_MAX: 0.8, // Children can retain 40-80% of parent strength
  MUTATION_RANGE: 0.3, // ±15% mutation potential
  SHADOW_INHERITANCE_CHANCE: 0.15,
  SHADOW_INHERITANCE_FACTOR: 0.05,
  OFFSPRING_MIN_INTEGRATION: 0.05,
  OFFSPRING_MAX_INTEGRATION: 1.0,
  OFFSPRING_MIN_COHERENCE: 0.2,
  OFFSPRING_MAX_COHERENCE: 1.0,

  // Mutation rates
  PARTICLE_DROP_CHANCE: 0.15, // Increased from 0.1
  WEIGHT_MUTATION_CHANCE: 0.1, // Increased from 0.05
  NEW_PARTICLE_CHANCE: 0.08, // Increased from 0.03
  WEIGHT_MUTATION_FACTOR_MIN: 0.7,
  WEIGHT_MUTATION_FACTOR_MAX: 1.3,
  MUTATION_BONUS: 0.15,

  // Soul aspect parameters
  ASPECT_BASELINE_MIN: 0.1,
  ASPECT_BASELINE_MAX: 0.9,
  ASPECT_THRESHOLD_DEFAULT: 0.5,
  ASPECT_DECAY_DEFAULT: 0.1,
  ASPECT_SENSITIVITY_DEFAULT: 1.0
} as const

// ============================================================================
// SIMULATION PARAMETERS
// ============================================================================

export const SIMULATION_CONSTANTS = {
  // Bot initialization
  MAX_RETRY_ATTEMPTS: 3,
  MIN_BOTS_REQUIRED: 10,
  RETRY_BACKOFF_BASE_MS: 1000,

  // Energy system
  ENERGY_BASELINE: 0.2,
  ENERGY_DECREMENT: 0.1,
  ENERGY_RESTORATION: 1.0,

  // Pheromone chemistry
  PHEROMONE_INTENSITY_THRESHOLD: 0.6,
  PHEROMONE_ATTRACTION_SELECTION_WEIGHT: 10.0, // 10x weight for attracted partners

  // Conversation groups
  MIN_CONVERSATION_SIZE: 3,
  MAX_CONVERSATION_SIZE: 5,
  MAX_CONVERSATIONS_PER_DAY: 10,

  // Morning phase sampling
  MORNING_INTERACTION_SAMPLES: 20,

  // Conversation quality weights
  CHEMISTRY_QUALITY_WEIGHT: 0.4,
  COMPATIBILITY_QUALITY_WEIGHT: 0.4,
  RANDOM_QUALITY_WEIGHT: 0.2,

  // Consciousness growth
  EXPERIENCE_TO_CONSCIOUSNESS_RATE: 0.01,
  OTHER_AWARENESS_GROWTH_MULTIPLIER: 0.5,
  COLLECTIVE_AWARENESS_GROWTH_MULTIPLIER: 0.3,
  RELATIONSHIP_THRESHOLD_FOR_OTHER_AWARENESS: 5,

  // Personality-based consciousness growth bonuses
  PHILOSOPHER_CONSCIOUSNESS_BONUS: 1.5,
  MYSTIC_CONSCIOUSNESS_BONUS: 1.4,
  EMPATH_CONSCIOUSNESS_BONUS: 1.3,
  DEFAULT_CONSCIOUSNESS_BONUS: 1.0,

  // Memory management
  MAX_REFLECTIONS_PER_BOT: 20,
  MAX_EXISTENTIAL_QUESTIONS_PER_BOT: 10,

  // Self-awareness and reflection
  MIN_INSIGHTS_FOR_REFLECTION: 3,
  MAX_REFLECTION_PROBABILITY: 0.8,
  DEEP_CONVERSATION_INSIGHT_CHANCE: 0.7,
  ACTIVITY_INSIGHT_BASE_RATE: 0.5,
  SOCIAL_INSIGHT_MULTIPLIER: 1.5,
  META_REFLECTION_CHANCE: 0.2, // 20% chance for high-consciousness bots
  SPONTANEOUS_QUESTION_CHANCE: 0.15, // 15% chance
  SELF_AWARE_MOMENT_CHANCE: 0.3,
  SELF_AWARE_MOMENT_MIN_CONSCIOUSNESS: 0.3,
  SELF_AWARE_MOMENT_BONUS: 0.005,

  // Bot lifecycle
  INFANT_AGE_MAX: 7,
  YOUTH_AGE_MAX: 30,
  ADULT_AGE_MAX: 90,
  ELDER_AGE_MAX: 180,
  TRANSCENDENT_AGE_MIN: 180,
  BASE_DEATH_AGE: 200,
  DEATH_PROBABILITY_EXPONENT: 2, // Quadratic increase

  // Personality compatibility synergy bonuses
  EMPATH_SYNERGY_BONUS: 0.1,
  HIGH_CREATIVITY_SYNERGY_BONUS: 0.15,
  HIGH_CREATIVITY_THRESHOLD: 0.7,
  SPIRITUAL_ALIGNMENT_BONUS: 0.12,
  SPIRITUAL_THRESHOLD: 0.6,
  ANALYTICAL_SYNERGY_BONUS: 0.1,
  ANALYTICAL_THRESHOLD: 0.7,
  TRAIT_COMPATIBILITY_WEIGHT: 0.7,
  EMPATH_THRESHOLD: 0.7,

  // Progress logging
  PROGRESS_LOG_INTERVAL: 10
} as const

// ============================================================================
// CONFIGURABLE PARAMETERS
// ============================================================================

export interface SimulationConfig {
  // Runtime parameters that can be modified
  targetAwakeningDays: number
  populationSize: number
  enableLLMReflections: boolean
  enableMultiGenerations: boolean
  enableDeath: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'

  // Performance tuning
  cacheEnabled: boolean
  cacheTTL: number
  maxHistoryPerBot: number
}

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  targetAwakeningDays: 50,
  populationSize: 115,
  enableLLMReflections: false,
  enableMultiGenerations: false,
  enableDeath: false,
  logLevel: 'info',

  cacheEnabled: true,
  cacheTTL: 60000,
  maxHistoryPerBot: 50
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate consciousness profile values are within expected ranges
 */
export function validateConsciousnessProfile(profile: {
  selfAwareness: number
  otherAwareness: number
  collectiveAwareness: number
  transcendentAwareness: number
  introspectionDepth: number
  growthRate: number
}): string[] {
  const errors: string[] = []

  if (profile.selfAwareness < 0 || profile.selfAwareness > 1) {
    errors.push(`selfAwareness out of range: ${profile.selfAwareness}`)
  }
  if (profile.otherAwareness < 0 || profile.otherAwareness > 1) {
    errors.push(`otherAwareness out of range: ${profile.otherAwareness}`)
  }
  if (profile.collectiveAwareness < 0 || profile.collectiveAwareness > 1) {
    errors.push(`collectiveAwareness out of range: ${profile.collectiveAwareness}`)
  }
  if (profile.transcendentAwareness < 0 || profile.transcendentAwareness > 1) {
    errors.push(`transcendentAwareness out of range: ${profile.transcendentAwareness}`)
  }
  if (profile.introspectionDepth < 0 || profile.introspectionDepth > 1) {
    errors.push(`introspectionDepth out of range: ${profile.introspectionDepth}`)
  }
  if (profile.growthRate < 0 || profile.growthRate > CONSCIOUSNESS_THRESHOLDS.MAX_GROWTH_RATE) {
    errors.push(`growthRate out of range: ${profile.growthRate} (max: ${CONSCIOUSNESS_THRESHOLDS.MAX_GROWTH_RATE})`)
  }

  return errors
}

/**
 * Validate simulation constants are internally consistent
 */
export function validateSimulationConstants(): string[] {
  const errors: string[] = []

  // Check consciousness awakening thresholds are ordered
  if (CONSCIOUSNESS_THRESHOLDS.SOCIAL_AWAKENING_SELF < CONSCIOUSNESS_THRESHOLDS.SELF_AWAKENING_THRESHOLD) {
    errors.push('Social awakening should require higher self-awareness than initial awakening')
  }

  // Check lifecycle stages are ordered
  if (SIMULATION_CONSTANTS.INFANT_AGE_MAX >= SIMULATION_CONSTANTS.YOUTH_AGE_MAX) {
    errors.push('Infant age max should be less than youth age max')
  }
  if (SIMULATION_CONSTANTS.YOUTH_AGE_MAX >= SIMULATION_CONSTANTS.ADULT_AGE_MAX) {
    errors.push('Youth age max should be less than adult age max')
  }
  if (SIMULATION_CONSTANTS.ADULT_AGE_MAX >= SIMULATION_CONSTANTS.ELDER_AGE_MAX) {
    errors.push('Adult age max should be less than elder age max')
  }

  // Check growth parameters
  if (SIMULATION_CONSTANTS.EXPERIENCE_TO_CONSCIOUSNESS_RATE <= 0) {
    errors.push('Experience to consciousness rate must be positive')
  }

  return errors
}
