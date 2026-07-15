import type { ScoreBreakdown } from './types'
import { DEFAULT_WEIGHTS } from './weights'
import { clamp, normalize, logScale, rateToScore } from './normalize'
import { daysSince } from '../../utils/dates'

const TRENDING_TECH = new Set([
  'ai', 'llm', 'machine-learning', 'deep-learning', 'rust', 'go', 'wasm', 'webassembly',
  'webgpu', 'ebpf', 'kubernetes', 'cloud-native', 'security', 'tauri', 'deno', 'bun',
  'openai', 'gpt', 'langchain', 'vector-database', 'edge-computing', 'serverless',
])

const QUALITY_TOPICS = new Set([
  'documentation', 'docs', 'testing', 'tests', 'ci', 'cd', 'hacktoberfest',
  'good-first-issue', 'contributing', 'changelog',
])

export function calcGrowth(stars: number, ageDays: number, forks: number): { value: number; reasons: string[] } {
  const reasons: string[] = []
  if (ageDays < 1) return { value: 0, reasons: ['Insufficient age data'] }

  const starVelocity = stars / ageDays
  const velocityScore = rateToScore(starVelocity, 100)

  if (starVelocity > 0) {
    reasons.push(`+${starVelocity.toFixed(1)} stars/day`)
  }

  const growthRate = (starVelocity * 30 / Math.max(stars, 1)) * 100
  const rateScore = rateToScore(growthRate * 10, 100)

  if (growthRate > 5) {
    reasons.push(`${growthRate.toFixed(0)}% monthly growth rate`)
  }

  const forkRatio = forks / Math.max(stars, 1)
  const accelScore = forkRatio > 0.3 ? 80 : forkRatio > 0.15 ? 60 : 30

  if (forkRatio > 0.3) {
    reasons.push('High fork/star ratio signals strong community adoption')
  }

  const value = clamp(Math.round(velocityScore * 0.4 + rateScore * 0.35 + accelScore * 0.25), 0, 100)
  return { value, reasons }
}

export function calcMomentum(pushedAt: string, createdAt: string): { value: number; reasons: string[] } {
  const reasons: string[] = []
  const daysSinceUpdate = daysSince(pushedAt)
  const ageDays = daysSince(createdAt) || 1

  let value: number
  if (daysSinceUpdate <= 7) {
    value = 95
    reasons.push('Active development (commits this week)')
  } else if (daysSinceUpdate <= 30) {
    value = 80
    reasons.push('Recent activity (last 30 days)')
  } else if (daysSinceUpdate <= 90) {
    value = 60
    reasons.push('Moderate activity (last 3 months)')
  } else if (daysSinceUpdate <= 180) {
    value = 40
    reasons.push('Low activity')
  } else {
    value = 15
    reasons.push('Inactive (>6 months since last update)')
  }

  const agePenalty = Math.min(20, Math.floor(ageDays / 365) * 2)
  if (agePenalty > 0 && value < 80) {
    value = Math.max(0, value - agePenalty)
  }

  return { value, reasons }
}

export function calcCommunity(
  stars: number,
  forks: number,
  subscribers: number,
  hasDiscussions: boolean,
  openIssues: number,
): { value: number; reasons: string[] } {
  const reasons: string[] = []

  const contributorProxy = logScale(forks, 50000, 35)
  const forkGrowth = forks / Math.max(stars, 1)
  const forkScore = rateToScore(forkGrowth * 100, 50, 20)

  if (forks > 1000) {
    reasons.push(`${(forks / 1000).toFixed(1)}k forks — strong community engagement`)
  } else if (forks > 100) {
    reasons.push(`${forks} forks — growing community interest`)
  }

  let subscriberScore = 0
  if (subscribers > 0) {
    subscriberScore = logScale(subscribers, 50000, 20)
    if (subscribers > 100) {
      reasons.push(`${subscribers} watchers — active follower base`)
    }
  }

  let discussionScore = 0
  if (hasDiscussions) {
    discussionScore = 10
    reasons.push('Has discussions — community interaction enabled')
  }

  let issueScore = 0
  if (openIssues > 0) {
    issueScore = Math.min(15, Math.round(Math.log10(openIssues + 1) * 5))
  }

  const value = clamp(Math.round(contributorProxy + forkScore + subscriberScore + discussionScore + issueScore), 0, 100)
  if (value < 10 && reasons.length === 0) {
    reasons.push('Limited community data')
  }

  return { value, reasons }
}

export function calcQuality(
  description: string | null,
  license: { spdx_id: string } | null,
  topics: string[],
  size: number,
  hasIssues: boolean,
  hasWiki: boolean,
  hasPages: boolean,
  hasDiscussions: boolean,
  archived: boolean,
  disabled: boolean,
  isFork: boolean,
  defaultBranch: string,
  homepage: string | null,
): { value: number; reasons: string[] } {
  const reasons: string[] = []

  if (archived || disabled) {
    return { value: 5, reasons: ['Repository is archived or disabled'] }
  }

  let score = 0

  if (description && description.length > 20) {
    score += 15
    reasons.push('Well-written description')
  } else if (description && description.length > 5) {
    score += 10
  }

  if (license && license.spdx_id && license.spdx_id !== 'NOASSERTION') {
    score += 15
    reasons.push(`${license.spdx_id} license`)
  } else {
    score += 3
  }

  const qualityTopicCount = topics.filter(t => QUALITY_TOPICS.has(t.toLowerCase())).length
  score += clamp(qualityTopicCount * 8, 0, 20)
  if (qualityTopicCount > 0) {
    reasons.push('Documentation/testing signals in topics')
  }

  if (hasIssues) {
    score += 8
    reasons.push('Issue tracking enabled')
  }

  if (hasWiki) {
    score += 8
  }

  if (hasPages) {
    score += 8
    reasons.push('GitHub Pages site — dedicated documentation')
  }

  if (hasDiscussions) {
    score += 5
  }

  if (homepage) {
    score += 6
    reasons.push('Has project website')
  }

  if (defaultBranch === 'main') {
    score += 5
  }

  if (isFork) score = Math.max(0, score - 10)

  const sizeScore = size > 100 ? 10 : size > 10 ? 5 : 2
  score += sizeScore

  const value = clamp(score, 0, 100)
  if (value < 30) {
    reasons.push('Limited quality signals')
  } else if (reasons.length === 0) {
    reasons.push('Repository has basic quality indicators')
  }

  return { value, reasons }
}

export function calcTrend(topics: string[], language: string | null): { value: number; reasons: string[] } {
  const reasons: string[] = []
  let score = 20

  const allTerms = [...topics.map(t => t.toLowerCase()), ...(language ? [language.toLowerCase()] : [])]
  const matchCount = allTerms.filter(t => TRENDING_TECH.has(t)).length

  if (matchCount > 0) {
    score += clamp(matchCount * 15, 0, 60)
    const matched = allTerms.filter(t => TRENDING_TECH.has(t))
    if (matched.length > 0) {
      reasons.push(`${matched.slice(0, 3).join(', ')} ecosystem`)
    }
  }

  if (language) {
    const langTrendBonus: Record<string, number> = {
      rust: 15, go: 10, python: 5, typescript: 5, zig: 15,
    }
    score += langTrendBonus[language.toLowerCase()] || 0
    if (langTrendBonus[language.toLowerCase()]) {
      reasons.push(`${language} is a trending ecosystem`)
    }
  }

  const value = clamp(score, 0, 100)
  return { value, reasons }
}

export function calculateRadarScore(params: {
  stargazers_count: number
  forks_count: number
  description: string | null
  created_at: string
  pushed_at: string
  topics: string[]
  license: { spdx_id: string } | null
  size: number
  language: string | null
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
}): ScoreBreakdown {
  const ageDays = daysSince(params.created_at) || 1

  const growth = calcGrowth(params.stargazers_count, ageDays, params.forks_count)
  const momentum = calcMomentum(params.pushed_at, params.created_at)
  const community = calcCommunity(params.stargazers_count, params.forks_count, params.subscribers_count, params.has_discussions, params.open_issues_count)
  const quality = calcQuality(params.description, params.license, params.topics, params.size, params.has_issues, params.has_wiki, params.has_pages, params.has_discussions, params.archived, params.disabled, params.fork, params.default_branch, params.homepage)
  const trend = calcTrend(params.topics, params.language)

  const total = clamp(Math.round(
    growth.value * DEFAULT_WEIGHTS.growth +
    momentum.value * DEFAULT_WEIGHTS.momentum +
    community.value * DEFAULT_WEIGHTS.community +
    quality.value * DEFAULT_WEIGHTS.quality +
    trend.value * DEFAULT_WEIGHTS.trend
  ), 0, 100)

  return { total, growth, momentum, community, quality, trend }
}
