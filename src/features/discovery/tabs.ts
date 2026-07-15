import { store } from '../../state/store'
import { getMode, type DiscoveryMode } from './modes'
import { resetAndFetch } from '../../api/github'
import { updateFilterSummary } from '../../components/filters'
import { renderTrackingDashboard } from '../tracking/dashboard'

export function switchMode(mode: DiscoveryMode): void {
  const state = store.getState()
  if (state.mode === mode) return

  store.setState({ mode, page: 1 })
  updateTabs()
  applyModeFilters(mode)
  updateFilterSummary()

  if (mode === 'tracking') {
    const container = document.getElementById('results')
    if (container) {
      container.className = 'results-container'
      container.innerHTML = renderTrackingDashboard()
    }
    document.getElementById('viewToggleBar')?.classList.add('hidden')
    document.getElementById('pagination')?.classList.add('hidden')
    document.getElementById('headerResultCount')!.textContent = ''
    document.getElementById('viewResultCount')!.textContent = ''
    return
  }

  resetAndFetch()
}

function applyModeFilters(mode: DiscoveryMode): void {
  const config = getMode(mode)

  const topicInput = document.getElementById('topic') as HTMLInputElement
  const starsFrom = document.getElementById('starsFrom') as HTMLInputElement
  const starsTo = document.getElementById('starsTo') as HTMLInputElement

  if (mode !== 'search') {
    if (topicInput && !topicInput.value.trim()) topicInput.value = 'awesome'
    if (starsFrom && config.minStars !== undefined) starsFrom.value = String(config.minStars)
    if (starsTo && config.maxStars !== undefined) starsTo.value = String(config.maxStars)
    else if (starsTo) starsTo.value = '1000000'
  }
}

export function updateTabs(): void {
  const current = store.getState().mode
  document.querySelectorAll('.mode-tab').forEach(el => {
    const tab = el as HTMLElement
    tab.classList.toggle('active', tab.dataset.mode === current)
  })
}

export function initTabs(): void {
  const container = document.getElementById('modeTabs')
  if (!container) return

  container.addEventListener('click', (e: MouseEvent) => {
    const tab = (e.target as HTMLElement).closest('.mode-tab') as HTMLElement | null
    if (!tab || !tab.dataset.mode) return
    switchMode(tab.dataset.mode as DiscoveryMode)
  })
}
