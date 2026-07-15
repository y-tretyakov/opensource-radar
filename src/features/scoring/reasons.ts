import type { EnrichedRepository } from '../../models/repository'
import type { ScoreComponent } from './types'

const KEYS: (keyof EnrichedRepository['_scoreBreakdown'])[] = [
  'growth', 'momentum', 'trend', 'community', 'quality',
]

export function getTopReasons(repo: EnrichedRepository, max: number = 4): string[] {
  const reasons: string[] = []
  const seen = new Set<string>()

  for (const key of KEYS) {
    const comp = repo._scoreBreakdown[key] as ScoreComponent
    if (!comp?.reasons) continue
    for (const r of comp.reasons) {
      const normalized = r.toLowerCase().trim()
      if (!seen.has(normalized) && reasons.length < max) {
        seen.add(normalized)
        reasons.push(r)
      }
    }
  }

  return reasons
}

export function renderWhyInteresting(repo: EnrichedRepository): string {
  const reasons = getTopReasons(repo)
  if (!reasons.length) return ''

  return `
    <div class="px-4 pt-2">
      <div class="text-[10px] uppercase tracking-wider text-blue-500/50 font-medium mb-1">Why interesting</div>
      <ul class="space-y-0.5">
        ${reasons.map(r => `<li class="text-xs text-slate-400 flex items-start gap-1.5"><span class="text-green-500/70 mt-0.5 shrink-0">▸</span>${r}</li>`).join('')}
      </ul>
    </div>`
}
