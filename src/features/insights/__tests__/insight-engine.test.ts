import { describe, it, expect } from 'vitest'
import { RadarInsightEngine, repoToInsightData } from '../insight-engine'
import type { InsightRepoData } from '../types'

function makeRepo(overrides: Partial<InsightRepoData> = {}): InsightRepoData {
  return {
    name: 'test/repo',
    stars: 5000,
    forks: 1200,
    language: 'rust',
    topics: ['rust', 'cli', 'testing'],
    description: 'A great open source project',
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    pushedAt: new Date().toISOString(),
    subscribersCount: 250,
    openIssuesCount: 45,
    hasIssues: true,
    hasWiki: true,
    hasPages: true,
    hasDiscussions: true,
    archived: false,
    disabled: false,
    isFork: false,
    license: 'MIT',
    homepage: 'https://example.com',
    defaultBranch: 'main',
    score: 85,
    growthScore: 88,
    momentumScore: 82,
    communityScore: 75,
    qualityScore: 80,
    trendScore: 90,
    growthPerDay: 45,
    weeklyGrowth: 315,
    daysSinceUpdate: 2,
    ageDays: 180,
    badges: ['HOT', 'RISING_STAR'],
    ...overrides,
  }
}

const engine = new RadarInsightEngine()

describe('RadarInsightEngine', () => {
  it('returns insight structure for a healthy repo', () => {
    const insight = engine.analyze(makeRepo())
    expect(insight).toHaveProperty('summary')
    expect(insight).toHaveProperty('signals')
    expect(insight).toHaveProperty('strengths')
    expect(insight).toHaveProperty('warnings')
    expect(insight).toHaveProperty('labels')
    expect(insight).toHaveProperty('confidence')
    expect(typeof insight.summary).toBe('string')
    expect(Array.isArray(insight.signals)).toBe(true)
  })

  it('generates positive signals for a high-growth repo', () => {
    const insight = engine.analyze(makeRepo({ growthPerDay: 150, weeklyGrowth: 1050 }))
    const positives = insight.signals.filter(s => s.type === 'positive')
    expect(positives.length).toBeGreaterThanOrEqual(3)
    expect(insight.signals[0].weight).toBeGreaterThanOrEqual(80)
  })

  it('detects explosive growth', () => {
    const insight = engine.analyze(makeRepo({ growthPerDay: 500, weeklyGrowth: 3500 }))
    const explosive = insight.signals.find(s => s.title.toLowerCase().includes('explosive'))
    expect(explosive).toBeDefined()
    expect(explosive!.type).toBe('positive')
  })

  it('detects stagnation', () => {
    const insight = engine.analyze(makeRepo({ stars: 10, growthPerDay: 0.01, weeklyGrowth: 0 }))
    const stagnant = insight.signals.find(s => s.title.toLowerCase().includes('stagnant'))
    expect(stagnant).toBeDefined()
    expect(stagnant!.type).toBe('warning')
  })

  it('warns about archived repos', () => {
    const insight = engine.analyze(makeRepo({ archived: true }))
    const archived = insight.signals.find(s => s.title.toLowerCase().includes('archived'))
    expect(archived).toBeDefined()
    expect(archived!.type).toBe('warning')
    expect(archived!.weight).toBeLessThan(10)
  })

  it('warns about inactivity', () => {
    const insight = engine.analyze(makeRepo({ daysSinceUpdate: 200, pushedAt: new Date(Date.now() - 86400000 * 200).toISOString() }))
    const stall = insight.signals.find(s => s.title.toLowerCase().includes('stall'))
    expect(stall).toBeDefined()
    expect(stall!.type).toBe('warning')
  })

  it('detects strong community engagement', () => {
    const insight = engine.analyze(makeRepo({ forks: 15000, subscribersCount: 5000 }))
    const community = insight.signals.find(s => s.title.toLowerCase().includes('massive'))
    expect(community).toBeDefined()
    expect(community!.type).toBe('positive')
  })

  it('detects trending technology', () => {
    const insight = engine.analyze(makeRepo({ topics: ['ai', 'rust', 'webgpu'], language: 'rust' }))
    const tech = insight.signals.find(s => s.title.startsWith('Trending ecosystem'))
    expect(tech).toBeDefined()
    expect(tech!.type).toBe('positive')
  })

  it('detects missing community', () => {
    const insight = engine.analyze(makeRepo({ forks: 0, subscribersCount: 0 }))
    const noCommunity = insight.signals.find(s => s.title.toLowerCase().includes('no community'))
    expect(noCommunity).toBeDefined()
    expect(noCommunity!.type).toBe('warning')
  })

  it('reports confidence score', () => {
    const insight = engine.analyze(makeRepo())
    expect(insight.confidence).toBeGreaterThanOrEqual(0)
    expect(insight.confidence).toBeLessThanOrEqual(100)
  })

  it('includes badge-based labels', () => {
    const insight = engine.analyze(makeRepo({ badges: ['HOT', 'EXPLODING'] }))
    expect(insight.labels).toContain('HOT')
    expect(insight.labels).toContain('EXPLODING')
  })

  it('returns empty labels for no badges', () => {
    const insight = engine.analyze(makeRepo({ badges: [] }))
    expect(insight.labels).toEqual([])
  })

  it('generates summary with language', () => {
    const insight = engine.analyze(makeRepo({ language: 'rust' }))
    expect(insight.summary.toLowerCase()).toContain('rust')
  })

  it('generates summary without language', () => {
    const insight = engine.analyze(makeRepo({ language: null }))
    expect(insight.summary.length).toBeGreaterThan(10)
  })

  it('detects high fork ratio', () => {
    const insight = engine.analyze(makeRepo({ stars: 1000, forks: 700 }))
    const forkSignal = insight.signals.find(s => s.title.toLowerCase().includes('fork'))
    expect(forkSignal).toBeDefined()
  })

  it('detects quality issues', () => {
    const insight = engine.analyze(makeRepo({
      qualityScore: 20,
      description: null,
      license: null,
      hasIssues: false,
      hasWiki: false,
      hasPages: false,
      hasDiscussions: false,
      homepage: null,
      defaultBranch: 'master',
    }))
    const warn = insight.signals.find(s => s.title.toLowerCase().includes('limited'))
    expect(warn).toBeDefined()
    expect(warn!.type).toBe('warning')
  })

  it('prioritizes signals by weight', () => {
    const insight = engine.analyze(makeRepo({ growthPerDay: 500, weeklyGrowth: 3500, archived: true }))
    for (let i = 1; i < insight.signals.length; i++) {
      expect(insight.signals[i - 1].weight).toBeGreaterThanOrEqual(insight.signals[i].weight)
    }
  })

  it('strengths contain high-weight positive signals', () => {
    const insight = engine.analyze(makeRepo({ growthPerDay: 200, weeklyGrowth: 1400 }))
    expect(insight.strengths.length).toBeGreaterThanOrEqual(1)
  })
})

describe('repoToInsightData', () => {
  it('converts enriched repo to insight data', () => {
    const now = new Date().toISOString()
    const repo = {
      full_name: 'test/repo',
      stargazers_count: 5000,
      forks_count: 1000,
      language: 'rust' as string | null,
      topics: ['rust', 'cli'],
      description: 'desc',
      created_at: new Date(Date.now() - 86400000 * 100).toISOString(),
      pushed_at: now,
      subscribers_count: 200,
      open_issues_count: 30,
      has_issues: true,
      has_wiki: true,
      has_pages: false,
      has_discussions: false,
      archived: false,
      disabled: false,
      fork: false,
      license: { spdx_id: 'MIT' },
      homepage: null,
      default_branch: 'main',
      _score: 85,
      _growthPerDay: 50,
      _weeklyGrowth: 350,
      _badges: ['HOT'],
      _scoreBreakdown: {
        growth: { value: 90 },
        momentum: { value: 80 },
        community: { value: 70 },
        quality: { value: 75 },
        trend: { value: 85 },
      },
    }
    const data = repoToInsightData(repo)
    expect(data.name).toBe('test/repo')
    expect(data.stars).toBe(5000)
    expect(data.growthPerDay).toBe(50)
    expect(data.language).toBe('rust')
    expect(data.license).toBe('MIT')
    expect(data.growthScore).toBe(90)
    expect(data.momentumScore).toBe(80)
  })
})
