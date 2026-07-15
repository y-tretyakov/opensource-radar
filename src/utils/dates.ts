export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const sec = (Date.now() - d.getTime()) / 1000
  if (sec < 60) return 'moments ago'
  const min = sec / 60
  if (min < 60) return Math.floor(min) + 'm ago'
  const hr = min / 60
  if (hr < 24) return Math.floor(hr) + 'h ago'
  const days = hr / 24
  if (days < 30) return Math.floor(days) + 'd ago'
  if (days < 365) return Math.floor(days / 30) + 'mo ago'
  return Math.floor(days / 365) + 'y ago'
}

export function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}
