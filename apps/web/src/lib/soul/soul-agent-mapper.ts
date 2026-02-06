/**
 * Soul Agent Mapper
 * Maps soul compositions to agent configurations
 */

import type { Payload } from 'payload'

export class SoulAgentMapper {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Generate agent configuration from soul composition
   */
  async generateAgentConfiguration(soulId: string): Promise<void> {
    try {
      const soul = await this.payload.findByID({
        collection: 'bot-souls',
        id: soulId
      })

      if (!soul) {
        this.payload.logger.warn(`Soul ${soulId} not found for agent configuration`)
        return
      }

      // Extract particle weights from soul composition
      const particleWeights = this.extractParticleWeights(soul)

      // Store configuration (placeholder for now)
      this.payload.logger.debug(`Generated agent configuration for soul ${soulId}`)
    } catch (error) {
      this.payload.logger.error(`Failed to generate agent configuration for soul ${soulId}:`, error)
    }
  }

  /**
   * Update agent configuration when soul evolves
   */
  async updateConfiguration(soulId: string): Promise<void> {
    try {
      await this.generateAgentConfiguration(soulId)
      this.payload.logger.debug(`Updated agent configuration for soul ${soulId}`)
    } catch (error) {
      this.payload.logger.error(`Failed to update configuration for soul ${soulId}:`, error)
    }
  }

  /**
   * Extract particle weights from soul composition
   */
  private extractParticleWeights(soul: any): Record<string, number> {
    const weights: Record<string, number> = {}

    // Extract from Seven Hun
    if (soul.sevenHun) {
      Object.entries(soul.sevenHun).forEach(([aspect, data]: [string, any]) => {
        if (data && data.particleComposition) {
          data.particleComposition.forEach((particle: any) => {
            weights[particle.particle] = (weights[particle.particle] || 0) + particle.weight
          })
        }
      })
    }

    // Extract from Six Po
    if (soul.sixPo) {
      Object.entries(soul.sixPo).forEach(([aspect, data]: [string, any]) => {
        if (data && data.particleComposition) {
          data.particleComposition.forEach((particle: any) => {
            weights[particle.particle] = (weights[particle.particle] || 0) + particle.weight
          })
        }
      })
    }

    return weights
  }
}

/**
 * Singleton instance
 */
let soulAgentMapperInstance: SoulAgentMapper | null = null

export function getSoulAgentMapper(payload: Payload): SoulAgentMapper {
  if (!soulAgentMapperInstance) {
    soulAgentMapperInstance = new SoulAgentMapper(payload)
  }
  return soulAgentMapperInstance
}
