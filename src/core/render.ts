import { store } from '../state/store'
import type { EnrichedRepository } from '../models/repository'
import { formatCount, formatInt, langColor, escapeHtml } from '../utils/format'
import { timeAgo, daysSince } from '../utils/dates'
import { saveTracked } from '../utils/storage'
import { renderBadges } from '../features/scoring/badge-display'
import { renderWhyInteresting } from '../features/scoring/reasons'
import { renderRadarMap } from '../features/radar-map/map'
import { insightEngine, repoToInsightData } from '../features/insights'

function observeScroll(): void {
  const els = document.querySelectorAll('.scroll-reveal')
  if (!els.length) return
  const obs = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add('visible')
      else e.target.classList.remove('visible')
    }
  }, { threshold: 0.04, rootMargin: '0px 0px -20px 0px' })
  for (const el of els) obs.observe(el)
}

function generateSparkline(repo: EnrichedRepository): string {
  const count = 20
  const pts: number[] = []
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / count
    const raw = repo.stargazers_count / (1 + Math.exp(-10 * (t - 0.5)))
    pts.push(raw)
  }
  const max = Math.max(...pts, 1)
  const w = 120, h = 24, pad = 2
  const xStep = (w - pad * 2) / (count - 1)
  const d = pts.map((v, i) => {
    const x = pad + i * xStep
    const y = h - pad - (v / max) * (h - pad * 2)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const hue = repo._growthPerDay > 20 ? '142' : repo._growthPerDay > 5 ? '258' : '180'
  return `<svg class="sparkline-svg" viewBox="0 0 ${w} ${h}"><path d="${d}" stroke="hsla(${hue},70%,55%,0.8)" fill="none" stroke-width="1.5"/><path d="${d}" stroke="hsla(${hue},70%,55%,0.15)" fill="none" stroke-width="6" transform="translate(0,2)"/></svg>`
}

export function updateToggleButtons(): void {
  const state = store.getState()
  const g = document.getElementById('btn-grid')
  const l = document.getElementById('btn-list')
  const m = document.getElementById('btn-map')
  if (g) g.className = 'view-btn' + (state.view === 'grid' ? ' active' : '')
  if (l) l.className = 'view-btn' + (state.view === 'list' ? ' active' : '')
  if (m) m.className = 'view-btn' + (state.view === 'map' ? ' active' : '')
}

function renderCards(repos: EnrichedRepository[]): void {
  const container = document.getElementById('results')
  if (!container) return

  const tracked = store.getState().tracked
  container.className = 'card-grid results-container'
  container.innerHTML = repos.map(r => {
    const isTracked = tracked.has(r.full_name)
    const tags = (r.topics || []).slice(0, 5)

    const name = escapeHtml(r.full_name)
    const desc = escapeHtml(r.description || 'No description')
    const lang = escapeHtml(r.language || '—')
    const license = escapeHtml(r.license?.spdx_id || '—')
    const htmlUrl = escapeHtml(r.html_url)
    const avatarUrl = escapeHtml(r.owner.avatar_url)

    return `<div class="scroll-reveal glass-card rounded-2xl flex flex-col overflow-hidden shadow-lg">
      <div class="p-4 flex items-start gap-3 border-b border-[#263043]/50">
        <img src="${avatarUrl}" alt="" class="w-10 h-10 rounded-xl bg-slate-800 shrink-0" loading="lazy">
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <a href="${htmlUrl}" target="_blank" class="text-sm font-bold text-blue-400 hover:underline truncate block">${name}</a>
            <span class="track-btn text-xs px-2 py-0.5 rounded-full border ${isTracked ? 'tracked' : 'border-slate-700 text-slate-500 hover:border-slate-500'}" data-action="track" data-repo="${name}">${isTracked ? '✓ Tracked' : '+ Track'}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">${desc}</p>
        </div>
      </div>

      ${r._badges.length ? `<div class="px-4 pt-2.5 flex justify-center">${renderBadges(r._badges)}</div>` : ''}

      <div class="px-4 pt-2 text-[11px] text-slate-500 italic leading-relaxed insight-summary">${(() => {
        const data = repoToInsightData(r)
        return insightEngine.analyze(data).summary
      })()}</div>

      <div class="px-4 pt-3 grid grid-cols-4 gap-2">
        <div><div class="stat-label">Stars</div><div class="stat-value">${formatCount(r.stargazers_count)}</div></div>
        <div><div class="stat-label">Growth</div><div class="stat-value text-growth">+${formatCount(r._weeklyGrowth)}</div></div>
        <div><div class="stat-label">Forks</div><div class="stat-value">${formatCount(r.forks_count)}</div></div>
        <div><div class="stat-label">Lang</div><div class="stat-value flex items-center gap-1"><span class="lang-dot" style="background:${langColor(r.language)}"></span>${lang}</div></div>
      </div>

      <div class="px-4 pt-2.5 flex items-center gap-2 cursor-pointer" data-score-click="${name}">
        <div class="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div class="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-500" style="width:${r._score}%"></div>
        </div>
        <span class="text-xs font-mono text-blue-400/80 font-bold">${r._score}<span class="text-slate-600 font-normal">/100</span></span>
      </div>
      <div class="px-4 pb-1">
        <span class="text-[10px] font-medium ${r._score >= 75 ? 'text-growth' : r._score >= 60 ? 'text-alert' : 'text-slate-500'}">${escapeHtml(r._scoreDescription)}</span>
        <span class="text-[10px] text-slate-600 mx-1">·</span>
        <span class="text-[10px] text-slate-500">${escapeHtml(r._classification)}</span>
      </div>

      ${renderWhyInteresting(r)}

      <div class="px-4 pt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-500">
        <div><span class="text-slate-600">Created</span> <span class="text-slate-300">${daysSince(r.created_at)}d ago</span></div>
        <div><span class="text-slate-600">Updated</span> <span class="text-slate-300">${timeAgo(r.pushed_at)}</span></div>
        <div><span class="text-slate-600">License</span> <span class="text-slate-300">${license}</span></div>
        <div><span class="text-slate-600">Size</span> <span class="text-slate-300">${(r.size / 1024).toFixed(1)} MB</span></div>
      </div>

      ${tags.length ? `<div class="px-4 pt-3 flex flex-wrap gap-1">${tags.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join('')}</div>` : ''}

      <div class="mt-auto p-4 flex items-center gap-2 border-t border-[#263043]/50">
        <a href="${htmlUrl}" target="_blank" class="flex-1 text-center text-xs font-medium py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all">Open GitHub</a>
        <button data-action="track" data-repo="${name}" class="flex-1 text-center text-xs font-medium py-2 rounded-xl glass border-slate-700/50 hover:border-blue-500/30 transition-all ${isTracked ? 'text-blue-400' : 'text-slate-400'}">${isTracked ? 'Tracked' : 'Track'}</button>
        <button data-action="compare" data-repo="${name}" class="flex-0 text-xs font-medium py-2 px-2.5 rounded-xl glass border-slate-700/50 hover:border-blue-500/30 transition-all ${store.getState().compareList.includes(r.full_name) ? 'text-blue-400 border-blue-500/30' : 'text-slate-400 hover:text-blue-400'}" title="Compare">⇄</button>
        <button data-action="timeline" data-repo="${name}" class="flex-0 text-xs font-medium py-2 px-2.5 rounded-xl glass border-slate-700/50 hover:border-blue-500/30 transition-all text-slate-400 hover:text-blue-400" title="Timeline">📅</button>
      </div>
    </div>`
  }).join('')
  observeScroll()
}

function renderList(repos: EnrichedRepository[]): void {
  const container = document.getElementById('results')
  if (!container) return

  const state = store.getState()
  const perPage = parseInt((document.getElementById('perPage') as HTMLSelectElement)?.value || '25')

  container.className = 'results-container'

  const sortArrow = (field: string) => state.sortBy === field ? (state.sortOrder === 'desc' ? '▼' : '▲') : ''

  const sorted = [...repos].sort((a, b) => {
    let va: number | string, vb: number | string
    switch (state.sortBy) {
      case 'stars': va = a.stargazers_count; vb = b.stargazers_count; break
      case 'growth': va = a._growthPerDay; vb = b._growthPerDay; break
      case 'forks': va = a.forks_count; vb = b.forks_count; break
      case 'created': va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime(); break
      case 'score': va = a._score; vb = b._score; break
      case 'name': va = a.full_name.toLowerCase(); vb = b.full_name.toLowerCase(); break
      case 'activity': va = daysSince(a.pushed_at); vb = daysSince(b.pushed_at); break
      case 'language': va = a.language || ''; vb = b.language || ''; break
      default: va = a.stargazers_count; vb = b.stargazers_count
    }
    if (va < vb) return state.sortOrder === 'asc' ? -1 : 1
    if (va > vb) return state.sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const makeSortable = (field: string, label: string) => {
    const active = state.sortBy === field
    return `<th class="${active ? 'sort-active' : ''}" data-sort="${field}">${label}<span class="sort-arrow">${sortArrow(field)}</span></th>`
  }

  container.innerHTML = `<div class="table-wrap glass">
    <table class="sortable">
      <thead><tr>
        <th style="width:2.5rem;text-align:center">#</th>
        ${makeSortable('name', 'Project')}
        ${makeSortable('stars', 'Stars')}
        ${makeSortable('growth', 'Growth')}
        ${makeSortable('forks', 'Forks')}
        ${makeSortable('language', 'Lang')}
        ${makeSortable('created', 'Created')}
        ${makeSortable('activity', 'Activity')}
        ${makeSortable('score', 'Score')}
      </tr></thead>
      <tbody>${sorted.map((r, i) => {
        const name = escapeHtml(r.full_name)
        const desc = escapeHtml(r.description || '')
        const lang = escapeHtml(r.language || '—')
        const htmlUrl = escapeHtml(r.html_url)
        const avatarUrl = escapeHtml(r.owner.avatar_url)
        const activity = escapeHtml(r._activity)
        const ac = r._activity
        const activityClass = ac.includes('Active') ? 'activity-active' : ac.includes('Slow') ? 'activity-slow' : 'activity-archived'
        const isTracked = state.tracked.has(r.full_name)

        return `<tr class="scroll-reveal">
          <td style="text-align:center;color:#64748b;font-size:0.7rem">${(state.page - 1) * perPage + i + 1}</td>
          <td>
            <div class="flex items-center gap-2.5 min-w-0">
              <img src="${avatarUrl}" alt="" class="w-7 h-7 rounded-lg bg-slate-800 shrink-0" loading="lazy">
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <a href="${htmlUrl}" target="_blank" class="text-sm font-semibold text-blue-400 hover:underline truncate">${name}</a>
                  ${isTracked ? '<span class="text-[10px] text-blue-400 shrink-0">●</span>' : ''}
                  ${r._badges.length ? `<span class="flex gap-1 shrink-0">${r._badges.slice(0, 2).map(b => {
                    const icons: Record<string, string> = { HOT: '🔥', RISING_STAR: '📈', EXPLODING: '🚀', HIDDEN_GEM: '💎', ESTABLISHED: '🏛' }
                    return `<span class="badge-tag badge-tag-sm" style="--badge-hue:214;--badge-color:#58a6ff"><span class="badge-tag-icon">${icons[b] || ''}</span><span class="badge-tag-label">${b.replace('_', ' ')}</span></span>`
                  }).join('')}</span>` : ''}
                </div>
                <div class="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-[280px]">${desc}</div>
              </div>
            </div>
          </td>
          <td><div class="font-semibold text-sm">${formatCount(r.stargazers_count)}</div><div class="text-[10px] text-growth">+${formatCount(r._weeklyGrowth)}/w</div></td>
          <td style="min-width:100px"><div class="text-xs font-medium text-slate-300">+${formatInt(r._weeklyGrowth)}</div><div class="text-[10px] text-growth">▲</div></td>
          <td><div class="font-medium text-sm">${formatCount(r.forks_count)}</div></td>
          <td><div class="flex items-center gap-1"><span class="lang-dot" style="background:${langColor(r.language)}"></span><span class="text-xs">${lang}</span></div></td>
          <td><div class="text-xs text-slate-400">${daysSince(r.created_at)}d</div></td>
          <td><span class="text-xs font-medium ${activityClass}">${activity}</span></td>
          <td style="min-width:70px">
            <div class="text-sm font-bold ${r._score >= 80 ? 'text-growth' : r._score >= 50 ? '' : 'text-slate-500'} cursor-pointer" data-score-click="${name}" style="color:${r._score >= 50 ? '#FF9F43' : ''}">${r._score}/100</div>
            <div class="progress-score"><div class="progress-score-fill ${r._score >= 80 ? 'bg-[#22C55E]' : r._score >= 50 ? 'bg-[#FF9F43]' : 'bg-slate-600'}" style="width:${r._score}%"></div></div>
          </td>
        </tr>`
      }).join('')}</tbody>
    </table>
  </div>`
  observeScroll()

  const sparklineTds = container.querySelectorAll('td:nth-child(4)')
  if (repos.length <= 25) {
    sorted.forEach((r, i) => {
      const td = sparklineTds[i]
      if (td) td.insertAdjacentHTML('beforeend', generateSparkline(r))
    })
  }
}

export function render(): void {
  const state = store.getState()
  const container = document.getElementById('results')
  if (!container) return

  if (!state.repositories.length) {
    container.innerHTML = '<div class="col-span-full text-center py-24 text-sm text-slate-500">No signals detected</div>'
    return
  }

  if (state.view === 'grid') renderCards(state.repositories)
  else if (state.view === 'list') renderList(state.repositories)
  else renderRadarMap(state.repositories, container)
}

export function switchView(view: 'grid' | 'list' | 'map'): void {
  if (window.innerWidth < 768 && view === 'list') return
  const state = store.getState()
  if (state.view === view) return
  store.setState({ view })
  updateToggleButtons()
  const container = document.getElementById('results')
  if (container) {
    container.classList.add('switching')
    setTimeout(() => {
      container.classList.remove('switching')
      render()
    }, 180)
  }
}

export function sortBy(field: string): void {
  const state = store.getState()
  if (state.sortBy === field) {
    store.setState({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' })
  } else {
    store.setState({ sortBy: field, sortOrder: 'desc' })
  }
  render()
}

export function toggleTrack(name: string, el?: HTMLElement | null): void {
  const currentState = store.getState()
  const tracked = new Set(currentState.tracked)
  if (tracked.has(name)) tracked.delete(name)
  else tracked.add(name)
  store.setState({ tracked })
  saveTracked(tracked)
  if (el) {
    el.textContent = tracked.has(name) ? '✓ Tracked' : '+ Track'
    el.classList.toggle('tracked', tracked.has(name))
  } else {
    render()
  }
}

export function checkMobile(): void {
  const state = store.getState()
  if (window.innerWidth < 768 && state.view === 'list') {
    store.setState({ view: 'grid' })
    if (state.repositories.length) render()
    updateToggleButtons()
  }
}
