import type { EnrichedRepository } from '../../models/repository'
import { escapeHtml } from '../../utils/format'

interface Milestone {
  date: string
  label: string
  icon: string
  type: 'creation' | 'milestone' | 'activity' | 'estimated'
}

export function computeTimeline(repo: EnrichedRepository): Milestone[] {
  const timeline: Milestone[] = []
  const created = new Date(repo.created_at)
  const pushed = new Date(repo.pushed_at)
  const ageDays = Math.max(1, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)))
  const starsPerDay = repo.stargazers_count / ageDays

  timeline.push({
    date: repo.created_at,
    label: 'Repository created',
    icon: '●',
    type: 'creation',
  })

  const milestones = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000]
  const reached = milestones.filter(m => repo.stargazers_count >= m)

  for (const m of reached) {
    if (starsPerDay > 0) {
      const daysToMilestone = Math.round(m / starsPerDay)
      const milestoneDate = new Date(created.getTime() + daysToMilestone * 86400000)
      if (milestoneDate < new Date() && !isNaN(milestoneDate.getTime())) {
        timeline.push({
          date: milestoneDate.toISOString().split('T')[0],
          label: `${m.toLocaleString()} stars`,
          icon: '⭐',
          type: m <= repo.stargazers_count / 2 ? 'estimated' : 'milestone',
        })
      }
    }
  }

  if (pushed.getTime() > created.getTime()) {
    timeline.push({
      date: repo.pushed_at,
      label: 'Last activity',
      icon: '▸',
      type: 'activity',
    })
  }

  timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return timeline
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export function renderTimeline(repo: EnrichedRepository): string {
  const milestones = computeTimeline(repo)

  return `
    <div id="timelineOverlay" class="breakdown-overlay">
      <div class="breakdown-modal" style="max-width:480px">
        <div class="breakdown-modal-header">
          <div class="breakdown-modal-title">
            <span class="breakdown-modal-name">${escapeHtml(repo.full_name)}</span>
            <span class="breakdown-modal-score">Project Timeline</span>
          </div>
          <button id="timelineClose" class="breakdown-close">✕</button>
        </div>
        <div class="breakdown-body">
          <div class="timeline-stats">
            <div class="timeline-stat"><span class="timeline-stat-label">Age</span><span class="timeline-stat-value">${formatDays(repo._ageDays)}</span></div>
            <div class="timeline-stat"><span class="timeline-stat-label">Growth</span><span class="timeline-stat-value">${repo._growthPerDay.toFixed(1)}/day</span></div>
            <div class="timeline-stat"><span class="timeline-stat-label">Stars</span><span class="timeline-stat-value">${repo.stargazers_count.toLocaleString()}</span></div>
          </div>
          <div class="timeline-track">
            ${milestones.map((m, i) => {
              const isLast = i === milestones.length - 1
              const gap = i > 0 ? daysBetween(milestones[i - 1].date, m.date) : 0
              return `
                <div class="timeline-event ${m.type}">
                  <div class="timeline-node">
                    <span class="timeline-dot">${m.icon}</span>
                    ${isLast ? '' : '<div class="timeline-line"></div>'}
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-date">${formatDate(m.date)}</div>
                    <div class="timeline-label">${m.label}</div>
                    ${gap > 0 ? `<div class="timeline-gap">${gap}d later</div>` : ''}
                  </div>
                </div>`
            }).join('')}
          </div>
        </div>
      </div>
    </div>`
}

function formatDays(d: number): string {
  if (d < 30) return `${d}d`
  if (d < 365) return `${Math.floor(d / 30)}mo`
  return `${Math.floor(d / 365)}y ${d % 365}d`
}

export function showTimeline(repo: EnrichedRepository): void {
  const existing = document.getElementById('timelineOverlay')
  if (existing) existing.remove()

  document.body.insertAdjacentHTML('beforeend', renderTimeline(repo))
  document.getElementById('timelineOverlay')!.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeTimeline()
  })
  document.getElementById('timelineClose')!.addEventListener('click', closeTimeline)
  document.addEventListener('keydown', handleTimelineKey)
}

function handleTimelineKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') closeTimeline()
}

function closeTimeline(): void {
  const el = document.getElementById('timelineOverlay')
  if (el) el.remove()
  document.removeEventListener('keydown', handleTimelineKey)
}
