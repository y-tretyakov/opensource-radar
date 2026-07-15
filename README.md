# Radar Pro

Open Source Intelligence Platform — discover, analyze, and monitor promising GitHub projects.

> Find tomorrow's open source stars today.

## Tech Stack

- **Vite** — Build tool
- **TypeScript** — Type safety (strict mode)
- **SCSS** — Styling (glassmorphism, neon accents)
- **Tailwind CSS** — Utility classes (CDN + PostCSS)
- **GitHub Search API** — Data source
- **Vitest** — Test runner

## Project Structure

```
src/
├── api/
│   ├── github.ts        — GitHub API client (cached, 4min TTL)
│   └── types.ts         — API response interfaces, FilterState
├── components/
│   └── filters.ts       — Filter panel logic (chips, presets, toggles)
├── core/
│   ├── radar-score.ts   — enrichRepo, radar score calculation
│   └── render.ts        — DOM rendering (cards, list, map views)
├── features/
│   ├── compare/         — Compare up to 4 projects side-by-side
│   ├── discovery/       — Discovery modes (trending, gems, exploding, etc.)
│   ├── insights/        — Rule-based insight engine (Phase 6)
│   ├── radar-map/       — Canvas scatter plot (popularity vs growth)
│   ├── scoring/         — 5-component scoring engine, badges, breakdown
│   ├── timeline/        — Milestone timeline modal
│   └── tracking/        — Dashboard, snapshots, change detection
├── models/
│   └── repository.ts    — EnrichedRepository, RadarState, types
├── state/
│   └── store.ts         — Global state with subscriber pattern
├── utils/
│   ├── cache.ts         — In-memory cache with TTL and eviction
│   ├── dates.ts         — timeAgo, daysSince
│   ├── format.ts        — formatCount, langColor, escapeHtml
│   └── storage.ts       — localStorage for tracked repos
├── styles/
│   ├── main.scss        — Entry point (Tailwind + custom)
│   ├── _variables.scss  — Color system, fonts
│   ├── _glass.scss      — Glassmorphism styles
│   ├── _animations.scss — Keyframes (trend, glow, pulse)
│   └── components/      — Cards, buttons, filters SCSS
└── main.ts              — Bootstrap, event listeners
```

## Features

### Scoring Engine
- **Radar Score** (0–100) based on 5 components:
  - Growth (25%) — star velocity, growth rate, acceleration
  - Momentum (20%) — current impulse, recent activity
  - Community (20%) — contributors, PRs, issues, external contributions
  - Quality (20%) — README, docs, license, tests, examples
  - Trend (15%) — technology relevance, ecosystem signals
- Score breakdown modal with component explanations
- "Why interesting" section per project
- Badges: HOT, RISING STAR, EXPLODING, HIDDEN GEM, ESTABLISHED

### Discovery Modes
- **Trending** — high current momentum projects
- **Hidden Gems** — low stars + high growth + strong activity
- **Exploding** — rapid growth acceleration
- **New & Promising** — age < 6 months with positive signals
- **Established** — large quality projects
- **Tracking** — your watched projects dashboard
- **Search** — topic/keyword search with filters

### Views
- **Grid View** — card layout with badges, stats, sparklines
- **List View** — sortable table with all metrics
- **Radar Map View** — canvas scatter plot (popularity vs growth)

### Analysis Tools
- **Timeline** — milestone estimation and project history
- **Compare** — side-by-side comparison of 2–4 projects
- **Insight Engine** — transparent rule-based analysis with signals, warnings, confidence score

### Tracking & Monitoring
- Track repositories (localStorage)
- Score snapshots over time
- Change detection (score changes, star spikes)
- Tracking dashboard with events

## Getting Started

```bash
npm install
npm run dev        # Development server (Vite)
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm test           # Run tests (Vitest)
```

## Deploy

### GitHub Pages (automatic)
On every push to `main`, the GitHub Actions workflow builds, tests, and deploys to GitHub Pages.

Manual trigger: **Actions** → **Deploy to GitHub Pages** → **Run workflow**

### Configuration
- `base: '/opensource-radar/'` in `vite.config.ts` — required for GitHub Pages

## Testing

```bash
npm test            # Run all tests
npm run test:watch  # Watch mode
```

Test runner: Vitest. 68+ tests covering scoring engine, cache, formatters, dates, insight engine.

## Architecture

- **Feature-based** directory structure under `src/features/`
- **Global store** with subscriber pattern (`src/state/store.ts`)
- **No framework** — all DOM manipulation via `innerHTML` + event delegation
- **InsightProvider interface** — ready to swap for AI-powered analysis
- **In-memory cache** with TTL (4 min) and LRU-like eviction (max 200 entries)
- **Request deduplication** — prevents concurrent duplicate API calls

## Performance & Security

- Content-Security-Policy enforced via meta tag
- HTML escaping for all repository data rendered in DOM
- Input validation on filter fields (bounds checking, NaN protection)
- Capped in-memory cache with automatic eviction
- API request deduplication
- Bundle: ~64 KB JS, ~30 KB CSS (gzipped)

## CI/CD

`.github/workflows/deploy-pages.yml`:
- TypeScript type check (`tsc --noEmit`)
- Test execution (`npm test`)
- Production build (`npm run build`)
- Deploy to GitHub Pages
