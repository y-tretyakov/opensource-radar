import type { FilterState } from '../api/types'
import { store } from '../state/store'
import { formatCount, getLanguageKeys } from '../utils/format'

const FILTER_EXPANDED_KEY = 'osr_filter_expanded'

let filterPanelOpen = false
let onFilterChange: (() => void) | null = null

export function setOnFilterChange(fn: () => void): void {
  onFilterChange = fn
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

export function getFilters(): FilterState {
  const topicInput = document.getElementById('topic') as HTMLInputElement
  const starsFrom = document.getElementById('starsFrom') as HTMLInputElement
  const starsTo = document.getElementById('starsTo') as HTMLInputElement
  const days = document.getElementById('days') as HTMLInputElement
  const language = document.getElementById('language') as HTMLSelectElement
  const sort = document.getElementById('sort') as HTMLSelectElement
  const perPage = document.getElementById('perPage') as HTMLSelectElement

  const parsedStarsFrom = parseInt(starsFrom?.value)
  const parsedStarsTo = parseInt(starsTo?.value)
  const parsedDays = parseInt(days?.value)
  const parsedPerPage = parseInt(perPage?.value)

  return {
    topic: topicInput?.value.trim() || 'TUI',
    starsFrom: Number.isFinite(parsedStarsFrom) ? clamp(parsedStarsFrom, 0, 1000000) : 0,
    starsTo: Number.isFinite(parsedStarsTo) ? clamp(parsedStarsTo, 0, 1000000) : 1000000,
    days: Number.isFinite(parsedDays) ? clamp(parsedDays, 1, 3650) : 30,
    language: language?.value || '',
    sort: sort?.value || 'stars',
    order: store.getState().sortOrder,
    perPage: Number.isFinite(parsedPerPage) ? clamp(parsedPerPage, 1, 100) : 25,
  }
}

export function onDepthInput(val: string | number): void {
  const numVal = typeof val === 'string' ? parseInt(val) : val
  const daysVal = document.getElementById('daysVal')
  if (daysVal) daysVal.textContent = String(numVal)
  document.querySelectorAll('.depth-preset').forEach(b =>
    b.classList.toggle('active', parseInt((b as HTMLElement).dataset.days || '0') === numVal)
  )
  updateFilterSummary()
}

export function setDepth(days: number): void {
  const slider = document.getElementById('days') as HTMLInputElement
  if (slider) slider.value = String(days)
  onDepthInput(days)
}

export function toggleOrder(): void {
  const current = store.getState().sortOrder
  const next = current === 'desc' ? 'asc' : 'desc'
  store.setState({ sortOrder: next })
  const btn = document.getElementById('orderBtn')
  if (btn) {
    btn.innerHTML = next === 'desc'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 5 19 12"/></svg>'
  }
  updateFilterSummary()
}

export function updateFilterSummary(): void {
  const f = getFilters()
  const chips = document.getElementById('filterChips')
  const summary = document.getElementById('filterSummary')
  if (!summary) return

  const parts: [string, string][] = []
  parts.push(['Topic', f.topic])
  parts.push(['Stars', `${f.starsFrom}–${formatCount(f.starsTo)}`])
  parts.push(['Created', `${f.days}d`])
  if (f.language) parts.push(['Lang', f.language])

  summary.textContent = parts.map(([, v]) => v).join(' · ')

  if (!chips) return

  chips.innerHTML = parts.map(([label, value]) =>
    `<span class="filter-chip"><span>${label}: ${value}</span><button data-chip="${label}" aria-label="Remove ${label} filter">✕</button></span>`
  ).join('')
}

export function removeChip(label: string): void {
  switch (label) {
    case 'Topic':
      (document.getElementById('topic') as HTMLInputElement).value = 'TUI'
      break
    case 'Stars':
      (document.getElementById('starsFrom') as HTMLInputElement).value = '10'
      ;(document.getElementById('starsTo') as HTMLInputElement).value = '1000'
      break
    case 'Created':
      setDepth(30)
      break
    case 'Lang':
      (document.getElementById('language') as HTMLSelectElement).value = ''
      break
  }
  updateFilterSummary()
  onFilterChange?.()
}

export function resetFilters(): void {
  (document.getElementById('topic') as HTMLInputElement).value = 'TUI'
  ;(document.getElementById('starsFrom') as HTMLInputElement).value = '10'
  ;(document.getElementById('starsTo') as HTMLInputElement).value = '1000'
  setDepth(30)
  ;(document.getElementById('language') as HTMLSelectElement).value = ''
  ;(document.getElementById('sort') as HTMLSelectElement).value = 'stars'
  store.setState({ sortOrder: 'desc' })
  const btn = document.getElementById('orderBtn')
  if (btn) {
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>'
  }
  const pp = document.getElementById('perPage') as HTMLSelectElement
  if (pp) pp.value = '25'
  updateFilterSummary()
  onFilterChange?.()
}

export function initFilterPanel(): void {
  filterPanelOpen = localStorage.getItem(FILTER_EXPANDED_KEY) === 'true'
  const panel = document.getElementById('filterPanel')
  const toggleBtn = document.getElementById('filterToggleBtn')

  if (filterPanelOpen) {
    panel?.classList.add('open')
    toggleBtn?.classList.add('text-blue-400', 'open')
  }
}

export function toggleFilters(): void {
  filterPanelOpen = !filterPanelOpen
  const panel = document.getElementById('filterPanel')
  const toggleBtn = document.getElementById('filterToggleBtn')

  if (panel) panel.classList.toggle('open', filterPanelOpen)
  if (toggleBtn) toggleBtn.classList.toggle('text-blue-400', filterPanelOpen)
  if (toggleBtn) toggleBtn.classList.toggle('open', filterPanelOpen)

  localStorage.setItem(FILTER_EXPANDED_KEY, String(filterPanelOpen))

  if (filterPanelOpen) updateFilterSummary()
}

export function populateLanguages(): void {
  const sel = document.getElementById('language') as HTMLSelectElement
  if (!sel) return
  const langs = getLanguageKeys()
  for (const l of langs) {
    const opt = document.createElement('option')
    opt.value = l
    opt.textContent = l
    sel.appendChild(opt)
  }
}
