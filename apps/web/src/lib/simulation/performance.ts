/**
 * Performance & Scalability Optimization (Iteration 10)
 *
 * Provides:
 * - Leadership score caching with dependency tracking
 * - Pheromone field batch operations
 * - Memory pruning for reflection history
 * - Relationship calculation optimization
 * - Performance benchmarking
 */

// ============================================================================
// LEADERSHIP SCORE CACHE
// ============================================================================

export interface CachedLeadershipScore {
  score: number
  timestamp: Date
  dependencies: Set<string> // Bot IDs that affect this score
}

export class LeadershipScoreCache {
  private cache = new Map<string, CachedLeadershipScore>()
  private cacheDuration: number

  constructor(cacheDuration: number = 3600000) { // 1 hour default
    this.cacheDuration = cacheDuration
  }

  get(botId: string): number | null {
    const entry = this.cache.get(botId)
    if (!entry) return null

    if (Date.now() - entry.timestamp.getTime() > this.cacheDuration) {
      this.cache.delete(botId)
      return null
    }

    return entry.score
  }

  set(botId: string, score: number, dependencies: string[]): void {
    this.cache.set(botId, {
      score,
      timestamp: new Date(),
      dependencies: new Set(dependencies)
    })
  }

  invalidate(botId: string): void {
    // Invalidate this bot's score
    this.cache.delete(botId)

    // Invalidate all scores that depend on this bot
    for (const [id, entry] of this.cache.entries()) {
      if (entry.dependencies.has(botId)) {
        this.cache.delete(id)
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
// PHEROMONE FIELD OPTIMIZER
// ============================================================================

export interface PheromoneSignature {
  intensity: number
  reaction: 'attraction' | 'repulsion'
  botId: string
}

export interface PheromoneField {
  spaceId: string
  signatures: PheromoneSignature[]
  complexity: number
  dominantReaction: 'attraction' | 'repulsion' | 'mixed'
}

export class PheromoneFieldOptimizer {
  /**
   * Calculate pheromone fields in batch (parallel)
   */
  async calculateFieldsBatch(
    spaceIds: string[],
    calculateFieldFn: (spaceId: string) => Promise<PheromoneField>
  ): Promise<Map<string, PheromoneField>> {
    // Calculate all fields in parallel
    const promises = spaceIds.map(async (spaceId) => {
      const field = await calculateFieldFn(spaceId)
      return [spaceId, field] as const
    })

    const results = await Promise.all(promises)
    return new Map(results)
  }

  /**
   * Calculate complexity using Welford's algorithm - O(n) instead of O(n²)
   * Calculates standard deviation in a single pass
   */
  calculateComplexityFast(signatures: PheromoneSignature[]): number {
    if (signatures.length <= 1) return 0

    // Welford's method for running variance
    let mean = 0
    let m2 = 0
    let n = 0

    for (const sig of signatures) {
      n++
      const delta = sig.intensity - mean
      mean += delta / n
      const delta2 = sig.intensity - mean
      m2 += delta * delta2
    }

    const variance = n > 1 ? m2 / (n - 1) : 0
    return Math.sqrt(variance) // Standard deviation
  }
}

// ============================================================================
// REFLECTION HISTORY PRUNER
// ============================================================================

export interface SelfReflection {
  id: string
  timestamp: Date
  consciousnessShift: number
  depth: number
  reflectionType: string
  [key: string]: any
}

export class ReflectionHistoryPruner {
  private maxHistoryPerBot: number

  constructor(maxHistoryPerBot: number = 20) {
    this.maxHistoryPerBot = maxHistoryPerBot
  }

  /**
   * Prune reflection history keeping most impactful + most recent
   */
  prune(reflections: SelfReflection[]): SelfReflection[] {
    if (reflections.length <= this.maxHistoryPerBot) {
      return reflections
    }

    // Sort by impact
    const sortedByImpact = [...reflections].sort((a, b) =>
      b.consciousnessShift - a.consciousnessShift
    )

    // Sort by recency
    const sortedByRecency = [...reflections].sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    )

    // Keep top 50% by impact + 50% most recent
    const halfMax = Math.floor(this.maxHistoryPerBot / 2)
    const topByImpact = sortedByImpact.slice(0, halfMax)
    const mostRecent = sortedByRecency.slice(0, halfMax)

    // Combine and deduplicate
    const keepSet = new Set<string>()
    const result: SelfReflection[] = []

    for (const reflection of [...topByImpact, ...mostRecent]) {
      if (!keepSet.has(reflection.id)) {
        keepSet.add(reflection.id)
        result.push(reflection)
      }
    }

    return result
  }

  /**
   * Prune by age - remove reflections older than threshold
   */
  pruneByAge(reflections: SelfReflection[], maxAgeMs: number): SelfReflection[] {
    const cutoff = Date.now() - maxAgeMs
    return reflections.filter(r => r.timestamp.getTime() > cutoff)
  }
}

// ============================================================================
// RELATIONSHIP CALCULATION OPTIMIZER
// ============================================================================

export interface Relationship {
  id: string
  bot1: string
  bot2: string
  strength: number
  [key: string]: any
}

export class RelationshipOptimizer {
  /**
   * Get relationships for group members - O(n log n) instead of O(n²)
   * Uses indexed lookups instead of nested loops
   */
  getGroupRelationships(
    groupMembers: string[],
    allRelationships: Relationship[]
  ): Relationship[] {
    const memberSet = new Set(groupMembers)

    // Single pass filter - O(n)
    return allRelationships.filter(rel =>
      memberSet.has(rel.bot1) && memberSet.has(rel.bot2)
    )
  }

  /**
   * Build relationship index for O(1) lookups
   */
  buildRelationshipIndex(
    relationships: Relationship[]
  ): Map<string, Relationship[]> {
    const index = new Map<string, Relationship[]>()

    for (const rel of relationships) {
      // Add to bot1's index
      if (!index.has(rel.bot1)) {
        index.set(rel.bot1, [])
      }
      index.get(rel.bot1)!.push(rel)

      // Add to bot2's index
      if (!index.has(rel.bot2)) {
        index.set(rel.bot2, [])
      }
      index.get(rel.bot2)!.push(rel)
    }

    return index
  }

  /**
   * Get relationships for bot using index - O(1) lookup
   */
  getRelationshipsFromIndex(
    botId: string,
    index: Map<string, Relationship[]>
  ): Relationship[] {
    return index.get(botId) || []
  }
}

// ============================================================================
// PERFORMANCE BENCHMARKING
// ============================================================================

export interface BenchmarkStats {
  avg: number
  min: number
  max: number
  p50: number
  p95: number
  p99: number
  count: number
}

export class PerformanceBenchmark {
  private metrics = new Map<string, number[]>()
  private enabled: boolean

  constructor(enabled: boolean = true) {
    this.enabled = enabled
  }

  /**
   * Measure execution time of a function
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) {
      return await fn()
    }

    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)

    return result
  }

  /**
   * Measure synchronous function
   */
  measureSync<T>(name: string, fn: () => T): T {
    if (!this.enabled) {
      return fn()
    }

    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)

    return result
  }

  /**
   * Get statistics for a metric
   */
  getStats(name: string): BenchmarkStats | null {
    const measurements = this.metrics.get(name)
    if (!measurements || measurements.length === 0) {
      return null
    }

    const sorted = [...measurements].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)

    return {
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      count: sorted.length
    }
  }

  /**
   * Get all metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys())
  }

  /**
   * Get all statistics
   */
  getAllStats(): Map<string, BenchmarkStats> {
    const allStats = new Map<string, BenchmarkStats>()

    for (const name of this.metrics.keys()) {
      const stats = this.getStats(name)
      if (stats) {
        allStats.set(name, stats)
      }
    }

    return allStats
  }

  /**
   * Format statistics as string
   */
  formatStats(stats: BenchmarkStats): string {
    return `avg: ${stats.avg.toFixed(2)}ms, min: ${stats.min.toFixed(2)}ms, max: ${stats.max.toFixed(2)}ms, p95: ${stats.p95.toFixed(2)}ms (n=${stats.count})`
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Enable/disable benchmarking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }
}

// ============================================================================
// BATCH PROCESSOR
// ============================================================================

export class BatchProcessor<T, R> {
  /**
   * Process items in batches to avoid overwhelming the system
   */
  async processBatch(
    items: T[],
    processFn: (item: T) => Promise<R>,
    batchSize: number = 10
  ): Promise<R[]> {
    const results: R[] = []

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(item => processFn(item))
      )
      results.push(...batchResults)
    }

    return results
  }

  /**
   * Process with rate limiting
   */
  async processWithRateLimit(
    items: T[],
    processFn: (item: T) => Promise<R>,
    delayMs: number = 100
  ): Promise<R[]> {
    const results: R[] = []

    for (const item of items) {
      results.push(await processFn(item))
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }

    return results
  }
}
