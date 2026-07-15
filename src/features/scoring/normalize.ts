export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function normalize(value: number, maxVal: number, scale: number = 100): number {
  if (maxVal <= 0) return 0
  return clamp(Math.round((value / maxVal) * scale), 0, scale)
}

export function logScale(value: number, max: number, scale: number = 100): number {
  if (value <= 0 || max <= 0) return 0
  return clamp(Math.round((Math.log10(value + 1) / Math.log10(max + 1)) * scale), 0, scale)
}

export function rateToScore(rate: number, maxRate: number, scale: number = 100): number {
  return normalize(Math.min(rate, maxRate), maxRate, scale)
}
