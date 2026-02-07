/**
 * Data Layer Repository Pattern (Iteration 7)
 *
 * Provides centralized data access with caching to solve:
 * - N+1 query problem
 * - State fragmentation
 * - Direct Payload coupling
 */

import type { Payload } from 'payload'

// ============================================================================
// CACHE LAYER
// ============================================================================

export interface CacheEntry<T> {
  data: T
  expires: number
}

export class CacheLayer {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL: number

  constructor(defaultTTL: number = 60000) { // 1 minute default
    this.defaultTTL = defaultTTL
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttl || this.defaultTTL)
    })
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// ============================================================================
// BOT REPOSITORY
// ============================================================================

export interface Bot {
  id: string
  name?: string
  archetype?: string
  traits?: any[]
  [key: string]: any
}

export class BotRepository {
  constructor(
    private payload: Payload,
    private cache: CacheLayer
  ) {}

  /**
   * Find single bot by ID (with caching)
   */
  async findByID(id: string): Promise<Bot | null> {
    // Check cache first
    const cacheKey = `bot:${id}`
    const cached = this.cache.get<Bot>(cacheKey)
    if (cached) return cached

    // Load from database
    try {
      const bot = await this.payload.findByID({
        collection: 'bot-identity',
        id
      }) as Bot

      if (bot) {
        this.cache.set(cacheKey, bot)
      }

      return bot
    } catch (error) {
      this.payload.logger.error(`Failed to find bot ${id}: ${error}`)
      return null
    }
  }

  /**
   * Find all bots matching filter (batch operation)
   * Solves N+1 query problem
   */
  async findAll(filter?: any, limit: number = 1000): Promise<Bot[]> {
    try {
      const result = await this.payload.find({
        collection: 'bot-identity',
        where: filter,
        limit
      })

      // Cache all results
      for (const bot of result.docs) {
        const botData = bot as Bot
        this.cache.set(`bot:${botData.id}`, botData)
      }

      return result.docs as Bot[]
    } catch (error) {
      this.payload.logger.error(`Failed to find bots: ${error}`)
      return []
    }
  }

  /**
   * Find multiple bots by IDs (batch operation)
   * More efficient than N individual queries
   */
  async findByIDs(ids: string[]): Promise<Bot[]> {
    if (ids.length === 0) return []

    // Check cache for all IDs
    const cachedBots: Bot[] = []
    const uncachedIds: string[] = []

    for (const id of ids) {
      const cached = this.cache.get<Bot>(`bot:${id}`)
      if (cached) {
        cachedBots.push(cached)
      } else {
        uncachedIds.push(id)
      }
    }

    // Fetch uncached bots in batch
    if (uncachedIds.length > 0) {
      const fetchedBots = await this.findAll({
        id: {
          in: uncachedIds
        }
      })
      return [...cachedBots, ...fetchedBots]
    }

    return cachedBots
  }

  /**
   * Update bot (invalidates cache)
   */
  async update(id: string, updates: Partial<Bot>): Promise<void> {
    try {
      await this.payload.update({
        collection: 'bot-identity',
        id,
        data: updates
      })

      // Invalidate cache
      this.cache.invalidate(`bot:${id}`)
    } catch (error) {
      this.payload.logger.error(`Failed to update bot ${id}: ${error}`)
      throw error
    }
  }

  /**
   * Create new bot
   */
  async create(data: Partial<Bot>): Promise<Bot> {
    try {
      const bot = await this.payload.create({
        collection: 'bot-identity',
        data
      }) as Bot

      // Cache the new bot
      this.cache.set(`bot:${bot.id}`, bot)

      return bot
    } catch (error) {
      this.payload.logger.error(`Failed to create bot: ${error}`)
      throw error
    }
  }

  /**
   * Delete bot
   */
  async delete(id: string): Promise<void> {
    try {
      await this.payload.delete({
        collection: 'bot-identity',
        id
      })

      // Invalidate cache
      this.cache.invalidate(`bot:${id}`)
    } catch (error) {
      this.payload.logger.error(`Failed to delete bot ${id}: ${error}`)
      throw error
    }
  }
}

// ============================================================================
// RELATIONSHIP REPOSITORY
// ============================================================================

export interface Relationship {
  id: string
  bot1: string
  bot2: string
  type: string
  strength: number
  [key: string]: any
}

export class RelationshipRepository {
  constructor(
    private payload: Payload,
    private cache: CacheLayer
  ) {}

  /**
   * Find relationships for a bot (cached)
   */
  async findForBot(botId: string): Promise<Relationship[]> {
    const cacheKey = `relationships:${botId}`
    const cached = this.cache.get<Relationship[]>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.payload.find({
        collection: 'relationships',
        where: {
          or: [
            { bot1: { equals: botId } },
            { bot2: { equals: botId } }
          ]
        },
        limit: 200
      })

      const relationships = result.docs as Relationship[]
      this.cache.set(cacheKey, relationships)

      return relationships
    } catch (error) {
      this.payload.logger.error(`Failed to find relationships for bot ${botId}: ${error}`)
      return []
    }
  }

  /**
   * Batch load relationships for multiple bots
   * Solves N+1 query problem
   */
  async findForBots(botIds: string[]): Promise<Map<string, Relationship[]>> {
    if (botIds.length === 0) return new Map()

    const relationshipMap = new Map<string, Relationship[]>()
    const uncachedIds: string[] = []

    // Check cache
    for (const botId of botIds) {
      const cacheKey = `relationships:${botId}`
      const cached = this.cache.get<Relationship[]>(cacheKey)
      if (cached) {
        relationshipMap.set(botId, cached)
      } else {
        uncachedIds.push(botId)
      }
    }

    // Batch fetch uncached
    if (uncachedIds.length > 0) {
      try {
        const result = await this.payload.find({
          collection: 'relationships',
          where: {
            or: [
              { bot1: { in: uncachedIds } },
              { bot2: { in: uncachedIds } }
            ]
          },
          limit: 1000
        })

        // Group by bot ID
        for (const botId of uncachedIds) {
          const botRelationships = (result.docs as Relationship[]).filter(
            rel => rel.bot1 === botId || rel.bot2 === botId
          )
          relationshipMap.set(botId, botRelationships)

          // Cache
          this.cache.set(`relationships:${botId}`, botRelationships)
        }
      } catch (error) {
        this.payload.logger.error(`Failed to batch load relationships: ${error}`)
      }
    }

    return relationshipMap
  }

  /**
   * Update relationship (invalidates cache for both bots)
   */
  async update(id: string, updates: Partial<Relationship>): Promise<void> {
    // Get relationship to know which bots to invalidate
    try {
      const rel = await this.payload.findByID({
        collection: 'relationships',
        id
      }) as Relationship

      await this.payload.update({
        collection: 'relationships',
        id,
        data: updates
      })

      // Invalidate cache for both bots
      this.cache.invalidate(`relationships:${rel.bot1}`)
      this.cache.invalidate(`relationships:${rel.bot2}`)
    } catch (error) {
      this.payload.logger.error(`Failed to update relationship ${id}: ${error}`)
      throw error
    }
  }
}

// ============================================================================
// REPOSITORY MANAGER (Singleton)
// ============================================================================

export class RepositoryManager {
  private cache: CacheLayer
  public bots: BotRepository
  public relationships: RelationshipRepository

  constructor(payload: Payload, cacheTTL: number = 60000) {
    this.cache = new CacheLayer(cacheTTL)
    this.bots = new BotRepository(payload, this.cache)
    this.relationships = new RelationshipRepository(payload, this.cache)
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number } {
    return {
      size: this.cache.size()
    }
  }
}

/**
 * Singleton instance
 */
let repositoryManager: RepositoryManager | null = null

export function getRepositoryManager(payload: Payload): RepositoryManager {
  if (!repositoryManager) {
    repositoryManager = new RepositoryManager(payload)
  }
  return repositoryManager
}
