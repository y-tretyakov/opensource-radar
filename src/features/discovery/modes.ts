export type DiscoveryMode =
  | 'trending'
  | 'hidden-gems'
  | 'exploding'
  | 'new'
  | 'established'
  | 'search'
  | 'tracking'

export interface ModeConfig {
  id: DiscoveryMode
  label: string
  icon: string
  description: string
  buildQuery: (baseTopic: string) => string
  minStars?: number
  maxStars?: number
}

function dateDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

export const MODES: Record<DiscoveryMode, ModeConfig> = {
  trending: {
    id: 'trending',
    label: 'Trending Now',
    icon: '📡',
    description: 'Projects with highest current momentum',
    buildQuery: (topic: string) => `topic:${topic}+created:>=${dateDaysAgo(14)}+stars:>50`,
    minStars: 50,
  },
  'hidden-gems': {
    id: 'hidden-gems',
    label: 'Hidden Gems',
    icon: '💎',
    description: 'Undervalued projects with strong signals',
    buildQuery: (topic: string) => `topic:${topic}+created:>=${dateDaysAgo(90)}+stars:50..10000`,
    minStars: 50,
    maxStars: 10000,
  },
  exploding: {
    id: 'exploding',
    label: 'Exploding',
    icon: '🚀',
    description: 'Rapid growth acceleration',
    buildQuery: (topic: string) => `topic:${topic}+created:>=${dateDaysAgo(30)}+stars:>100`,
    minStars: 100,
  },
  new: {
    id: 'new',
    label: 'New & Promising',
    icon: '🌟',
    description: 'Recently created with potential',
    buildQuery: (topic: string) => `topic:${topic}+created:>=${dateDaysAgo(180)}+stars:>10`,
    minStars: 10,
  },
  established: {
    id: 'established',
    label: 'Established',
    icon: '🏛',
    description: 'Large mature projects',
    buildQuery: (topic: string) => `topic:${topic}+stars:>50000`,
    minStars: 50000,
  },
  search: {
    id: 'search',
    label: 'Search',
    icon: '🔍',
    description: 'Custom search',
    buildQuery: (topic: string) => `topic:${topic}+created:>=${dateDaysAgo(30)}+stars:10..1000`,
  },
  tracking: {
    id: 'tracking',
    label: 'Tracking',
    icon: '📡',
    description: 'Monitored projects',
    buildQuery: (_topic: string) => `stars:>1`,
    minStars: 1,
  },
}

export function getMode(id: DiscoveryMode): ModeConfig {
  return MODES[id]
}

export function getDefaultMode(): DiscoveryMode {
  return 'trending'
}
