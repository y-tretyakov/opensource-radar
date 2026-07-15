import type { InsightRepoData, RepositoryInsight, InsightSignal, InsightProvider } from './types'
import { evaluateGrowthRules } from './rules/growth.rules'
import { evaluateActivityRules } from './rules/activity.rules'
import { evaluateQualityRules } from './rules/quality.rules'
import { evaluateCommunityRules } from './rules/community.rules'
import { evaluateTechnologyRules } from './rules/technology.rules'
import { generateSummary } from './templates/messages'

export function repoToInsightData(repo: {
  full_name: string
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  description: string | null
  created_at: string
  pushed_at: string
  subscribers_count: number
  open_issues_count: number
  has_issues: boolean
  has_wiki: boolean
  has_pages: boolean
  has_discussions: boolean
  archived: boolean
  disabled: boolean
  fork: boolean
  license: { spdx_id: string } | null
  homepage: string | null
  default_branch: string
  _score: number
  _growthPerDay: number
  _weeklyGrowth: number
  _badges: string[]
  _scoreBreakdown: {
    growth: { value: number }
    momentum: { value: number }
    community: { value: number }
    quality: { value: number }
    trend: { value: number }
  }
}): InsightRepoData {
  const daysSinceUpdate = Math.floor((Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24))
  const ageDays = Math.floor((Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24)) || 1
  return {
    name: repo.full_name,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    topics: repo.topics,
    description: repo.description,
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
    subscribersCount: repo.subscribers_count,
    openIssuesCount: repo.open_issues_count,
    hasIssues: repo.has_issues,
    hasWiki: repo.has_wiki,
    hasPages: repo.has_pages,
    hasDiscussions: repo.has_discussions,
    archived: repo.archived,
    disabled: repo.disabled,
    isFork: repo.fork,
    license: repo.license?.spdx_id || null,
    homepage: repo.homepage,
    defaultBranch: repo.default_branch,
    score: repo._score,
    growthScore: repo._scoreBreakdown.growth.value,
    momentumScore: repo._scoreBreakdown.momentum.value,
    communityScore: repo._scoreBreakdown.community.value,
    qualityScore: repo._scoreBreakdown.quality.value,
    trendScore: repo._scoreBreakdown.trend.value,
    growthPerDay: repo._growthPerDay,
    weeklyGrowth: repo._weeklyGrowth,
    daysSinceUpdate,
    ageDays,
    badges: repo._badges,
  }
}

export class RadarInsightEngine implements InsightProvider {
  analyze(repo: InsightRepoData): RepositoryInsight {
    const allSignals: InsightSignal[] = [
      ...evaluateGrowthRules(repo),
      ...evaluateActivityRules(repo),
      ...evaluateQualityRules(repo),
      ...evaluateCommunityRules(repo),
      ...evaluateTechnologyRules(repo),
    ]

    allSignals.sort((a, b) => b.weight - a.weight)

    const strengths = allSignals
      .filter(s => s.type === 'positive' && s.weight >= 50)
      .map(s => s.title)

    const warnings = allSignals
      .filter(s => s.type === 'warning')
      .map(s => s.title)

    const labels = repo.badges.length > 0
      ? repo.badges.map(b => b.replace(/_/g, ' '))
      : []

    const positiveCount = allSignals.filter(s => s.type === 'positive').length
    const totalPossible = 15
    const confidence = Math.min(100, Math.round((positiveCount / totalPossible) * 100))

    const summary = generateSummary(repo, allSignals)

    return { summary, signals: allSignals, strengths, warnings, labels, confidence }
  }
}

export const insightEngine = new RadarInsightEngine()
