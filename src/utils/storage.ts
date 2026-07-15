const TRACKED_KEY = 'osr_tracked'
const SNAPSHOTS_KEY = 'osr_snapshots'

export interface RepoSnapshot {
  stars: number
  score: number
  growthPerDay: number
  forks: number
  updatedAt: string
}

export function loadTracked(): Set<string> {
  try {
    const data = JSON.parse(localStorage.getItem(TRACKED_KEY) || '[]')
    if (Array.isArray(data)) return new Set<string>(data)
    if (typeof data === 'object' && data !== null) return new Set<string>(Object.keys(data))
    return new Set<string>()
  } catch {
    return new Set<string>()
  }
}

export function saveTracked(tracked: Set<string>): void {
  try {
    localStorage.setItem(TRACKED_KEY, JSON.stringify([...tracked]))
  } catch {
    // localStorage may be full or unavailable
  }
}

export function loadSnapshots(): Record<string, RepoSnapshot> {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveSnapshot(name: string, snapshot: RepoSnapshot): void {
  try {
    const snapshots = loadSnapshots()
    snapshots[name] = snapshot
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots))
  } catch {
    // localStorage may be full
  }
}

export function saveSnapshots(snapshots: Record<string, RepoSnapshot>): void {
  try {
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots))
  } catch {
    // localStorage may be full
  }
}
