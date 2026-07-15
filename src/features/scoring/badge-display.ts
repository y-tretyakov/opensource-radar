import type { Badge } from './types'

export interface BadgeMeta {
  icon: string
  label: string
  color: string
  explanation: string
}

const BADGE_META: Record<Badge, BadgeMeta> = {
  HOT: {
    icon: '🔥',
    label: 'HOT',
    color: '#FF4500',
    explanation: '+500 stars/week',
  },
  RISING_STAR: {
    icon: '📈',
    label: 'Rising Star',
    color: '#58a6ff',
    explanation: 'fast growing',
  },
  EXPLODING: {
    icon: '🚀',
    label: 'Exploding',
    color: '#F472B6',
    explanation: 'growth x5',
  },
  HIDDEN_GEM: {
    icon: '💎',
    label: 'Hidden Gem',
    color: '#8B5CF6',
    explanation: 'high potential',
  },
  ESTABLISHED: {
    icon: '🏛',
    label: 'Established',
    color: '#22C55E',
    explanation: 'mature project',
  },
}

export function getBadgeMeta(badge: Badge): BadgeMeta {
  return BADGE_META[badge]
}

export function renderBadge(badge: Badge): string {
  const meta = getBadgeMeta(badge)
  const hueMap: Record<string, string> = {
    '#FF4500': '14',
    '#58a6ff': '214',
    '#F472B6': '336',
    '#8B5CF6': '258',
    '#22C55E': '142',
  }
  const hue = hueMap[meta.color] || '214'
  return `<span class="badge-tag" style="--badge-hue:${hue};--badge-color:${meta.color}" title="${meta.explanation}">
    <span class="badge-tag-icon">${meta.icon}</span>
    <span class="badge-tag-label">${meta.label}</span>
  </span>`
}

export function renderBadges(badges: Badge[]): string {
  if (!badges.length) return ''
  return `<div class="badge-row">${badges.map(renderBadge).join('')}</div>`
}
