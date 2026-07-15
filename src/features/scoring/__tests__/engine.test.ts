import { describe, it, expect } from 'vitest'
import { calcGrowth, calcMomentum, calcCommunity, calcQuality, calcTrend, calculateRadarScore } from '../engine'

describe('calcGrowth', () => {
  it('returns high score for fast growth', () => {
    const result = calcGrowth(10000, 100, 5000)
    expect(result.value).toBeGreaterThan(60)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('returns low score for no growth', () => {
    const result = calcGrowth(10, 365, 0)
    expect(result.value).toBeLessThan(50)
  })

  it('handles very young repos', () => {
    const result = calcGrowth(100, 1, 50)
    expect(result.value).toBeGreaterThanOrEqual(0)
  })
})

describe('calcMomentum', () => {
  it('returns high for recent activity', () => {
    const now = new Date().toISOString()
    const created = new Date(Date.now() - 86400000 * 30).toISOString()
    const result = calcMomentum(now, created)
    expect(result.value).toBeGreaterThan(80)
  })

  it('returns low for old repos', () => {
    const old = new Date(Date.now() - 86400000 * 400).toISOString()
    const result = calcMomentum(old, old)
    expect(result.value).toBeLessThan(40)
  })

  it('returns very low for inactive repos', () => {
    const old = new Date(Date.now() - 86400000 * 200).toISOString()
    const veryOld = new Date(Date.now() - 86400000 * 800).toISOString()
    const result = calcMomentum(old, veryOld)
    expect(result.value).toBeLessThan(30)
  })
})

describe('calcCommunity', () => {
  it('returns higher score with more community signals', () => {
    const high = calcCommunity(10000, 3000, 500, true, 100)
    const low = calcCommunity(10, 0, 0, false, 0)
    expect(high.value).toBeGreaterThan(low.value)
  })

  it('returns reasons for strong community', () => {
    const result = calcCommunity(10000, 3000, 500, true, 100)
    expect(result.reasons.length).toBeGreaterThan(0)
  })
})

describe('calcQuality', () => {
  const base = {
    description: 'A well-written description with enough length',
    license: { spdx_id: 'MIT' },
    topics: ['testing', 'ci', 'docs'],
    size: 500,
    hasIssues: true,
    hasWiki: true,
    hasPages: true,
    hasDiscussions: true,
    archived: false,
    disabled: false,
    isFork: false,
    defaultBranch: 'main',
    homepage: 'https://example.com',
  }

  it('returns high score for quality repo', () => {
    const result = calcQuality(
      base.description, base.license, base.topics, base.size,
      base.hasIssues, base.hasWiki, base.hasPages, base.hasDiscussions,
      base.archived, base.disabled, base.isFork, base.defaultBranch, base.homepage,
    )
    expect(result.value).toBeGreaterThan(60)
    expect(result.reasons.length).toBeGreaterThan(2)
  })

  it('returns low score for archived repo', () => {
    const result = calcQuality(
      'short', null, [], 0,
      false, false, false, false,
      true, false, false, 'master', null,
    )
    expect(result.value).toBeLessThan(10)
    expect(result.reasons).toContain('Repository is archived or disabled')
  })

  it('returns low score for minimal repo', () => {
    const result = calcQuality(
      'hi', null, [], 0,
      false, false, false, false,
      false, false, false, 'master', null,
    )
    expect(result.value).toBeLessThan(40)
  })

  it('penalizes forks', () => {
    const forked = calcQuality(
      base.description, base.license, base.topics, base.size,
      base.hasIssues, base.hasWiki, base.hasPages, base.hasDiscussions,
      false, false, true, base.defaultBranch, base.homepage,
    )
    const origin = calcQuality(
      base.description, base.license, base.topics, base.size,
      base.hasIssues, base.hasWiki, base.hasPages, base.hasDiscussions,
      false, false, false, base.defaultBranch, base.homepage,
    )
    expect(forked.value).toBeLessThan(origin.value)
  })
})

describe('calcTrend', () => {
  it('boosts trending technologies', () => {
    const trending = calcTrend(['ai', 'rust', 'webgpu'], 'rust')
    const normal = calcTrend(['blog'], 'php')
    expect(trending.value).toBeGreaterThan(normal.value)
  })

  it('awards base score for empty', () => {
    const result = calcTrend([], null)
    expect(result.value).toBe(20)
  })
})

describe('calculateRadarScore', () => {
  const params = {
    stargazers_count: 5000,
    forks_count: 1000,
    description: 'A great open source project with proper description',
    created_at: new Date(Date.now() - 86400000 * 180).toISOString(),
    pushed_at: new Date().toISOString(),
    topics: ['rust', 'cli', 'testing', 'documentation'],
    license: { spdx_id: 'MIT' },
    size: 2000,
    language: 'rust',
    subscribers_count: 200,
    open_issues_count: 50,
    has_issues: true,
    has_wiki: true,
    has_pages: true,
    has_discussions: true,
    archived: false,
    disabled: false,
    fork: false,
    default_branch: 'main',
    homepage: 'https://example.com',
  }

  it('returns a complete breakdown', () => {
    const result = calculateRadarScore(params)
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
    expect(result.growth.value).toBeGreaterThanOrEqual(0)
    expect(result.momentum.value).toBeGreaterThanOrEqual(0)
    expect(result.community.value).toBeGreaterThanOrEqual(0)
    expect(result.quality.value).toBeGreaterThanOrEqual(0)
    expect(result.trend.value).toBeGreaterThanOrEqual(0)
  })

  it('returns all components with reasons', () => {
    const result = calculateRadarScore(params)
    expect(result.growth.reasons.length).toBeGreaterThan(0)
    expect(result.momentum.reasons.length).toBeGreaterThan(0)
    expect(result.quality.reasons.length).toBeGreaterThan(0)
    expect(result.trend.reasons.length).toBeGreaterThan(0)
  })

  it('scores a promising repo above 50', () => {
    const result = calculateRadarScore(params)
    expect(result.total).toBeGreaterThan(50)
  })

  it('scores a dead repo low', () => {
    const dead = {
      ...params,
      stargazers_count: 5,
      forks_count: 0,
      description: 'x',
      created_at: new Date(Date.now() - 86400000 * 700).toISOString(),
      pushed_at: new Date(Date.now() - 86400000 * 400).toISOString(),
      topics: [],
      license: null,
      size: 2,
      language: null,
      subscribers_count: 0,
      open_issues_count: 0,
      has_issues: false,
      has_wiki: false,
      has_pages: false,
      has_discussions: false,
      archived: true,
      disabled: false,
      fork: true,
      default_branch: 'master',
      homepage: null,
    }
    const result = calculateRadarScore(dead)
    expect(result.total).toBeLessThan(30)
  })
})
