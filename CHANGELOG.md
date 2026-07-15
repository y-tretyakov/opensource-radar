# Changelog

## [2.0.0] — 2026-07-16

### Phase 6 — Radar Insight Engine
- Rule-based insight engine with 5 signal categories (Growth, Activity, Quality, Community, Technology)
- `RepositoryInsight` model with summary, signals, strengths, warnings, labels, confidence
- Insight summary line on project cards
- "Why interesting" section with top positive signals
- Signal tooltips with detailed explanations
- Confidence percentage display
- 19 new tests for insight engine

### Phase 6 — Bugfix Pass
- API caching layer with 4-minute TTL
- Extended GitHubRepo type with 10+ new API fields
- Improved Community/Quality scores (subscribers, has_*, discussions, homepage)
- Mobile-responsive Radar Map (320px+, touch events, ResizeObserver)
- 49 total unit tests (vitest)

### Phase 5 — Tracking & Monitoring
- Track repositories via localStorage
- Score snapshots and change detection
- Tracking dashboard with events (score changes, star spikes)

### Phase 4 — Advanced Visualization
- Radar Map: Canvas scatter plot (popularity vs growth)
- Timeline view with milestone estimation
- Compare view (up to 4 projects side-by-side)

### Phase 3 — Discovery Modes
- Trending, Hidden Gems, Exploding, New, Established tabs
- Mode-based GitHub query builder
- Tab switching with mode detection

### Phase 2 — Radar Intelligence Engine
- 5-component scoring: Growth(25%), Momentum(20%), Community(20%), Quality(20%), Trend(15%)
- Badge system: HOT, RISING STAR, EXPLODING, HIDDEN GEM, ESTABLISHED
- Project classification (12 categories)
- Score Breakdown modal with component explanations

### Phase 1 — GitHub Explorer MVP
- Keyword/topic/language search
- Filters: stars range, created date, language, sort
- Grid and List views
- Responsive dark glassmorphism UI

### Phase 0 — Foundation
- Vite + TypeScript + SCSS setup
- Tailwind CSS integration
- GitHub Pages deployment
