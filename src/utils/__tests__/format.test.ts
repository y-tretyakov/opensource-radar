import { describe, it, expect } from 'vitest'
import { formatCount, formatInt, langColor, getLanguageKeys } from '../format'

describe('formatCount', () => {
  it('formats numbers with k suffix', () => {
    expect(formatCount(1500)).toBe('1.5k')
    expect(formatCount(1000)).toBe('1k')
    expect(formatCount(999)).toBe('999')
  })

  it('formats numbers with M suffix', () => {
    expect(formatCount(1_500_000)).toBe('1.5M')
    expect(formatCount(2_000_000)).toBe('2M')
  })

  it('handles zero', () => {
    expect(formatCount(0)).toBe('0')
  })
})

describe('formatInt', () => {
  it('formats number as string', () => {
    expect(typeof formatInt(1000)).toBe('string')
    expect(formatInt(0)).toBe('0')
    expect(formatInt(42)).toBe('42')
  })
})

describe('langColor', () => {
  it('returns color for known languages', () => {
    expect(langColor('TypeScript')).toBe('#3178c6')
    expect(langColor('Rust')).toBe('#dea584')
    expect(langColor('Python')).toBe('#3572A5')
  })

  it('returns default for unknown', () => {
    expect(langColor('UnknownLang')).toBe('#64748b')
  })

  it('returns default for null', () => {
    expect(langColor(null)).toBe('#64748b')
  })
})

describe('getLanguageKeys', () => {
  it('returns sorted list', () => {
    const keys = getLanguageKeys()
    expect(keys.length).toBeGreaterThan(10)
    expect(keys[0]).toBe('C')
    expect(keys[keys.length - 1]).toBe('Zig')
  })
})
