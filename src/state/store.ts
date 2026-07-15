import type { EnrichedRepository } from '../models/repository'

import type { DiscoveryMode } from '../api/types'

export type ViewMode = 'grid' | 'list' | 'map'

export interface RadarStoreState {
  view: ViewMode
  page: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  repositories: EnrichedRepository[]
  tracked: Set<string>
  mode: DiscoveryMode
  compareList: string[]
}

type Listener = () => void

class Store {
  private state: RadarStoreState
  private listeners: Set<Listener> = new Set()

  constructor() {
    this.state = {
      view: 'grid',
      page: 1,
      sortBy: 'stars',
      sortOrder: 'desc',
      repositories: [],
      tracked: new Set<string>(),
      mode: 'trending',
      compareList: [],
    }
  }

  getState(): RadarStoreState {
    return this.state
  }

  setState(partial: Partial<RadarStoreState>): void {
    this.state = { ...this.state, ...partial }
    this.notify()
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private notify(): void {
    this.listeners.forEach(fn => fn())
  }
}

export const store = new Store()
