/**
 * Instinct Reflex System
 * Handles automatic responses and reflexes
 */

export interface Stimulus {
  type: string
  intensity: number
  context?: any
}

export interface ReflexResponse {
  action: string
  intensity: number
  automatic: boolean
}

export interface InstinctReflexState {
  activeReflexes: string[]
  threshold: number
  sensitivity: number
}

export class InstinctReflexSystem {
  private state: InstinctReflexState

  constructor() {
    this.state = {
      activeReflexes: [],
      threshold: 0.5,
      sensitivity: 1.0
    }
  }

  processStimulus(stimulus: Stimulus): ReflexResponse | null {
    if (stimulus.intensity < this.state.threshold) {
      return null
    }

    return {
      action: `reflex-${stimulus.type}`,
      intensity: stimulus.intensity * this.state.sensitivity,
      automatic: true
    }
  }

  getState(): InstinctReflexState {
    return { ...this.state }
  }

  updateState(updates: Partial<InstinctReflexState>): void {
    this.state = { ...this.state, ...updates }
  }
}
