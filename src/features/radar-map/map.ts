import type { EnrichedRepository } from '../../models/repository'
import { langColor } from '../../utils/format'

interface Point {
  x: number
  y: number
  r: number
  repo: EnrichedRepository
  color: string
}

export function renderRadarMap(repos: EnrichedRepository[], container: HTMLElement): void {
  container.className = 'results-container'
  container.innerHTML = `<div class="radar-map-wrap"><canvas id="radarCanvas" class="radar-canvas"></canvas><div id="radarTooltip" class="radar-tooltip hidden"></div></div>`

  const canvas = document.getElementById('radarCanvas') as HTMLCanvasElement
  const tooltip = document.getElementById('radarTooltip') as HTMLElement
  if (!canvas) return

  const rect = container.getBoundingClientRect()
  const w = Math.max(rect.width - 4, 600)
  const h = Math.max(600, Math.min(800, window.innerHeight * 0.75))

  const dpr = window.devicePixelRatio || 1
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const pad = { top: 40, right: 40, bottom: 50, left: 60 }
  const plotW = w - pad.left - pad.right
  const plotH = h - pad.top - pad.bottom

  const maxStars = Math.max(...repos.map(r => r.stargazers_count), 1)
  const maxGrowth = Math.max(...repos.map(r => r._growthPerDay), 1)
  const minStars = Math.min(...repos.map(r => r.stargazers_count), 0)

  const points: Point[] = repos.map(repo => {
    const nx = (repo.stargazers_count - minStars) / (maxStars - minStars || 1)
    const ny = repo._growthPerDay / maxGrowth
    const size = Math.max(4, Math.min(30, Math.log10(repo.stargazers_count + 1) * 6))

    return {
      x: pad.left + nx * plotW,
      y: pad.top + (1 - ny) * plotH,
      r: size,
      repo,
      color: langColor(repo.language),
    }
  })

  drawAxes(ctx, w, h, pad, plotW, plotH, maxStars, maxGrowth)
  drawPoints(ctx, points)

  let hovered: Point | null = null

  canvas.addEventListener('mousemove', (e) => {
    const br = canvas.getBoundingClientRect()
    const mx = e.clientX - br.left
    const my = e.clientY - br.top

    hovered = null
    for (const p of points) {
      const dx = mx - p.x
      const dy = my - p.y
      if (dx * dx + dy * dy < (p.r + 6) * (p.r + 6)) {
        hovered = p
        break
      }
    }

    if (hovered) {
      const r = hovered.repo
      tooltip.innerHTML = `
        <div class="radar-tooltip-name">${r.full_name}</div>
        <div class="radar-tooltip-stat">⭐ ${r.stargazers_count.toLocaleString()} stars</div>
        <div class="radar-tooltip-stat">📈 +${r._weeklyGrowth}/week</div>
        <div class="radar-tooltip-stat">🏷 ${r.language || '—'} · ${r._classification}</div>
        <div class="radar-tooltip-score">Score: ${r._score}/100</div>`
      tooltip.classList.remove('hidden')

      let tx = mx + 14
      let ty = my - 10
      if (tx + 180 > w) tx = mx - 186
      if (ty < 4) ty = 4
      if (ty + 80 > h) ty = h - 84
      tooltip.style.left = `${tx}px`
      tooltip.style.top = `${ty}px`
      canvas.style.cursor = 'pointer'
    } else {
      tooltip.classList.add('hidden')
      canvas.style.cursor = 'default'
    }

    drawAxes(ctx, w, h, pad, plotW, plotH, maxStars, maxGrowth)
    drawPoints(ctx, points)
    if (hovered) drawHighlight(ctx, hovered)
  })

  canvas.addEventListener('click', () => {
    if (hovered) {
      window.open(hovered.repo.html_url, '_blank')
    }
  })

  canvas.addEventListener('mouseleave', () => {
    tooltip.classList.add('hidden')
    hovered = null
    drawAxes(ctx, w, h, pad, plotW, plotH, maxStars, maxGrowth)
    drawPoints(ctx, points)
  })
}

function drawAxes(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  pad: { top: number; right: number; bottom: number; left: number },
  plotW: number, plotH: number,
  maxStars: number, maxGrowth: number,
): void {
  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = '#080B12'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(38, 48, 67, 0.4)'
  ctx.lineWidth = 1
  ctx.setLineDash([])

  ctx.strokeRect(pad.left, pad.top, plotW, plotH)

  const xTicks = 5
  for (let i = 0; i <= xTicks; i++) {
    const x = pad.left + (i / xTicks) * plotW
    ctx.beginPath()
    ctx.moveTo(x, pad.top)
    ctx.lineTo(x, pad.top + plotH)
    ctx.strokeStyle = 'rgba(38, 48, 67, 0.15)'
    ctx.stroke()

    ctx.fillStyle = '#64748b'
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'center'
    const val = Math.round((i / xTicks) * maxStars)
    ctx.fillText(val.toLocaleString(), x, pad.top + plotH + 18)
  }

  const yTicks = 5
  for (let i = 0; i <= yTicks; i++) {
    const y = pad.top + (i / yTicks) * plotH
    ctx.beginPath()
    ctx.moveTo(pad.left, y)
    ctx.lineTo(pad.left + plotW, y)
    ctx.strokeStyle = 'rgba(38, 48, 67, 0.15)'
    ctx.stroke()

    ctx.fillStyle = '#64748b'
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'right'
    const val = Math.round((1 - i / yTicks) * maxGrowth)
    ctx.fillText(String(val), pad.left - 8, y + 4)
  }

  ctx.fillStyle = '#8993A8'
  ctx.font = '11px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Popularity (stars) →', pad.left + plotW / 2, h - 8)

  ctx.save()
  ctx.translate(16, pad.top + plotH / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.fillText('Growth (stars/day) →', 0, 0)
  ctx.restore()
}

function drawPoints(ctx: CanvasRenderingContext2D, points: Point[]): void {
  for (const p of points) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = p.color + '66'
    ctx.fill()
    ctx.strokeStyle = p.color + '99'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

function drawHighlight(ctx: CanvasRenderingContext2D, p: Point): void {
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.r + 4, 0, Math.PI * 2)
  ctx.strokeStyle = '#58a6ff'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = p.color + 'CC'
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.stroke()
}
