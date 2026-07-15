import { store } from '../../state/store'
import type { EnrichedRepository } from '../../models/repository'
import type { ScoreComponent } from '../scoring/types'

const COMPONENT_META: Record<string, { label: string; color: string; key: string }> = {
  growth: { label: 'Growth', color: '#22C55E', key: 'growth' },
  momentum: { label: 'Momentum', color: '#58a6ff', key: 'momentum' },
  community: { label: 'Community', color: '#8B5CF6', key: 'community' },
  quality: { label: 'Quality', color: '#FF9F43', key: 'quality' },
  trend: { label: 'Trend', color: '#F472B6', key: 'trend' },
}

export function toggleCompare(fullName: string): void {
  const s = store.getState()
  let list = [...s.compareList]
  if (list.includes(fullName)) {
    list = list.filter(n => n !== fullName)
  } else {
    if (list.length >= 4) return
    list.push(fullName)
  }
  store.setState({ compareList: list })
  updateCompareBar()
}

function updateCompareBar(): void {
  const bar = document.getElementById('compareBar')
  const count = document.getElementById('compareCount')
  const btn = document.getElementById('compareBtn')
  const state = store.getState()

  if (!bar || !count || !btn) return

  if (state.compareList.length === 0) {
    bar.classList.add('hidden')
    return
  }

  bar.classList.remove('hidden')
  count.textContent = `${state.compareList.length} selected`
  btn.classList.toggle('opacity-50', state.compareList.length < 2)
}

export function getCompareRepos(): EnrichedRepository[] {
  const state = store.getState()
  return state.repositories.filter(r => state.compareList.includes(r.full_name))
}

export function clearCompare(): void {
  store.setState({ compareList: [] })
  updateCompareBar()
}

export function showCompare(): void {
  const repos = getCompareRepos()
  if (repos.length < 2) return

  document.body.insertAdjacentHTML('beforeend', renderCompareModal(repos))
  document.getElementById('compareOverlay')!.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCompare()
  })
  document.getElementById('compareClose')!.addEventListener('click', closeCompare)
  document.addEventListener('keydown', handleCompareKey)
}

function handleCompareKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') closeCompare()
}

function closeCompare(): void {
  const el = document.getElementById('compareOverlay')
  if (el) el.remove()
  document.removeEventListener('keydown', handleCompareKey)
}

function renderCompareModal(repos: EnrichedRepository[]): string {
  const maxScore = Math.max(...repos.map(r => r._score), 1)
  const maxStars = Math.max(...repos.map(r => r.stargazers_count), 1)
  const maxGrowth = Math.max(...repos.map(r => r._weeklyGrowth), 1)
  const maxForks = Math.max(...repos.map(r => r.forks_count), 1)

  const compKeys = Object.keys(COMPONENT_META)

  const rows = compKeys.map(key => {
    const meta = COMPONENT_META[key]
    const vals = repos.map(r => {
      const comp = r._scoreBreakdown[key as keyof typeof r._scoreBreakdown] as ScoreComponent
      return comp?.value ?? 0
    })
    const maxVal = Math.max(...vals, 1)

    return `
      <tr>
        <td class="compare-label" style="color:${meta.color}">${meta.label}</td>
        ${repos.map((r, i) => {
          const v = vals[i]
          const pct = (v / maxVal) * 100
          return `
            <td class="compare-cell">
              <div class="compare-cell-top">
                <span class="compare-cell-val">${v}</span>
                <span class="compare-cell-bar-wrap">
                  <span class="compare-cell-bar" style="width:${pct}%;background:${meta.color}"></span>
                </span>
              </div>
            </td>`
        }).join('')}
      </tr>`
  }).join('')

  return `
    <div id="compareOverlay" class="breakdown-overlay">
      <div class="breakdown-modal" style="max-width:600px">
        <div class="breakdown-modal-header">
          <div class="breakdown-modal-title">
            <span class="breakdown-modal-name">Compare Projects</span>
            <span class="breakdown-modal-score">${repos.length} projects</span>
          </div>
          <button id="compareClose" class="breakdown-close">✕</button>
        </div>
        <div class="breakdown-body">
          <table class="compare-table">
            <thead>
              <tr>
                <th class="compare-label-th">Metric</th>
                ${repos.map(r => `<th class="compare-repo-th">
                  <div class="compare-repo-name">${r.full_name.split('/')[1]}</div>
                  <div class="compare-repo-owner">${r.owner.login}</div>
                  <div class="compare-repo-stars">⭐ ${r.stargazers_count.toLocaleString()}</div>
                </th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="compare-label">Stars</td>
                ${repos.map(r => {
                  const pct = (r.stargazers_count / maxStars) * 100
                  return `<td class="compare-cell"><div class="compare-cell-top"><span class="compare-cell-val">${r.stargazers_count.toLocaleString()}</span></div></td>`
                }).join('')}
              </tr>
              <tr>
                <td class="compare-label" style="color:#22C55E">Growth/w</td>
                ${repos.map(r => {
                  const pct = (r._weeklyGrowth / maxGrowth) * 100
                  return `<td class="compare-cell"><div class="compare-cell-top"><span class="compare-cell-val">+${r._weeklyGrowth}</span><span class="compare-cell-bar-wrap"><span class="compare-cell-bar" style="width:${pct}%;background:#22C55E"></span></span></div></td>`
                }).join('')}
              </tr>
              <tr>
                <td class="compare-label" style="color:#64748b">Forks</td>
                ${repos.map(r => {
                  const pct = (r.forks_count / maxForks) * 100
                  return `<td class="compare-cell"><div class="compare-cell-top"><span class="compare-cell-val">${r.forks_count.toLocaleString()}</span><span class="compare-cell-bar-wrap"><span class="compare-cell-bar" style="width:${pct}%;background:#64748b"></span></span></div></td>`
                }).join('')}
              </tr>
              ${rows}
              <tr class="compare-total-row">
                <td class="compare-label" style="color:#58a6ff">Total Score</td>
                ${repos.map(r => {
                  const pct = (r._score / maxScore) * 100
                  return `<td class="compare-cell"><div class="compare-cell-top"><span class="compare-cell-val compare-cell-val-score">${r._score}</span><span class="compare-cell-bar-wrap"><span class="compare-cell-bar" style="width:${pct}%;background:linear-gradient(90deg,#58a6ff,#8B5CF6)"></span></span></div></td>`
                }).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>`
}
