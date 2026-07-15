import type { EnrichedRepository } from '../../models/repository'
import { insightEngine, repoToInsightData } from '../insights'
import { escapeHtml } from '../../utils/format'

export function renderWhyInteresting(repo: EnrichedRepository): string {
  const data = repoToInsightData(repo)
  const insight = insightEngine.analyze(data)

  const signalCount = insight.signals.filter(s => s.type === 'positive').length
  const warningCount = insight.signals.filter(s => s.type === 'warning').length

  const topSignals = insight.signals
    .filter(s => s.type === 'positive')
    .slice(0, 5)

  const warnings = insight.signals
    .filter(s => s.type === 'warning')
    .slice(0, 3)

  const signalsHtml = topSignals.map(s => `
    <div class="flex items-start gap-2 text-xs text-slate-400" title="${escapeHtml(s.description)}">
      <span class="${s.weight >= 80 ? 'text-green-500/70' : 'text-slate-500'} shrink-0">▸</span>
      <span>${escapeHtml(s.title)}</span>
    </div>
  `).join('')

  const warningsHtml = warnings.length > 0 ? `
    <div class="mt-2.5">
      <div class="text-[10px] uppercase tracking-wider text-yellow-500/50 font-medium mb-1">Potential Risks</div>
      ${warnings.map(s => `
        <div class="flex items-start gap-2 text-xs text-slate-400" title="${escapeHtml(s.description)}">
          <span class="text-yellow-500/70 shrink-0">⚠</span>
          <span>${escapeHtml(s.title)}</span>
        </div>
      `).join('')}
    </div>
  ` : ''

  const preview = `
    <div class="insight-toggle cursor-pointer select-none flex items-center justify-between" data-action="insight-toggle" data-repo="${escapeHtml(repo.full_name)}">
      <div class="flex items-center gap-1.5 text-[10px]">
        <span class="text-blue-500/50 uppercase tracking-wider font-medium">Why interesting</span>
        <span class="text-slate-600">·</span>
        <span class="text-slate-500">${insight.confidence}%</span>
        <span class="text-slate-600">·</span>
        <span class="text-slate-500">${signalCount + warningCount} sig</span>
      </div>
      <span class="insight-chevron text-slate-500 transition-transform duration-200 shrink-0 text-[10px]">▸</span>
    </div>`

  const panel = `
    <div class="insight-panel hidden mt-2 pt-2 border-t border-[#263043]/50">
      <div class="text-[10px] uppercase tracking-wider text-slate-600 font-medium mb-1">Summary</div>
      <div class="text-xs text-slate-400 leading-relaxed mb-2.5">${escapeHtml(insight.summary)}</div>
      ${signalsHtml.length ? `
        <div class="text-[10px] uppercase tracking-wider text-blue-500/50 font-medium mb-1">Strong Signals</div>
        ${signalsHtml}
      ` : ''}
      ${warningsHtml}
      <div class="mt-2 text-[10px] text-slate-600">
        <span class="font-medium text-slate-500">Confidence:</span> ${insight.confidence}%
      </div>
    </div>`

  return `<div class="insight-container">${preview}${panel}</div>`
}
