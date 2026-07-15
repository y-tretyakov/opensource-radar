import type { InsightSignal, InsightRepoData } from '../types'

export function evaluateQualityRules(repo: InsightRepoData): InsightSignal[] {
  const signals: InsightSignal[] = []

  if (repo.archived || repo.disabled) {
    signals.push({
      type: 'warning',
      title: 'Repository archived',
      description: 'This repository has been archived or disabled — no longer maintained',
      weight: 5,
      category: 'quality',
    })
    return signals
  }

  const qualityDetails: string[] = []
  if (repo.description && repo.description.length > 20) qualityDetails.push('Well-written description')
  if (repo.license) qualityDetails.push(`${repo.license} license`)
  if (repo.hasIssues) qualityDetails.push('Issue tracking enabled')
  if (repo.hasWiki) qualityDetails.push('Wiki enabled')
  if (repo.hasPages) qualityDetails.push('GitHub Pages site for documentation')
  if (repo.hasDiscussions) qualityDetails.push('Discussions enabled')
  if (repo.homepage) qualityDetails.push('Project website')
  if (repo.defaultBranch === 'main') qualityDetails.push('Modern branch naming (main)')

  if (qualityDetails.length >= 5) {
    signals.push({
      type: 'positive',
      title: 'Exceptional project quality',
      description: `Repository has ${qualityDetails.length} quality indicators: ${qualityDetails.slice(0, 4).join(', ')} and more`,
      weight: 90,
      category: 'quality',
    })
  } else if (qualityDetails.length >= 3) {
    signals.push({
      type: 'positive',
      title: 'Good project structure',
      description: qualityDetails.join(', '),
      weight: 70,
      category: 'quality',
    })
  } else if (qualityDetails.length >= 1) {
    signals.push({
      type: 'neutral',
      title: 'Basic quality indicators',
      description: qualityDetails.join(', ') || 'Minimal quality signals detected',
      weight: 40,
      category: 'quality',
    })
  }

  if (repo.isFork) {
    signals.push({
      type: 'warning',
      title: 'Forked repository',
      description: 'This is a fork — verify it adds significant value over the original',
      weight: 25,
      category: 'quality',
    })
  }

  if (repo.qualityScore >= 80) {
    signals.push({
      type: 'positive',
      title: 'Top-tier quality score',
      description: 'Quality component ranks in the top tier — strong documentation and practices',
      weight: 75,
      category: 'quality',
    })
  }

  if (repo.qualityScore < 30) {
    signals.push({
      type: 'warning',
      title: 'Limited quality signals',
      description: 'Low quality score — consider reviewing documentation, license, and project structure',
      weight: 30,
      category: 'quality',
    })
  }

  return signals
}
