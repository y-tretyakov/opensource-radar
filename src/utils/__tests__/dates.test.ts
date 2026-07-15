import { describe, it, expect } from 'vitest'
import { timeAgo, daysSince } from '../dates'

describe('daysSince', () => {
  it('returns 0 for today', () => {
    const now = new Date().toISOString()
    expect(daysSince(now)).toBe(0)
  })

  it('returns positive for past dates', () => {
    const past = new Date(Date.now() - 86400000 * 7).toISOString()
    expect(daysSince(past)).toBe(7)
  })

  it('returns NaN for invalid dates', () => {
    expect(Number.isNaN(daysSince('invalid'))).toBe(true)
  })
})

describe('timeAgo', () => {
  it('returns moments ago for recent', () => {
    expect(timeAgo(new Date().toISOString())).toBe('moments ago')
  })

  it('returns minutes for recent past', () => {
    const d = new Date(Date.now() - 120000).toISOString()
    expect(timeAgo(d)).toBe('2m ago')
  })

  it('returns hours', () => {
    const d = new Date(Date.now() - 7200000).toISOString()
    expect(timeAgo(d)).toBe('2h ago')
  })

  it('returns days', () => {
    const d = new Date(Date.now() - 86400000 * 5).toISOString()
    expect(timeAgo(d)).toBe('5d ago')
  })

  it('returns months', () => {
    const d = new Date(Date.now() - 86400000 * 60).toISOString()
    expect(timeAgo(d)).toBe('2mo ago')
  })

  it('returns years', () => {
    const d = new Date(Date.now() - 86400000 * 400).toISOString()
    expect(timeAgo(d)).toBe('1y ago')
  })
})
