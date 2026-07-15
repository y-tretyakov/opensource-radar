export interface ScoreComponent {
  value: number
  reasons: string[]
}

export interface ScoreBreakdown {
  total: number
  growth: ScoreComponent
  momentum: ScoreComponent
  community: ScoreComponent
  quality: ScoreComponent
  trend: ScoreComponent
}

export type Badge = 'HOT' | 'RISING_STAR' | 'EXPLODING' | 'HIDDEN_GEM' | 'ESTABLISHED'

export interface RadarScoreWeights {
  growth: number
  momentum: number
  community: number
  quality: number
  trend: number
}

export type ProjectClassification =
  | 'CLI'
  | 'Framework'
  | 'Library'
  | 'AI Tool'
  | 'DevOps'
  | 'Database'
  | 'Security'
  | 'Desktop'
  | 'Mobile'
  | 'Game'
  | 'Embedded'
  | 'Web'
  | 'Unknown'

export interface ScoredRepoExtra {
  _score: number
  _scoreBreakdown: ScoreBreakdown
  _badges: Badge[]
  _classification: ProjectClassification
  _scoreDescription: string
}
