import type { EnrichedRepository } from '../../models/repository'

const COMPONENT_META: Record<string, { label: string; color: string }> = {
  growth: { label: 'Growth', color: '#22C55E' },
  momentum: { label: 'Momentum', color: '#58a6ff' },
  community: { label: 'Community', color: '#8B5CF6' },
  quality: { label: 'Quality', color: '#FF9F43' },
  trend: { label: 'Trend', color: '#F472B6' },
}

export function renderBreakdownModal(repo: EnrichedRepository): string {
  const bd = repo._scoreBreakdown
  const bars = Object.entries(COMPONENT_META).map(([key, meta]) => {
    const comp = bd[key as keyof typeof bd]
    const v = typeof comp === 'object' && comp !== null ? (comp as { value: number }).value : 0
    const reasons = typeof comp === 'object' && comp !== null
      ? (comp as { reasons: string[] }).reasons
      : []

    return `
      <div class="breakdown-row">
        <div class="breakdown-header">
          <span class="breakdown-label" style="color:${meta.color}">${meta.label}</span>
          <span class="breakdown-value">${v}/100</span>
        </div>
        <div class="breakdown-bar-bg">
          <div class="breakdown-bar-fill" style="width:${v}%;background:${meta.color}"></div>
        </div>
        ${reasons.length ? `<div class="breakdown-reasons">${reasons.map(r => `<span class="breakdown-reason">${r}</span>`).join('')}</div>` : ''}
      </div>`
  }).join('')

  return `
    <div id="breakdownOverlay" class="breakdown-overlay">
      <div class="breakdown-modal">
        <div class="breakdown-modal-header">
          <div class="breakdown-modal-title">
            <span class="breakdown-modal-name">${repo.full_name}</span>
            <span class="breakdown-modal-score">${repo._score}/100 · ${repo._scoreDescription}</span>
          </div>
          <button id="breakdownClose" class="breakdown-close">✕</button>
        </div>
        <div class="breakdown-body">
          ${bars}
        </div>
        ${repo._badges.length ? `<div class="breakdown-badges">${repo._badges.map(b => `<span class="breakdown-badge">${b.replace('_', ' ')}</span>`).join('')}</div>` : ''}
        ${repo._classification !== 'Unknown' ? `<div class="breakdown-classification">Classified as: <strong>${repo._classification}</strong></div>` : ''}
      </div>
    </div>`
}

export function showBreakdown(repo: EnrichedRepository): void {
  const existing = document.getElementById('breakdownOverlay')
  if (existing) existing.remove()

  document.body.insertAdjacentHTML('beforeend', renderBreakdownModal(repo))
  document.getElementById('breakdownOverlay')!.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeBreakdown()
  })
  document.getElementById('breakdownClose')!.addEventListener('click', closeBreakdown)
  document.addEventListener('keydown', handleBreakdownKey)
}

function handleBreakdownKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') closeBreakdown()
}

function closeBreakdown(): void {
  const el = document.getElementById('breakdownOverlay')
  if (el) el.remove()
  document.removeEventListener('keydown', handleBreakdownKey)
}

export function makeScoreClickable(html: string, repoFullName: string, clickAttr: string = 'data-score-click'): string {
  const idx = html.indexOf('>${r._score}/100')
  if (idx === -1) return html

  const placeholder = `>${repoFullName}`
  return html.replace(
    /(data\-action="track")[^>]*>/,
    (match) => match
  )
}
