import type { EnrichedRepository } from '../models/repository'

export interface RadarStoreState {
  view: 'grid' | 'list'
  page: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  repositories: EnrichedRepository[]
  tracked: Set<string>
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
