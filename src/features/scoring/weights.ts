import type { RadarScoreWeights } from './types'

export const DEFAULT_WEIGHTS: RadarScoreWeights = {
  growth: 0.25,
  momentum: 0.20,
  community: 0.20,
  quality: 0.20,
  trend: 0.15,
}
