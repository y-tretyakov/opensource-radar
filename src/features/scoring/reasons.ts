import type { EnrichedRepository } from '../../models/repository'
import { insightEngine, repoToInsightData } from '../insights'

export function renderWhyInteresting(repo: EnrichedRepository): string {
  const data = repoToInsightData(repo)
  const insight = insightEngine.analyze(data)

  const topSignals = insight.signals
    .filter(s => s.type === 'positive')
    .slice(0, 3)

  const topWarnings = insight.signals
    .filter(s => s.type === 'warning')
    .slice(0, 1)

  if (topSignals.length === 0 && topWarnings.length === 0) return ''

  const items = [
    ...topSignals.map(s => ({
      icon: s.weight >= 80 ? '🔥' : s.weight >= 60 ? '▸' : '·',
      text: s.title,
      tooltip: s.description,
    })),
    ...topWarnings.map(s => ({
      icon: '⚠',
      text: s.title,
      tooltip: s.description,
    })),
  ]

  return `
    <div class="px-4 pt-2">
      <div class="text-[10px] uppercase tracking-wider text-blue-500/50 font-medium mb-1.5 flex items-center gap-2">
        <span>Why interesting</span>
        <span class="text-[9px] text-slate-600 font-normal normal-case">· ${insight.confidence}% confidence</span>
      </div>
      <ul class="space-y-1">
        ${items.map(item => `
          <li class="text-xs text-slate-400 flex items-start gap-1.5 group cursor-help" title="${item.tooltip}">
            <span class="shrink-0 ${item.icon === '⚠' ? 'text-yellow-500/70' : 'text-green-500/70'}">${item.icon}</span>
            <span>${item.text}</span>
          </li>
        `).join('')}
      </ul>
    </div>`
}
