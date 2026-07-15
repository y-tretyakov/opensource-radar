# ADR-001: Scoring Engine Architecture

## Status
Accepted

## Context
Current `src/core/radar-score.ts` calculates a primitive score from 4 ad-hoc metrics (popularity, growth, activity, forkScore, descScore). This does not match the product spec (`docs/RADAR_PRO_SCORING_SPEC.md`) which defines 5 weighted components: Growth (25%), Momentum (20%), Community (20%), Quality (20%), Trend (15%).

The current code mixes calculation and enrichment in one file, making it hard to extend or test.

## Decision

### 1. Extract scoring into a dedicated feature module

```
src/features/scoring/
  engine.ts         → calculateRadarScore(), component calculators
  types.ts          → RadarScoreComponents, ScoreBreakdown
  weights.ts        → default weights, weight config
  normalize.ts      → normalize values to 0–100
  labels.ts         → applyLabels() — HOT, RISING STAR, EXPLODING, HIDDEN GEM, ESTABLISHED
```

### 2. Score components (matching spec)

| Component   | Weight | Source                                |
|-------------|--------|---------------------------------------|
| Growth      | 25%    | star velocity, growth rate, acceleration |
| Momentum    | 20%    | commits, releases, recent activity    |
| Community   | 20%    | contributors, forks, PRs, issue health |
| Quality     | 20%    | README, LICENSE, docs, tests, structure |
| Trend       | 15%    | technology relevance / ecosystem      |

Each component outputs a value 0–100. Final score = weighted sum, also 0–100.

### 3. Each score must be explainable

`ScoreBreakdown` interface:

```ts
interface ScoreBreakdown {
  total: number
  components: {
    growth: { value: number; reasons: string[] }
    momentum: { value: number; reasons: string[] }
    community: { value: number; reasons: string[] }
    quality: { value: number; reasons: string[] }
    trend: { value: number; reasons: string[] }
  }
}
```

### 4. Enrichment stays a thin wrapper

`enrichRepo` in `src/core/radar-score.ts` calls the new engine and attaches `_score`, `_scoreBreakdown`, `_badges`, `_classification` to the repo object.

### 5. Phase approach

1. **Phase 2a** — Implement Growth + Momentum components (use existing API data)
2. **Phase 2b** — Implement Community + Quality components (may need additional API calls)
3. **Phase 2c** — Implement Trend component (language/ecosystem mapping)
4. **Phase 2d** — Badge system + Score explanation UI

## Consequences

- Positive: Clear separation of calculation vs enrichment
- Positive: All 5 spec components will be measurable
- Positive: Score explanation becomes data-driven
- Negative: Additional GitHub API calls needed for contributors, releases, README content
- Risk: API rate limits — need caching layer or batching

## Alternatives Considered

- Keep scoring in one flat function — rejected because it would not scale to 5 components with explanations
- Compute scores in Web Worker — premature optimization for MVP

## References

- `docs/RADAR_PRO_SCORING_SPEC.md`
- `docs/RADAR_PRO_ROADMAP.md` Phase 2
- `src/core/radar-score.ts` (current implementation)
