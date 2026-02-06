/**
 * Bot Lifecycle Management
 *
 * Handles age progression, life stage transitions, and death mechanics.
 */

import { EventBus, EventBuilder } from './event-bus'
import { SIMULATION_CONSTANTS } from './simulation-config'

export type LifeStage = 'infant' | 'youth' | 'adult' | 'elder' | 'transcendent'

export interface LifecycleState {
  age: number
  lifeStage: LifeStage
  birthDay: number
  deathDay?: number
  alive: boolean
}

export interface LifecycleTransition {
  fromStage: LifeStage
  toStage: LifeStage
  age: number
  day: number
}

/**
 * Determine life stage based on age
 */
export function determineLifeStage(age: number): LifeStage {
  if (age < SIMULATION_CONSTANTS.INFANT_AGE_MAX) return 'infant'
  if (age < SIMULATION_CONSTANTS.YOUTH_AGE_MAX) return 'youth'
  if (age < SIMULATION_CONSTANTS.ADULT_AGE_MAX) return 'adult'
  if (age < SIMULATION_CONSTANTS.ELDER_AGE_MAX) return 'elder'
  return 'transcendent'
}

/**
 * Calculate death probability based on age
 * Uses quadratic growth for realistic mortality curve
 */
export function calculateDeathProbability(age: number): number {
  if (age < SIMULATION_CONSTANTS.ADULT_AGE_MAX) return 0 // No death before adulthood

  const ageRatio = age / SIMULATION_CONSTANTS.BASE_DEATH_AGE
  return Math.min(1.0, Math.pow(ageRatio, SIMULATION_CONSTANTS.DEATH_PROBABILITY_EXPONENT))
}

/**
 * Check if bot should transition to new life stage
 */
export function checkLifeStageTransition(
  currentAge: number,
  currentStage: LifeStage
): LifeStage | null {
  const newStage = determineLifeStage(currentAge)
  return newStage !== currentStage ? newStage : null
}

/**
 * Calculate energy recovery rate based on life stage
 */
export function getEnergyRecoveryRate(lifeStage: LifeStage): number {
  switch (lifeStage) {
    case 'infant': return 1.2 // Infants recover quickly
    case 'youth': return 1.1 // Youth recover well
    case 'adult': return 1.0 // Adults at baseline
    case 'elder': return 0.8 // Elders recover slowly
    case 'transcendent': return 0.9 // Transcendent have learned energy management
  }
}

/**
 * Calculate consciousness growth modifier based on life stage
 */
export function getConsciousnessGrowthModifier(lifeStage: LifeStage): number {
  switch (lifeStage) {
    case 'infant': return 0.5 // Limited cognitive development
    case 'youth': return 1.2 // Peak learning period
    case 'adult': return 1.0 // Baseline growth
    case 'elder': return 1.1 // Wisdom accumulation
    case 'transcendent': return 1.3 // Enlightened growth
  }
}

/**
 * Bot Lifecycle Manager
 */
export class BotLifecycleManager {
  private eventBus: EventBus
  private enableDeath: boolean

  constructor(eventBus: EventBus, enableDeath: boolean = false) {
    this.eventBus = eventBus
    this.enableDeath = enableDeath
  }

  /**
   * Process daily aging for a bot
   * Returns true if bot died, false otherwise
   */
  async processDailyAging(
    botId: string,
    currentAge: number,
    currentStage: LifeStage,
    currentDay: number
  ): Promise<{
    newAge: number
    newStage: LifeStage
    died: boolean
    transitioned: boolean
  }> {
    const newAge = currentAge + 1

    // Check for life stage transition
    const newStage = checkLifeStageTransition(newAge, currentStage)
    const transitioned = newStage !== null

    if (transitioned && newStage) {
      await this.eventBus.emit(EventBuilder.lifeStageChanged(botId, currentDay, {
        oldStage: currentStage,
        newStage: newStage,
        age: newAge
      }))
    }

    // Check for death (if enabled)
    let died = false
    if (this.enableDeath) {
      const deathProb = calculateDeathProbability(newAge)
      if (Math.random() < deathProb) {
        died = true
        await this.eventBus.emit(EventBuilder.botDied(botId, currentDay, {
          age: newAge,
          lifeStage: newStage || currentStage,
          consciousnessLevel: 0, // Will be filled by caller
          relationships: 0, // Will be filled by caller
          cause: 'natural'
        }))
      }
    }

    return {
      newAge,
      newStage: newStage || currentStage,
      died,
      transitioned
    }
  }

  /**
   * Get life stage statistics for population
   */
  getLifeStageDistribution(bots: Array<{ age: number; alive: boolean }>): Record<LifeStage, number> {
    const distribution: Record<LifeStage, number> = {
      infant: 0,
      youth: 0,
      adult: 0,
      elder: 0,
      transcendent: 0
    }

    for (const bot of bots) {
      if (!bot.alive) continue
      const stage = determineLifeStage(bot.age)
      distribution[stage]++
    }

    return distribution
  }

  /**
   * Calculate average life expectancy from current population
   */
  calculateAverageLifeExpectancy(bots: Array<{ age: number; alive: boolean; deathDay?: number }>): number {
    const deadBots = bots.filter(b => !b.alive && b.deathDay !== undefined)
    if (deadBots.length === 0) return 0

    const totalAge = deadBots.reduce((sum, bot) => sum + bot.age, 0)
    return totalAge / deadBots.length
  }

  /**
   * Get mortality rate for specific age range
   */
  getMortalityRate(
    bots: Array<{ age: number; alive: boolean }>,
    minAge: number,
    maxAge: number
  ): number {
    const inRange = bots.filter(b => b.age >= minAge && b.age < maxAge)
    if (inRange.length === 0) return 0

    const dead = inRange.filter(b => !b.alive).length
    return dead / inRange.length
  }
}
