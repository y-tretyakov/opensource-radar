const STORAGE_KEY = 'osr_tracked'

export function loadTracked(): Set<string> {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return new Set<string>(data)
  } catch {
    return new Set<string>()
  }
}

export function saveTracked(tracked: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...tracked]))
  } catch {
    // localStorage may be full or unavailable
  }
}
