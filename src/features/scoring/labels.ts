import type { Badge, ScoreBreakdown, ProjectClassification } from './types'

export function applyBadges(score: ScoreBreakdown, stars: number): Badge[] {
  const badges: Badge[] = []

  if (score.growth.value > 80 && score.momentum.value > 70) {
    badges.push('HOT')
  }

  if (score.growth.value > 70 && score.momentum.value > 60) {
    const accel = score.growth.reasons.some(r => r.includes('acceleration') || r.includes('ratio'))
    if (accel) badges.push('EXPLODING')
  }

  if (stars < 10000 && score.growth.value > 75 && score.quality.value > 70) {
    badges.push('HIDDEN_GEM')
  }

  if (stars > 50000 && score.quality.value > 80) {
    badges.push('ESTABLISHED')
  }

  if (score.growth.value > 60 && !badges.includes('HOT') && !badges.includes('EXPLODING')) {
    badges.push('RISING_STAR')
  }

  return badges
}

export function classifyProject(topics: string[], language: string | null): ProjectClassification {
  const allTerms = [...topics.map(t => t.toLowerCase()), ...(language ? [language.toLowerCase()] : [])]

  if (allTerms.some(t => ['ai', 'llm', 'machine-learning', 'deep-learning', 'gpt', 'openai', 'langchain', 'neural'].includes(t))) {
    return 'AI Tool'
  }
  if (allTerms.some(t => ['framework', 'mvc', 'mvvm', 'web-framework'].includes(t))) {
    return 'Framework'
  }
  if (allTerms.some(t => ['cli', 'command-line', 'terminal', 'shell'].includes(t))) {
    return 'CLI'
  }
  if (allTerms.some(t => ['devops', 'ci', 'cd', 'deployment', 'infrastructure', 'kubernetes', 'docker'].includes(t))) {
    return 'DevOps'
  }
  if (allTerms.some(t => ['database', 'sql', 'nosql', 'orm', 'cache', 'redis', 'postgresql'].includes(t))) {
    return 'Database'
  }
  if (allTerms.some(t => ['security', 'cryptography', 'encryption', 'auth', 'oauth', 'jwt'].includes(t))) {
    return 'Security'
  }
  if (allTerms.some(t => ['desktop', 'gui', 'electron', 'tauri', 'qt'].includes(t))) {
    return 'Desktop'
  }
  if (allTerms.some(t => ['mobile', 'android', 'ios', 'react-native', 'flutter'].includes(t))) {
    return 'Mobile'
  }
  if (allTerms.some(t => ['game', 'gamedev', 'game-engine', 'graphics', '3d', 'webgl'].includes(t))) {
    return 'Game'
  }
  if (allTerms.some(t => ['embedded', 'iot', 'firmware', 'microcontroller', 'arduino'].includes(t))) {
    return 'Embedded'
  }
  if (allTerms.some(t => ['web', 'http', 'rest', 'graphql', 'api', 'frontend', 'backend'].includes(t))) {
    return 'Web'
  }

  return 'Library'
}

export function scoreToString(score: number): string {
  if (score >= 90) return '🔥 Exceptional Signal'
  if (score >= 75) return '🚀 Strong Potential'
  if (score >= 60) return '📈 Growing'
  if (score >= 40) return '🌱 Early Stage'
  return '⚪ Low Signal'
}
