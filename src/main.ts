import './styles/main.scss'

import { store } from './state/store'
import { loadTracked } from './utils/storage'
import { render, switchView, sortBy, toggleTrack, updateToggleButtons, checkMobile } from './core/render'
import { fetchRepos, resetAndFetch, changePage } from './api/github'
import { initTabs, updateTabs } from './features/discovery/tabs'
import { showBreakdown } from './features/scoring/breakdown'
import { showTimeline } from './features/timeline/timeline'
import { toggleCompare, clearCompare, showCompare } from './features/compare/compare'
import {
  initFilterPanel,
  populateLanguages,
  updateFilterSummary,
  setDepth,
  toggleOrder,
  toggleFilters,
  removeChip,
  resetFilters,
  setOnFilterChange,
  onDepthInput,
} from './components/filters'

store.setState({ tracked: loadTracked() })

setOnFilterChange(resetAndFetch)

function handleResultClick(e: MouseEvent): void {
  const target = e.target as HTMLElement

  const actionBtn = target.closest('[data-action]') as HTMLElement | null
  if (actionBtn) {
    const action = actionBtn.dataset.action
    const repo = actionBtn.dataset.repo
    if (!repo) return

    if (action === 'track') {
      toggleTrack(repo, actionBtn)
      return
    }

    if (action === 'timeline') {
      const found = store.getState().repositories.find(r => r.full_name === repo)
      if (found) showTimeline(found)
      return
    }

    if (action === 'compare') {
      toggleCompare(repo)
      return
    }

    if (action === 'insight-toggle') {
      const container = actionBtn.closest('.insight-container') as HTMLElement | null
      if (container) {
        container.classList.toggle('expanded')
      }
      return
    }
  }

  const scoreEl = target.closest('[data-score-click]') as HTMLElement | null
  if (scoreEl) {
    const fullName = scoreEl.dataset.scoreClick
    if (fullName) {
      const repo = store.getState().repositories.find(r => r.full_name === fullName)
      if (repo) showBreakdown(repo)
    }
    return
  }

  const sortTh = target.closest('[data-sort]') as HTMLElement | null
  if (sortTh) {
    const field = sortTh.dataset.sort
    if (field) sortBy(field)
    return
  }
}

function handlePageClick(e: MouseEvent): void {
  const target = e.target as HTMLElement
  const btn = target.closest('[data-delta]') as HTMLElement | null
  if (btn) {
    const delta = parseInt(btn.dataset.delta || '0')
    if (delta) changePage(delta)
  }
}

const topicInput = document.getElementById('topic') as HTMLInputElement
topicInput?.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') resetAndFetch()
})

document.getElementById('searchBtn')?.addEventListener('click', resetAndFetch)

document.getElementById('btn-grid')?.addEventListener('click', () => switchView('grid'))
document.getElementById('btn-list')?.addEventListener('click', () => switchView('list'))
document.getElementById('btn-map')?.addEventListener('click', () => switchView('map'))

document.getElementById('pagination')?.addEventListener('click', handlePageClick)
document.getElementById('results')?.addEventListener('click', handleResultClick)
document.getElementById('compareBtn')?.addEventListener('click', showCompare)
document.getElementById('compareClear')?.addEventListener('click', clearCompare)

document.getElementById('filterToggleBtn')?.addEventListener('click', toggleFilters)
document.getElementById('orderBtn')?.addEventListener('click', toggleOrder)
document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters)
document.getElementById('filterChips')?.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const chipBtn = target.closest('[data-chip]') as HTMLElement | null
  if (chipBtn) {
    const label = chipBtn.dataset.chip
    if (label) removeChip(label)
  }
})

document.getElementById('depthPresets')?.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const preset = target.closest('.depth-preset') as HTMLElement | null
  if (preset) {
    const days = parseInt(preset.dataset.days || '30')
    setDepth(days)
  }
})

document.getElementById('days')?.addEventListener('input', (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  onDepthInput(val)
})

document.getElementById('sort')?.addEventListener('change', updateFilterSummary)
document.getElementById('language')?.addEventListener('change', updateFilterSummary)
document.getElementById('perPage')?.addEventListener('change', updateFilterSummary)

document.getElementById('starsFrom')?.addEventListener('input', updateFilterSummary)
document.getElementById('starsTo')?.addEventListener('input', updateFilterSummary)

window.addEventListener('resize', checkMobile)

document.addEventListener('error', (e: Event) => {
  const img = e.target as HTMLImageElement
  if (img.tagName === 'IMG') {
    img.src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
  }
}, true)

populateLanguages()
updateFilterSummary()
initFilterPanel()
initTabs()
updateTabs()
fetchRepos()
