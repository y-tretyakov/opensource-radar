import { describe, it, expect, beforeEach } from 'vitest'
import { cacheGet, cacheSet, cacheClear, cacheKeys } from '../cache'

beforeEach(() => {
  cacheClear()
})

describe('cache', () => {
  it('stores and retrieves values', () => {
    cacheSet('key1', { data: 42 })
    expect(cacheGet('key1')).toEqual({ data: 42 })
  })

  it('returns null for missing keys', () => {
    expect(cacheGet('nonexistent')).toBeNull()
  })

  it('returns null after expiry', () => {
    cacheSet('key2', 'value', -1)
    expect(cacheGet('key2')).toBeNull()
  })

  it('clears all entries', () => {
    cacheSet('a', 1)
    cacheSet('b', 2)
    cacheClear()
    expect(cacheGet('a')).toBeNull()
    expect(cacheGet('b')).toBeNull()
  })

  it('lists keys', () => {
    cacheSet('x', 1)
    cacheSet('y', 2)
    expect(cacheKeys()).toEqual(expect.arrayContaining(['x', 'y']))
    expect(cacheKeys().length).toBe(2)
  })

  it('removes expired entries from keys', () => {
    cacheSet('z', 1, -1)
    cacheGet('z')
    expect(cacheKeys()).not.toContain('z')
  })
})
