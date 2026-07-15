import type { EnrichedRepository } from '../../models/repository'
import { langColor } from '../../utils/format'

interface Point {
  x: number
  y: number
  r: number
  repo: EnrichedRepository
  color: string
}

function getCanvasSize(container: HTMLElement): { w: number; h: number } {
  const rect = container.getBoundingClientRect()
  const w = Math.max(rect.width - 4, 320)
  const isMobile = w < 600
  const h = isMobile
    ? Math.max(400, Math.min(500, window.innerHeight * 0.6))
    : Math.max(600, Math.min(800, window.innerHeight * 0.75))
  return { w, h }
}

function getPointerPos(canvas: HTMLCanvasElement, clientX: number, clientY: number): { mx: number; my: number } {
  const br = canvas.getBoundingClientRect()
  return { mx: clientX - br.left, my: clientY - br.top }
}

function findPoint(points: Point[], mx: number, my: number): Point | null {
  for (const p of points) {
    const dx = mx - p.x
    const dy = my - p.y
    if (dx * dx + dy * dy < (p.r + 6) * (p.r + 6)) {
      return p
    }
  }
  return null
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function updateTooltip(tooltip: HTMLElement, hovered: Point, mx: number, my: number, w: number, h: number): void {
  const r = hovered.repo
  tooltip.innerHTML = `
    <div class="radar-tooltip-name">${escapeHtml(r.full_name)}</div>
    <div class="radar-tooltip-stat">⭐ ${r.stargazers_count.toLocaleString()} stars</div>
    <div class="radar-tooltip-stat">📈 +${r._weeklyGrowth}/week</div>
    <div class="radar-tooltip-stat">🏷 ${escapeHtml(r.language || '—')} · ${escapeHtml(r._classification)}</div>
    <div class="radar-tooltip-score">Score: ${r._score}/100</div>`
  tooltip.classList.remove('hidden')

  let tx = mx + 14
  let ty = my - 10
  if (tx + 180 > w) tx = mx - 186
  if (ty < 4) ty = 4
  if (ty + 80 > h) ty = h - 84
  tooltip.style.left = `${tx}px`
  tooltip.style.top = `${ty}px`
}

export function renderRadarMap(repos: EnrichedRepository[], container: HTMLElement): void {
  container.className = 'results-container'
  container.innerHTML = `<div class="radar-map-wrap"><canvas id="radarCanvas" class="radar-canvas"></canvas><div id="radarTooltip" class="radar-tooltip hidden"></div></div>`

  const canvas = document.getElementById('radarCanvas') as HTMLCanvasElement
  const tooltip = document.getElementById('radarTooltip') as HTMLElement
  if (!canvas) return

  let { w, h } = getCanvasSize(container)

  const dpr = window.devicePixelRatio || 1
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const pad = w < 600
    ? { top: 30, right: 20, bottom: 40, left: 45 }
    : { top: 40, right: 40, bottom: 50, left: 60 }
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

  let hovered: Point | null = null

  function redraw(): void {
    drawAxes(ctx, w, h, pad, plotW, plotH, maxStars, maxGrowth)
    drawPoints(ctx, points)
    if (hovered) drawHighlight(ctx, hovered)
  }

  redraw()

  function handlePointerMove(mx: number, my: number): void {
    hovered = findPoint(points, mx, my)

    if (hovered) {
      updateTooltip(tooltip, hovered, mx, my, w, h)
      canvas.style.cursor = 'pointer'
    } else {
      tooltip.classList.add('hidden')
      canvas.style.cursor = 'default'
    }

    redraw()
  }

  function handlePointerLeave(): void {
    tooltip.classList.add('hidden')
    hovered = null
    redraw()
  }

  function handlePointerClick(): void {
    if (hovered) {
      window.open(hovered.repo.html_url, '_blank')
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    const { mx, my } = getPointerPos(canvas, e.clientX, e.clientY)
    handlePointerMove(mx, my)
  })

  canvas.addEventListener('click', handlePointerClick)
  canvas.addEventListener('mouseleave', handlePointerLeave)

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const { mx, my } = getPointerPos(canvas, touch.clientX, touch.clientY)
    handlePointerMove(mx, my)
  }, { passive: false })

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const { mx, my } = getPointerPos(canvas, touch.clientX, touch.clientY)
    handlePointerMove(mx, my)
  }, { passive: false })

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault()
    if (hovered) {
      window.open(hovered.repo.html_url, '_blank')
    }
    handlePointerLeave()
  }, { passive: false })

  const resizeObserver = new ResizeObserver(() => {
    const { w: nw, h: nh } = getCanvasSize(container)
    if (nw === w && nh === h) return
    w = nw
    h = nh
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(dpr, dpr)
    redraw()
  })
  resizeObserver.observe(container)
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
