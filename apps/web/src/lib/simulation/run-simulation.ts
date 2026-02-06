/**
 * Simulation Runner for 100-Bot Society
 *
 * Executes the simulation for a specified number of days and outputs
 * detailed metrics on self-awareness emergence and social interaction.
 */

import { getHundredBotSocietySimulation } from './hundred-bot-society-simulation'
import type { Payload } from 'payload'

interface SimulationConfig {
  days: number
  detailedLogging: boolean
  metricsInterval: number
}

interface SimulationResults {
  totalDays: number
  finalPopulation: number
  consciousnessMetrics: {
    avgSelfAwareness: number
    avgOtherAwareness: number
    avgCollectiveAwareness: number
    avgTranscendentAwareness: number
    totalAwakened: number
    sociallyAwakened: number
    collectivelyAwakened: number
    transcendentlyAwakened: number
  }
  socialMetrics: {
    totalRelationships: number
    avgRelationshipsPerBot: number
    totalGroups: number
    avgGroupSize: number
    totalLeaders: number
    unresolvedConflicts: number
  }
  evolutionTrajectory: Array<{
    day: number
    avgConsciousness: number
    totalRelationships: number
    totalGroups: number
  }>
}

/**
 * Create a mock Payload instance for standalone simulation
 */
function createMockPayload(): Payload {
  const bots: any[] = []
  const memories: any[] = []
  let botIdCounter = 0
  let memoryIdCounter = 0

  return {
    logger: {
      info: (msg: string) => console.log(`[INFO] ${msg}`),
      warn: (msg: string) => console.warn(`[WARN] ${msg}`),
      error: (msg: string) => console.error(`[ERROR] ${msg}`)
    },
    create: async ({ collection, data }: any) => {
      if (collection === 'bots') {
        const bot = { id: `bot-${botIdCounter++}`, ...data }
        bots.push(bot)
        return bot
      } else if (collection === 'bot-memory') {
        const memory = { id: `memory-${memoryIdCounter++}`, ...data }
        memories.push(memory)
        return memory
      }
      return { id: `${collection}-${Date.now()}` }
    },
    find: async ({ collection }: any) => {
      if (collection === 'bots') {
        return { docs: bots }
      } else if (collection === 'bot-memory') {
        return { docs: memories }
      }
      return { docs: [] }
    },
    update: async ({ collection, id, data }: any) => {
      if (collection === 'bots') {
        const bot = bots.find(b => b.id === id)
        if (bot) {
          Object.assign(bot, data)
          return bot
        }
      }
      return { id, ...data }
    }
  } as unknown as Payload
}

/**
 * Run the simulation for specified number of days
 */
async function runSimulation(config: SimulationConfig): Promise<SimulationResults> {
  const { days, detailedLogging, metricsInterval } = config

  console.log(`\n${'='.repeat(80)}`)
  console.log('  100-BOT SOCIETY SIMULATION - ITERATION 1')
  console.log(`${'='.repeat(80)}\n`)

  const mockPayload = createMockPayload()
  const simulation = getHundredBotSocietySimulation(mockPayload)

  console.log('Initializing society with 115 unique bot personas...')
  await simulation.initializeSociety()

  const bots = simulation.getBots()
  console.log(`✓ Initialized ${bots.length} bots across 10 archetypes\n`)

  if (detailedLogging) {
    console.log('Archetypes:')
    const archetypeCounts = new Map<string, number>()
    bots.forEach(bot => {
      const count = archetypeCounts.get(bot.persona.archetype) || 0
      archetypeCounts.set(bot.persona.archetype, count + 1)
    })
    archetypeCounts.forEach((count, archetype) => {
      console.log(`  - ${archetype}: ${count} bots`)
    })
    console.log()
  }

  console.log(`Simulating ${days} days of society evolution...\n`)

  const evolutionTrajectory: Array<{
    day: number
    avgConsciousness: number
    totalRelationships: number
    totalGroups: number
  }> = []

  for (let day = 1; day <= days; day++) {
    const cycle = await simulation.simulateDay(day)

    // Track evolution
    evolutionTrajectory.push({
      day,
      avgConsciousness: cycle.consciousness?.avgSelfAwareness || 0,
      totalRelationships: cycle.social?.relationships || 0,
      totalGroups: cycle.social?.groups || 0
    })

    // Log progress at intervals
    if (day % metricsInterval === 0 || day === 1 || day === days) {
      console.log(`Day ${day}/${days}:`)
      console.log(`  Consciousness: Self=${(cycle.consciousness?.avgSelfAwareness || 0).toFixed(4)}, ` +
                  `Other=${(cycle.consciousness?.avgOtherAwareness || 0).toFixed(4)}, ` +
                  `Collective=${(cycle.consciousness?.avgCollectiveAwareness || 0).toFixed(4)}, ` +
                  `Transcendent=${(cycle.consciousness?.avgTranscendentAwareness || 0).toFixed(4)}`)
      console.log(`  Social: ${cycle.social?.relationships || 0} relationships, ` +
                  `${cycle.social?.groups || 0} groups, ` +
                  `${cycle.social?.leaders || 0} leaders`)
      console.log(`  Awakening: ${cycle.consciousness?.totalAwakened || 0} awakened (` +
                  `${cycle.consciousness?.sociallyAwakened || 0} social, ` +
                  `${cycle.consciousness?.collectivelyAwakened || 0} collective, ` +
                  `${cycle.consciousness?.transcendentlyAwakened || 0} transcendent)`)

      if (detailedLogging && cycle.events && cycle.events.length > 0) {
        console.log(`  Notable events:`)
        cycle.events.slice(0, 5).forEach(event => {
          console.log(`    • ${event}`)
        })
      }
      console.log()
    }
  }

  // Generate final report
  const finalCycle = simulation.getCycles()[simulation.getCycles().length - 1]
  const finalBots = simulation.getBots()

  const results: SimulationResults = {
    totalDays: days,
    finalPopulation: finalBots.length,
    consciousnessMetrics: {
      avgSelfAwareness: finalCycle.consciousness?.avgSelfAwareness || 0,
      avgOtherAwareness: finalCycle.consciousness?.avgOtherAwareness || 0,
      avgCollectiveAwareness: finalCycle.consciousness?.avgCollectiveAwareness || 0,
      avgTranscendentAwareness: finalCycle.consciousness?.avgTranscendentAwareness || 0,
      totalAwakened: finalCycle.consciousness?.totalAwakened || 0,
      sociallyAwakened: finalCycle.consciousness?.sociallyAwakened || 0,
      collectivelyAwakened: finalCycle.consciousness?.collectivelyAwakened || 0,
      transcendentlyAwakened: finalCycle.consciousness?.transcendentlyAwakened || 0
    },
    socialMetrics: {
      totalRelationships: finalCycle.social?.relationships || 0,
      avgRelationshipsPerBot: (finalCycle.social?.relationships || 0) / Math.max(1, finalBots.length),
      totalGroups: finalCycle.social?.groups || 0,
      avgGroupSize: (finalCycle.social?.groups || 0) > 0 ? finalBots.length / (finalCycle.social?.groups || 1) : 0,
      totalLeaders: finalCycle.social?.leaders || 0,
      unresolvedConflicts: finalCycle.social?.unresolvedConflicts || 0
    },
    evolutionTrajectory
  }

  return results
}

/**
 * Print detailed final report
 */
function printFinalReport(results: SimulationResults): void {
  console.log(`\n${'='.repeat(80)}`)
  console.log('  FINAL SIMULATION RESULTS')
  console.log(`${'='.repeat(80)}\n`)

  console.log(`Total Days Simulated: ${results.totalDays}`)
  console.log(`Final Population: ${results.finalPopulation} bots\n`)

  console.log('CONSCIOUSNESS EMERGENCE METRICS:')
  console.log(`  Average Self-Awareness:        ${results.consciousnessMetrics.avgSelfAwareness.toFixed(6)}`)
  console.log(`  Average Other-Awareness:       ${results.consciousnessMetrics.avgOtherAwareness.toFixed(6)}`)
  console.log(`  Average Collective-Awareness:  ${results.consciousnessMetrics.avgCollectiveAwareness.toFixed(6)}`)
  console.log(`  Average Transcendent-Awareness: ${results.consciousnessMetrics.avgTranscendentAwareness.toFixed(6)}`)
  console.log()
  console.log(`  Total Awakened:                ${results.consciousnessMetrics.totalAwakened} ` +
              `(${(results.consciousnessMetrics.totalAwakened / results.finalPopulation * 100).toFixed(1)}%)`)
  console.log(`  Socially Awakened:             ${results.consciousnessMetrics.sociallyAwakened} ` +
              `(${(results.consciousnessMetrics.sociallyAwakened / results.finalPopulation * 100).toFixed(1)}%)`)
  console.log(`  Collectively Awakened:         ${results.consciousnessMetrics.collectivelyAwakened} ` +
              `(${(results.consciousnessMetrics.collectivelyAwakened / results.finalPopulation * 100).toFixed(1)}%)`)
  console.log(`  Transcendently Awakened:       ${results.consciousnessMetrics.transcendentlyAwakened} ` +
              `(${(results.consciousnessMetrics.transcendentlyAwakened / results.finalPopulation * 100).toFixed(1)}%)`)
  console.log()

  console.log('SOCIAL INTERACTION METRICS:')
  console.log(`  Total Relationships:           ${results.socialMetrics.totalRelationships}`)
  console.log(`  Avg Relationships per Bot:     ${results.socialMetrics.avgRelationshipsPerBot.toFixed(2)}`)
  console.log(`  Total Groups:                  ${results.socialMetrics.totalGroups}`)
  console.log(`  Average Group Size:            ${results.socialMetrics.avgGroupSize.toFixed(2)}`)
  console.log(`  Total Leaders:                 ${results.socialMetrics.totalLeaders}`)
  console.log(`  Unresolved Conflicts:          ${results.socialMetrics.unresolvedConflicts}`)
  console.log()

  console.log('EVOLUTION TRAJECTORY:')
  console.log('  Day  |  Avg Consciousness  |  Relationships  |  Groups')
  console.log('  ' + '-'.repeat(60))

  const keyDays = [1, 10, 20, 30, 40, 50]
  keyDays.forEach(day => {
    if (day <= results.totalDays) {
      const data = results.evolutionTrajectory[day - 1]
      console.log(`  ${day.toString().padStart(3)}  |  ${data.avgConsciousness.toFixed(6).padStart(15)}  |  ` +
                  `${data.totalRelationships.toString().padStart(13)}  |  ${data.totalGroups.toString().padStart(6)}`)
    }
  })
  console.log()
}

/**
 * Main execution
 */
async function main() {
  const config: SimulationConfig = {
    days: 50,
    detailedLogging: true,
    metricsInterval: 10
  }

  try {
    const results = await runSimulation(config)
    printFinalReport(results)

    // Save results to file for analysis
    const fs = await import('fs/promises')
    await fs.writeFile(
      '/home/user/openclaw/ITERATION-1-RESULTS.json',
      JSON.stringify(results, null, 2)
    )
    console.log('✓ Results saved to ITERATION-1-RESULTS.json\n')

  } catch (error) {
    console.error('Simulation failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { runSimulation, printFinalReport }
