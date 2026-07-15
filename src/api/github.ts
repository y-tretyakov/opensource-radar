import type { GitHubSearchResponse, FilterState } from './types'
import type { EnrichedRepository } from '../models/repository'
import { enrichRepo } from '../core/radar-score'
import { render } from '../core/render'
import { store } from '../state/store'
import { getFilters } from '../components/filters'

const API_BASE = 'https://api.github.com/search/repositories'

function buildQuery(f: FilterState): string {
  const date = new Date()
  date.setDate(date.getDate() - f.days)
  const dateStr = date.toISOString().split('T')[0]

  let q = `topic:${f.topic}+created:>=${dateStr}+stars:${f.starsFrom}..${f.starsTo}`
  if (f.language) q += `+language:${f.language}`

  return q
}

export async function searchRepositories(
  f: FilterState,
  page: number
): Promise<{ repos: EnrichedRepository[]; totalCount: number }> {
  const q = buildQuery(f)
  const url = `${API_BASE}?q=${q}&sort=${f.sort}&order=${f.order}&per_page=${f.perPage}&page=${page}`

  const res = await fetch(url)
  if (!res.ok) throw new Error('API Error ' + res.status)

  const data: GitHubSearchResponse = await res.json()
  const repos = (data.items || []).map(enrichRepo)

  return { repos, totalCount: data.total_count }
}

export async function fetchRepos(): Promise<void> {
  const container = document.getElementById('results')
  if (!container) return

  const f = getFilters()

  container.innerHTML = '<div class="col-span-full text-center py-24"><div class="inline-block w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin"></div><p class="mt-3 text-sm text-slate-500">Scanning...</p></div>'

  document.getElementById('viewToggleBar')?.classList.add('hidden')
  const hdr = document.getElementById('headerResultCount')
  if (hdr) hdr.textContent = ''

  try {
    const { repos, totalCount } = await searchRepositories(f, store.getState().page)

    store.setState({ repositories: repos })

    const countStr = repos.length ? `${totalCount.toLocaleString()} projects` : ''
    const hdrEl = document.getElementById('headerResultCount')
    if (hdrEl) hdrEl.textContent = countStr
    const vrc = document.getElementById('viewResultCount')
    if (vrc) vrc.textContent = countStr

    const pagination = document.getElementById('pagination')
    pagination?.classList.toggle('hidden', !repos.length)
    const pi = document.getElementById('pageInfo')
    if (pi) pi.textContent = `Page ${store.getState().page}`

    if (repos.length) {
      document.getElementById('viewToggleBar')?.classList.remove('hidden')
    }

    render()
  } catch {
    const el = document.getElementById('results')
    if (el) {
      el.innerHTML = '<div class="col-span-full text-center py-24 text-sm" style="color:#FF9F43">Signal lost — API rate limit<br><span class="text-slate-500 text-xs mt-2 block">Retune in a minute</span></div>'
    }
  }
}

export function resetAndFetch(): void {
  store.setState({ page: 1 })
  fetchRepos()
}

export function changePage(delta: number): void {
  const newPage = Math.max(1, store.getState().page + delta)
  store.setState({ page: newPage } as { page: number })
  fetchRepos()
}
