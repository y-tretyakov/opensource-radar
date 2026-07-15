import { describe, it, expect } from 'vitest'
import { clamp, normalize, logScale, rateToScore } from '../normalize'

describe('clamp', () => {
  it('clamps value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('handles edge cases', () => {
    expect(clamp(0, 0, 0)).toBe(0)
    expect(clamp(50, 0, 100)).toBe(50)
  })
})

describe('normalize', () => {
  it('returns 0-100 scale', () => {
    expect(normalize(50, 100)).toBe(50)
    expect(normalize(0, 100)).toBe(0)
    expect(normalize(100, 100)).toBe(100)
  })

  it('handles zero max', () => {
    expect(normalize(10, 0)).toBe(0)
  })

  it('clamps result', () => {
    expect(normalize(200, 100)).toBe(100)
  })
})

describe('logScale', () => {
  it('returns logarithmic scale', () => {
    expect(logScale(0, 100)).toBe(0)
    expect(logScale(100, 100)).toBe(100)
    expect(logScale(10, 100)).toBeGreaterThan(0)
    expect(logScale(10, 100)).toBeLessThan(100)
  })

  it('handles zero or negative values', () => {
    expect(logScale(-1, 100)).toBe(0)
    expect(logScale(0, 0)).toBe(0)
  })
})

describe('rateToScore', () => {
  it('converts rate to score', () => {
    expect(rateToScore(50, 100)).toBe(50)
    expect(rateToScore(0, 100)).toBe(0)
    expect(rateToScore(150, 100)).toBe(100)
  })
})
