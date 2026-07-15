export interface InsightSignal {
  type: 'positive' | 'warning' | 'neutral'
  title: string
  description: string
  weight: number
  category: string
}

export interface RepositoryInsight {
  summary: string
  signals: InsightSignal[]
  strengths: string[]
  warnings: string[]
  labels: string[]
  confidence: number
}

export interface InsightProvider {
  analyze(repo: InsightRepoData): RepositoryInsight
}

export interface InsightRepoData {
  name: string
  stars: number
  forks: number
  language: string | null
  topics: string[]
  description: string | null
  createdAt: string
  pushedAt: string
  subscribersCount: number
  openIssuesCount: number
  hasIssues: boolean
  hasWiki: boolean
  hasPages: boolean
  hasDiscussions: boolean
  archived: boolean
  disabled: boolean
  isFork: boolean
  license: string | null
  homepage: string | null
  defaultBranch: string
  score: number
  growthScore: number
  momentumScore: number
  communityScore: number
  qualityScore: number
  trendScore: number
  growthPerDay: number
  weeklyGrowth: number
  daysSinceUpdate: number
  ageDays: number
  badges: string[]
}
