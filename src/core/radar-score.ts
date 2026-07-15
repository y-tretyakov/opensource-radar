import type { RadarScore } from '../models/repository'
import { daysSince } from '../utils/dates'

export function calculateRadarScore(repo: {
  stargazers_count: number
  forks_count: number
  description: string | null
  created_at: string
  pushed_at: string
}): RadarScore {
  const ageDays = daysSince(repo.created_at) || 1
  const growthPerDay = repo.stargazers_count / ageDays
  const daysSinceUpdate = daysSince(repo.pushed_at)

  const popularity = Math.min(40, Math.round(Math.log10(repo.stargazers_count + 1) * 12))
  const growth = Math.min(25, Math.round(growthPerDay * 2))
  const activity = Math.min(20, Math.max(0, 20 - Math.floor(daysSinceUpdate / 18)))
  const forkScore = Math.min(10, Math.round(Math.log10(repo.forks_count + 1) * 4))
  const descScore = (repo.description && repo.description.length > 10) ? 5 : 0
  const total = Math.min(100, popularity + growth + activity + forkScore + descScore)

  return { total, growth, activity, popularity }
}

export function enrichRepo(repo: {
  id: number
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  created_at: string
  pushed_at: string
  topics: string[]
  owner: { login: string; avatar_url: string; html_url: string }
  license: { spdx_id: string } | null
  size: number
}) {
  const ageDays = daysSince(repo.created_at) || 1
  const growthPerDay = repo.stargazers_count / ageDays
  const weeklyGrowth = Math.round(growthPerDay * 7)
  const daysSinceUpdate = daysSince(repo.pushed_at)

  let trend = ''
  const gpd = growthPerDay
  if (gpd > 50) trend = '🔥 Hot'
  else if (gpd > 20) trend = '🚀 Rising Star'
  else if (gpd > 5) trend = '↗ Trending'

  let activity = '🟢 Active'
  if (daysSinceUpdate > 365) activity = '🔴 Archived'
  else if (daysSinceUpdate > 90) activity = '🟡 Slow'

  const score = calculateRadarScore(repo)

  return {
    ...repo,
    _ageDays: ageDays,
    _growthPerDay: gpd,
    _weeklyGrowth: weeklyGrowth,
    _trend: trend,
    _activity: activity,
    _score: score.total,
    _trendLabel: trend.split(' ').slice(1).join(' ') || trend,
    _trendIcon: trend.split(' ')[0] || '',
  }
}

export function analyzeRepos() {
  // future: trend analysis, anomaly detection, signal scoring
}

export function computeTrends() {
  // future: weekly/monthly trend computation
}
