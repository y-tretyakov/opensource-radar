import type { InsightSignal, InsightRepoData } from '../types'

const TECHNOLOGY_MAP: Record<string, { label: string; keywords: string[] }> = {
  'AI/ML': {
    label: 'Artificial Intelligence',
    keywords: ['ai', 'llm', 'machine-learning', 'deep-learning', 'neural-network', 'gpt', 'openai', 'langchain', 'rag', 'vector-database', 'embedding', 'transformer'],
  },
  Rust: {
    label: 'Rust',
    keywords: ['rust', 'cargo', 'wasm', 'webassembly'],
  },
  'Cloud Native': {
    label: 'Cloud Native',
    keywords: ['kubernetes', 'docker', 'cloud-native', 'container', 'helm', 'istio', 'service-mesh'],
  },
  'Developer Tools': {
    label: 'Developer Tools',
    keywords: ['cli', 'terminal', 'developer-tools', 'devtools', 'debugger', 'linter', 'formatter'],
  },
  WebAssembly: {
    label: 'WebAssembly',
    keywords: ['wasm', 'webassembly', 'wasi'],
  },
  'Edge Computing': {
    label: 'Edge Computing',
    keywords: ['edge', 'edge-computing', 'serverless', 'cdn', 'worker'],
  },
  WebGPU: {
    label: 'WebGPU',
    keywords: ['webgpu', 'gpu', 'compute-shader'],
  },
  eBPF: {
    label: 'eBPF',
    keywords: ['ebpf', 'bpf', 'linux-kernel'],
  },
  Blockchain: {
    label: 'Blockchain',
    keywords: ['blockchain', 'web3', 'crypto', 'solidity', 'smart-contract', 'defi'],
  },
  Security: {
    label: 'Security',
    keywords: ['security', 'cryptography', 'encryption', 'auth', 'oauth', 'jwt', 'zero-trust'],
  },
  'Open Source': {
    label: 'Open Source Practices',
    keywords: ['hacktoberfest', 'good-first-issue', 'contributing', 'first-timers-only'],
  },
}

export function evaluateTechnologyRules(repo: InsightRepoData): InsightSignal[] {
  const signals: InsightSignal[] = []
  const allTerms = [
    ...repo.topics.map(t => t.toLowerCase()),
    ...(repo.language ? [repo.language.toLowerCase()] : []),
  ]

  const detected: string[] = []
  for (const [key, tech] of Object.entries(TECHNOLOGY_MAP)) {
    const matches = tech.keywords.some(kw => allTerms.includes(kw))
    if (matches) {
      detected.push(key)
    }
  }

  if (detected.length > 0) {
    const top = detected.slice(0, 3)
    signals.push({
      type: 'positive',
      title: `Trending ecosystem: ${top.join(', ')}`,
      description: `Project operates in ${detected.length > 1 ? 'multiple trending domains' : 'a trending technology domain'}: ${detected.join(', ')}`,
      weight: 70 + Math.min(detected.length * 10, 25),
      category: 'technology',
    })
  }

  if (repo.trendScore >= 80) {
    signals.push({
      type: 'positive',
      title: 'Strong technology trend alignment',
      description: 'Technology stack aligns with current industry growth areas',
      weight: 75,
      category: 'technology',
    })
  }

  if (repo.language) {
    const trendingLangs: Record<string, number> = {
      rust: 90, zig: 85, go: 75, python: 65, typescript: 60, kotlin: 55,
    }
    const langBonus = trendingLangs[repo.language.toLowerCase()]
    if (langBonus) {
      signals.push({
        type: 'positive',
        title: `${repo.language} is trending`,
        description: `${repo.language} is among the fastest-growing programming languages in the OSS ecosystem`,
        weight: langBonus,
        category: 'technology',
      })
    }
  }

  return signals
}
