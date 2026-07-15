import { store } from '../../state/store'
import type { EnrichedRepository } from '../../models/repository'
import { formatCount } from '../../utils/format'
import { loadSnapshots, saveSnapshot, saveSnapshots, type RepoSnapshot } from '../../utils/storage'

export interface TrackEvent {
  type: 'score_up' | 'score_down' | 'stars_spike' | 'new'
  label: string
  icon: string
  color: string
}

export function detectEvents(
  name: string,
  repo: EnrichedRepository,
  old: RepoSnapshot | undefined,
): TrackEvent[] {
  const events: TrackEvent[] = []

  if (!old) {
    events.push({ type: 'new', label: 'Started tracking', icon: '●', color: '#58a6ff' })
    return events
  }

  const scoreDiff = repo._score - old.score
  if (scoreDiff > 5) {
    events.push({ type: 'score_up', label: `Score +${scoreDiff}`, icon: '↑', color: '#22C55E' })
  } else if (scoreDiff < -5) {
    events.push({ type: 'score_down', label: `Score ${scoreDiff}`, icon: '↓', color: '#FF9F43' })
  }

  const starsDiff = repo.stargazers_count - old.stars
  if (starsDiff > old.stars * 0.1 && starsDiff > 100) {
    events.push({ type: 'stars_spike', label: `+${formatCount(starsDiff)} stars`, icon: '⚡', color: '#F472B6' })
  }

  return events
}

export function updateSnapshots(repos: EnrichedRepository[]): void {
  const tracked = store.getState().tracked
  const snapshots = loadSnapshots()

  for (const repo of repos) {
    if (tracked.has(repo.full_name)) {
      snapshots[repo.full_name] = {
        stars: repo.stargazers_count,
        score: repo._score,
        growthPerDay: repo._growthPerDay,
        forks: repo.forks_count,
        updatedAt: new Date().toISOString(),
      }
    }
  }

  saveSnapshots(snapshots)
}

export function renderTrackingDashboard(): string {
  const state = store.getState()
  const tracked = state.tracked
  const repos = state.repositories.filter(r => tracked.has(r.full_name))
  const snapshots = loadSnapshots()

  if (!repos.length) {
    return `
      <div class="text-center py-24">
        <div class="text-2xl mb-3">📡</div>
        <p class="text-sm text-slate-500">No tracked projects yet</p>
        <p class="text-xs text-slate-600 mt-1">Click "Track" on any project to start monitoring</p>
      </div>`
  }

  return `
    <div class="space-y-3">
      ${repos.map(r => {
        const old = snapshots[r.full_name]
        const events = detectEvents(r.full_name, r, old)
        return `
          <div class="glass-card rounded-2xl p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <a href="${r.html_url}" target="_blank" class="text-sm font-bold text-blue-400 hover:underline truncate">${r.full_name}</a>
                  <span class="text-xs font-mono text-blue-400/80">${r._score}/100</span>
                </div>
                <div class="text-xs text-slate-500 mt-0.5">${r.description || ''}</div>
              </div>
              <button data-action="track" data-repo="${r.full_name}" class="track-btn text-xs px-2 py-0.5 rounded-full border border-blue-500/30 text-blue-400 hover:bg-blue-500/10">Tracked</button>
            </div>

            <div class="mt-3 grid grid-cols-4 gap-2 text-xs">
              <div><span class="text-slate-600">Stars</span><br><span class="font-semibold text-slate-300">${formatCount(r.stargazers_count)}</span></div>
              <div><span class="text-slate-600">Growth</span><br><span class="font-semibold text-growth">+${formatCount(r._weeklyGrowth)}/w</span></div>
              <div><span class="text-slate-600">Forks</span><br><span class="font-semibold text-slate-300">${formatCount(r.forks_count)}</span></div>
              <div><span class="text-slate-600">Score</span><br><span class="font-semibold ${r._score >= 75 ? 'text-growth' : r._score >= 50 ? 'text-alert' : 'text-slate-500'}">${r._score}</span></div>
            </div>

            ${events.length ? `
              <div class="mt-2 flex flex-wrap gap-1.5">
                ${events.map(e => `<span class="text-[10px] px-2 py-0.5 rounded-full border" style="border-color:${e.color}33;background:${e.color}11;color:${e.color}">${e.icon} ${e.label}</span>`).join('')}
              </div>` : ''}

            ${old ? `<div class="mt-2 text-[10px] text-slate-600 flex gap-3">
              <span>Previous: ${old.score} score · ${formatCount(old.stars)} stars</span>
            </div>` : ''}
          </div>`
      }).join('')}
    </div>`
}
