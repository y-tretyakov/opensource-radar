import type { InsightSignal, InsightRepoData } from '../types'

export function evaluateGrowthRules(repo: InsightRepoData): InsightSignal[] {
  const signals: InsightSignal[] = []

  if (repo.growthPerDay > 100) {
    signals.push({
      type: 'positive',
      title: 'Explosive growth',
      description: `Repository gained ~${Math.round(repo.growthPerDay * 7).toLocaleString()} stars this week — viral velocity`,
      weight: 95,
      category: 'growth',
    })
  } else if (repo.growthPerDay > 50) {
    signals.push({
      type: 'positive',
      title: 'Fast growing project',
      description: `Gaining +${Math.round(repo.growthPerDay * 7).toLocaleString()} stars per week with strong momentum`,
      weight: 85,
      category: 'growth',
    })
  } else if (repo.growthPerDay > 20) {
    signals.push({
      type: 'positive',
      title: 'Healthy growth',
      description: `Steady growth of +${Math.round(repo.growthPerDay * 7).toLocaleString()} stars weekly`,
      weight: 70,
      category: 'growth',
    })
  } else if (repo.growthPerDay > 5) {
    signals.push({
      type: 'positive',
      title: 'Moderate growth',
      description: `Growing at +${Math.round(repo.growthPerDay * 7).toLocaleString()} stars per week`,
      weight: 50,
      category: 'growth',
    })
  }

  const monthlyGrowthRate = repo.stars > 0 ? (repo.growthPerDay * 30 / repo.stars) * 100 : 0
  if (monthlyGrowthRate > 50) {
    signals.push({
      type: 'positive',
      title: 'High growth rate',
      description: `${Math.round(monthlyGrowthRate)}% monthly growth relative to total stars — exponential trajectory`,
      weight: 80,
      category: 'growth',
    })
  } else if (monthlyGrowthRate > 20) {
    signals.push({
      type: 'positive',
      title: 'Above-average growth rate',
      description: `${Math.round(monthlyGrowthRate)}% growth per month — significantly above typical OSS projects`,
      weight: 65,
      category: 'growth',
    })
  }

  if (repo.growthScore >= 80) {
    signals.push({
      type: 'positive',
      title: 'Strong growth signals',
      description: 'Top-tier growth component score — all growth metrics are elevated',
      weight: 75,
      category: 'growth',
    })
  }

  if (repo.stars > 100000 && repo.growthPerDay > 10) {
    signals.push({
      type: 'positive',
      title: 'Mega-project still growing',
      description: `100k+ stars and still adding ${Math.round(repo.growthPerDay * 7).toLocaleString()}/week — exceptional staying power`,
      weight: 90,
      category: 'growth',
    })
  }

  if (repo.stars < 100 && repo.growthPerDay > 2) {
    signals.push({
      type: 'positive',
      title: 'Early traction',
      description: 'Very early stage but already showing growth signals above noise',
      weight: 60,
      category: 'growth',
    })
  }

  if (repo.stars > 0 && repo.growthPerDay < 0.1) {
    signals.push({
      type: 'warning',
      title: 'Stagnant growth',
      description: 'Almost no star acquisition — project may have plateaued',
      weight: 30,
      category: 'growth',
    })
  }

  return signals
}
