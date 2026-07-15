import type { InsightSignal, InsightRepoData } from '../types'

export function evaluateActivityRules(repo: InsightRepoData): InsightSignal[] {
  const signals: InsightSignal[] = []

  if (repo.daysSinceUpdate <= 1) {
    signals.push({
      type: 'positive',
      title: 'Active development',
      description: 'Code pushed within the last 24 hours — project is under active development',
      weight: 85,
      category: 'activity',
    })
  } else if (repo.daysSinceUpdate <= 7) {
    signals.push({
      type: 'positive',
      title: 'Recent activity',
      description: 'Committed within the last week — development is ongoing',
      weight: 75,
      category: 'activity',
    })
  } else if (repo.daysSinceUpdate <= 30) {
    signals.push({
      type: 'neutral',
      title: 'Recent updates',
      description: 'Last commit within 30 days — project is maintained',
      weight: 55,
      category: 'activity',
    })
  }

  if (repo.momentumScore >= 80) {
    signals.push({
      type: 'positive',
      title: 'High development velocity',
      description: 'Strong momentum score — frequent commits and releases',
      weight: 70,
      category: 'activity',
    })
  }

  if (repo.daysSinceUpdate > 180) {
    signals.push({
      type: 'warning',
      title: 'Development stall',
      description: `No commits in ${repo.daysSinceUpdate} days — project may be abandoned`,
      weight: 25,
      category: 'activity',
    })
  } else if (repo.daysSinceUpdate > 90) {
    signals.push({
      type: 'warning',
      title: 'Low activity',
      description: `Last commit ${repo.daysSinceUpdate} days ago — development pace has slowed`,
      weight: 40,
      category: 'activity',
    })
  }

  if (repo.daysSinceUpdate > 365) {
    signals.push({
      type: 'warning',
      title: 'Archived or abandoned',
      description: 'No activity for over a year — project is likely archived or unmaintained',
      weight: 15,
      category: 'activity',
    })
  }

  return signals
}
