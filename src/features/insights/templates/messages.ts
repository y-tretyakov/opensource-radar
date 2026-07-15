import type { InsightSignal, InsightRepoData } from '../types'

const GROWTH_PHRASES: Record<string, string> = {
  explosive: 'explosive growth trajectory',
  fast: 'fast-growing',
  healthy: 'steady growth',
  moderate: 'moderate growth',
  stagnant: 'plateaued growth',
}

const QUALITY_PHRASES: Record<string, string> = {
  exceptional: 'with exceptional project quality',
  good: 'with solid project structure',
  basic: 'with basic quality indicators',
  poor: 'with limited quality signals',
}

const TECH_PHRASES: Record<string, string> = {
  trending: 'in a trending ecosystem',
  established: 'in an established technology area',
  niche: 'in a niche technology domain',
}

function determineGrowthLevel(signals: InsightSignal[]): keyof typeof GROWTH_PHRASES {
  const high = signals.filter(s => s.type === 'positive' && s.weight >= 80 && s.category === 'growth')
  if (high.length > 0) return 'explosive'
  const med = signals.filter(s => s.type === 'positive' && s.weight >= 50 && s.category === 'growth')
  if (med.length > 0) return 'fast'
  const low = signals.filter(s => s.type === 'positive' && s.category === 'growth')
  if (low.length > 0) return 'healthy'
  const warn = signals.filter(s => s.type === 'warning' && s.category === 'growth')
  if (warn.length > 0) return 'stagnant'
  return 'moderate'
}

function determineQualityLevel(signals: InsightSignal[]): keyof typeof QUALITY_PHRASES {
  const high = signals.filter(s => s.type === 'positive' && s.weight >= 80 && s.category === 'quality')
  if (high.length > 0) return 'exceptional'
  const med = signals.filter(s => s.type === 'positive' && s.weight >= 50 && s.category === 'quality')
  if (med.length > 0) return 'good'
  const basic = signals.filter(s => s.category === 'quality')
  if (basic.length > 0) return 'basic'
  return 'poor'
}

function determineTechLevel(signals: InsightSignal[]): keyof typeof TECH_PHRASES {
  const high = signals.filter(s => s.type === 'positive' && s.weight >= 70 && s.category === 'technology')
  if (high.length > 0) return 'trending'
  return 'established'
}

export function generateSummary(repo: InsightRepoData, signals: InsightSignal[]): string {
  const lang = repo.language ? `${repo.language} ` : ''

  const growthPhrase = GROWTH_PHRASES[determineGrowthLevel(signals)]
  const qualityPhrase = QUALITY_PHRASES[determineQualityLevel(signals)]
  const techPhrase = TECH_PHRASES[determineTechLevel(signals)]

  return `${lang}project on a ${growthPhrase} ${techPhrase} ${qualityPhrase}.`
}
