import type { InsightSignal, InsightRepoData } from '../types'

export function evaluateCommunityRules(repo: InsightRepoData): InsightSignal[] {
  const signals: InsightSignal[] = []

  const forkRatio = repo.stars > 0 ? repo.forks / repo.stars : 0

  if (repo.forks > 10000) {
    signals.push({
      type: 'positive',
      title: 'Massive community adoption',
      description: `${(repo.forks / 1000).toFixed(1)}k forks — extraordinary level of community engagement`,
      weight: 95,
      category: 'community',
    })
  } else if (repo.forks > 1000) {
    signals.push({
      type: 'positive',
      title: 'Strong community engagement',
      description: `${(repo.forks / 1000).toFixed(1)}k forks — widely adopted and forked by the community`,
      weight: 80,
      category: 'community',
    })
  } else if (repo.forks > 100) {
    signals.push({
      type: 'positive',
      title: 'Growing community interest',
      description: `${repo.forks} forks — increasing community adoption`,
      weight: 60,
      category: 'community',
    })
  }

  if (forkRatio > 0.5) {
    signals.push({
      type: 'positive',
      title: 'Exceptional fork-to-star ratio',
      description: `${Math.round(forkRatio * 100)}% of stargazers also forked — strong reuse signals`,
      weight: 75,
      category: 'community',
    })
  } else if (forkRatio > 0.3) {
    signals.push({
      type: 'positive',
      title: 'High fork activity',
      description: `${Math.round(forkRatio * 100)}% fork/star ratio — active derivative work`,
      weight: 60,
      category: 'community',
    })
  }

  if (repo.subscribersCount > 1000) {
    signals.push({
      type: 'positive',
      title: 'Large watcher base',
      description: `${repo.subscribersCount.toLocaleString()} watchers — strong dedicated following`,
      weight: 70,
      category: 'community',
    })
  } else if (repo.subscribersCount > 100) {
    signals.push({
      type: 'positive',
      title: 'Active watcher community',
      description: `${repo.subscribersCount} watchers following development`,
      weight: 50,
      category: 'community',
    })
  }

  if (repo.hasDiscussions) {
    signals.push({
      type: 'positive',
      title: 'Community discussions',
      description: 'GitHub Discussions enabled — community interaction and Q&A platform active',
      weight: 45,
      category: 'community',
    })
  }

  if (repo.communityScore >= 80) {
    signals.push({
      type: 'positive',
      title: 'Strong community score',
      description: 'High community metrics — contributors, forks, and engagement all elevated',
      weight: 70,
      category: 'community',
    })
  }

  if (repo.forks === 0 && repo.subscribersCount === 0) {
    signals.push({
      type: 'warning',
      title: 'No community signals',
      description: 'Zero forks and watchers — project has not yet gained community traction',
      weight: 20,
      category: 'community',
    })
  }

  return signals
}
