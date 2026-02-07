/**
 * Network Analysis Utilities
 *
 * Graph algorithms for social network analysis, including community detection
 * and bridge score calculation (resolves TODO in society-formation.ts).
 */

export interface NetworkNode {
  id: string
  connections: Set<string>
}

export interface Community {
  id: string
  members: Set<string>
  density: number
}

export interface BridgeAnalysis {
  bridgeScore: number
  connectedCommunities: number
  totalCommunities: number
  bridgeConnections: string[]
}

/**
 * Build network graph from relationships
 */
export function buildNetworkGraph(relationships: Array<{
  bot1: string
  bot2: string
  strength: number
}>): Map<string, NetworkNode> {
  const graph = new Map<string, NetworkNode>()

  for (const rel of relationships) {
    // Ensure both nodes exist
    if (!graph.has(rel.bot1)) {
      graph.set(rel.bot1, { id: rel.bot1, connections: new Set() })
    }
    if (!graph.has(rel.bot2)) {
      graph.set(rel.bot2, { id: rel.bot2, connections: new Set() })
    }

    // Add bidirectional connection
    graph.get(rel.bot1)!.connections.add(rel.bot2)
    graph.get(rel.bot2)!.connections.add(rel.bot1)
  }

  return graph
}

/**
 * Detect communities using simple label propagation algorithm
 * (Fast approximation suitable for real-time simulation)
 */
export function detectCommunities(
  graph: Map<string, NetworkNode>,
  maxIterations: number = 10
): Community[] {
  // Initialize each node with unique label
  const labels = new Map<string, string>()
  for (const nodeId of graph.keys()) {
    labels.set(nodeId, nodeId)
  }

  // Iteratively update labels
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false
    const nodeIds = Array.from(graph.keys())

    // Randomize order to avoid bias
    for (let i = nodeIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[nodeIds[i], nodeIds[j]] = [nodeIds[j], nodeIds[i]]
    }

    // Update each node's label to most common among neighbors
    for (const nodeId of nodeIds) {
      const node = graph.get(nodeId)!
      const neighborLabels = new Map<string, number>()

      for (const neighborId of node.connections) {
        const label = labels.get(neighborId)!
        neighborLabels.set(label, (neighborLabels.get(label) || 0) + 1)
      }

      if (neighborLabels.size === 0) continue

      // Find most common label
      const sortedLabels = Array.from(neighborLabels.entries())
        .sort((a, b) => b[1] - a[1])
      const mostCommonLabel = sortedLabels[0][0]

      if (labels.get(nodeId) !== mostCommonLabel) {
        labels.set(nodeId, mostCommonLabel)
        changed = true
      }
    }

    // Converged
    if (!changed) break
  }

  // Build communities from labels
  const communityMap = new Map<string, Set<string>>()
  for (const [nodeId, label] of labels.entries()) {
    if (!communityMap.has(label)) {
      communityMap.set(label, new Set())
    }
    communityMap.get(label)!.add(nodeId)
  }

  // Calculate density for each community
  const communities: Community[] = []
  let communityIndex = 0

  for (const members of communityMap.values()) {
    if (members.size < 2) continue // Skip singleton communities

    // Calculate internal connections
    let internalEdges = 0
    let possibleEdges = 0

    for (const nodeId of members) {
      const node = graph.get(nodeId)!
      for (const neighborId of node.connections) {
        if (members.has(neighborId)) {
          internalEdges++
        }
      }
      possibleEdges += members.size - 1
    }

    // Divide by 2 (bidirectional edges counted twice)
    internalEdges /= 2

    const density = possibleEdges > 0 ? internalEdges / possibleEdges : 0

    communities.push({
      id: `community-${communityIndex++}`,
      members,
      density
    })
  }

  return communities
}

/**
 * Calculate bridge score for a bot
 * Measures how well the bot connects different communities
 */
export function calculateBridgeScore(
  botId: string,
  graph: Map<string, NetworkNode>,
  communities: Community[]
): BridgeAnalysis {
  const node = graph.get(botId)
  if (!node) {
    return {
      bridgeScore: 0,
      connectedCommunities: 0,
      totalCommunities: communities.length,
      bridgeConnections: []
    }
  }

  // Find which community the bot belongs to
  let botCommunity: Community | null = null
  for (const community of communities) {
    if (community.members.has(botId)) {
      botCommunity = community
      break
    }
  }

  // Count connections to different communities
  const connectedCommunities = new Set<string>()
  const bridgeConnections: string[] = []

  for (const neighborId of node.connections) {
    // Find neighbor's community
    for (const community of communities) {
      if (community.members.has(neighborId)) {
        // If different from bot's community, it's a bridge connection
        if (!botCommunity || community.id !== botCommunity.id) {
          connectedCommunities.add(community.id)
          bridgeConnections.push(neighborId)
        }
        break
      }
    }
  }

  // Bridge score = proportion of communities connected
  const bridgeScore = communities.length > 1
    ? connectedCommunities.size / (communities.length - 1)
    : 0

  return {
    bridgeScore: Math.min(1.0, bridgeScore),
    connectedCommunities: connectedCommunities.size,
    totalCommunities: communities.length,
    bridgeConnections
  }
}

/**
 * Calculate network centrality measures
 */
export interface CentralityMeasures {
  degree: number // Number of connections
  normalizedDegree: number // Degree / max possible
  betweenness: number // Not implemented (expensive)
  closeness: number // Not implemented (expensive)
}

export function calculateCentrality(
  botId: string,
  graph: Map<string, NetworkNode>
): CentralityMeasures {
  const node = graph.get(botId)
  if (!node) {
    return {
      degree: 0,
      normalizedDegree: 0,
      betweenness: 0,
      closeness: 0
    }
  }

  const degree = node.connections.size
  const maxPossible = graph.size - 1
  const normalizedDegree = maxPossible > 0 ? degree / maxPossible : 0

  return {
    degree,
    normalizedDegree,
    betweenness: 0, // TODO: Implement if needed (expensive)
    closeness: 0 // TODO: Implement if needed (expensive)
  }
}

/**
 * Find shortest path between two nodes (BFS)
 */
export function findShortestPath(
  graph: Map<string, NetworkNode>,
  startId: string,
  endId: string
): string[] | null {
  if (startId === endId) return [startId]

  const visited = new Set<string>()
  const queue: Array<{ id: string; path: string[] }> = [{ id: startId, path: [startId] }]

  while (queue.length > 0) {
    const { id, path } = queue.shift()!

    if (id === endId) {
      return path
    }

    if (visited.has(id)) continue
    visited.add(id)

    const node = graph.get(id)
    if (!node) continue

    for (const neighborId of node.connections) {
      if (!visited.has(neighborId)) {
        queue.push({
          id: neighborId,
          path: [...path, neighborId]
        })
      }
    }
  }

  return null // No path exists
}

/**
 * Calculate clustering coefficient (transitivity)
 * Measures how connected a bot's neighbors are to each other
 */
export function calculateClusteringCoefficient(
  botId: string,
  graph: Map<string, NetworkNode>
): number {
  const node = graph.get(botId)
  if (!node || node.connections.size < 2) {
    return 0
  }

  const neighbors = Array.from(node.connections)
  let triangles = 0
  let possibleTriangles = 0

  // Check all pairs of neighbors
  for (let i = 0; i < neighbors.length; i++) {
    for (let j = i + 1; j < neighbors.length; j++) {
      const neighbor1 = graph.get(neighbors[i])
      const neighbor2 = graph.get(neighbors[j])

      possibleTriangles++

      // Check if neighbors are connected to each other
      if (neighbor1 && neighbor2 && neighbor1.connections.has(neighbors[j])) {
        triangles++
      }
    }
  }

  return possibleTriangles > 0 ? triangles / possibleTriangles : 0
}

/**
 * Analyze network structure
 */
export interface NetworkStatistics {
  totalNodes: number
  totalEdges: number
  averageDegree: number
  density: number
  communities: number
  averageCommunitySize: number
  largestCommunitySize: number
  isolatedNodes: number
}

export function analyzeNetwork(
  graph: Map<string, NetworkNode>,
  communities: Community[]
): NetworkStatistics {
  const totalNodes = graph.size
  let totalEdges = 0
  let isolatedNodes = 0

  for (const node of graph.values()) {
    totalEdges += node.connections.size
    if (node.connections.size === 0) {
      isolatedNodes++
    }
  }

  // Divide by 2 (each edge counted twice)
  totalEdges /= 2

  const averageDegree = totalNodes > 0 ? (totalEdges * 2) / totalNodes : 0
  const maxPossibleEdges = (totalNodes * (totalNodes - 1)) / 2
  const density = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0

  const totalCommunityMembers = communities.reduce((sum, c) => sum + c.members.size, 0)
  const averageCommunitySize = communities.length > 0 ? totalCommunityMembers / communities.length : 0
  const largestCommunitySize = communities.length > 0
    ? Math.max(...communities.map(c => c.members.size))
    : 0

  return {
    totalNodes,
    totalEdges,
    averageDegree,
    density,
    communities: communities.length,
    averageCommunitySize,
    largestCommunitySize,
    isolatedNodes
  }
}
