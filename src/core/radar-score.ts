import { daysSince } from '../utils/dates'
import { calculateRadarScore as calcEngineScore } from '../features/scoring/engine'
import { applyBadges, classifyProject, scoreToString } from '../features/scoring/labels'
import type { ScoreBreakdown, Badge, ProjectClassification } from '../features/scoring/types'

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
  subscribers_count: number
  open_issues_count: number
  has_issues: boolean
  has_wiki: boolean
  has_pages: boolean
  has_discussions: boolean
  archived: boolean
  disabled: boolean
  fork: boolean
  default_branch: string
  homepage: string | null
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

  const scoreBreakdown: ScoreBreakdown = calcEngineScore(repo)
  const badges: Badge[] = applyBadges(scoreBreakdown, repo.stargazers_count)
  const classification: ProjectClassification = classifyProject(repo.topics, repo.language)

  return {
    ...repo,
    _ageDays: ageDays,
    _growthPerDay: gpd,
    _weeklyGrowth: weeklyGrowth,
    _trend: trend,
    _activity: activity,
    _score: scoreBreakdown.total,
    _scoreBreakdown: scoreBreakdown,
    _badges: badges,
    _classification: classification,
    _scoreDescription: scoreToString(scoreBreakdown.total),
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
