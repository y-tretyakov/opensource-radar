import { langIcon as _langIcon } from './devicon-map'

const COLORS: Record<string, string> = {
  'JavaScript': '#f7df1e', 'TypeScript': '#3178c6', 'Python': '#3572A5', 'Go': '#00ADD8',
  'Rust': '#dea584', 'C': '#555555', 'C++': '#f34b7d', 'Java': '#b07219', 'Kotlin': '#A97BFF',
  'Ruby': '#701516', 'PHP': '#4F5D95', 'Swift': '#F05138', 'Scala': '#c22d40', 'Dart': '#00B4AB',
  'Elixir': '#4e2a59', 'Clojure': '#db5855', 'Haskell': '#5e5086', 'Lua': '#000080',
  'Zig': '#ec915c', 'Nim': '#ffc200', 'Shell': '#89e051', 'HTML': '#e34f26', 'CSS': '#563d7c',
  'Crystal': '#000100', 'OCaml': '#3be133', 'Solidity': '#363636', 'R': '#198CE7',
}

const DEFAULT_LANG_COLOR = '#64748b'

export function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

export function formatInt(n: number): string {
  return Number(n).toLocaleString()
}

export function langColor(lang: string | null): string {
  return lang && COLORS[lang] ? COLORS[lang] : DEFAULT_LANG_COLOR
}

export const langIcon = _langIcon

export function getLanguageKeys(): string[] {
  return Object.keys(COLORS).sort()
}

export function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
