# ADR-002: Discovery Modes

## Status
Accepted

## Context
The main screen currently shows search results only. The product spec (`RADAR_PRO_PRODUCT_SPEC.md`) defines a discovery-first experience with multiple modes: Trending Now, Hidden Gems, Exploding, New & Promising, Established, Experimental.

Each mode represents a different query strategy + client-side filtering/ranking.

## Decision

### 1. Mode definitions

Each mode maps to a GitHub Search query + optional client-side post-filter:

| Mode           | Query strategy                              | Post-filter                          |
|----------------|---------------------------------------------|--------------------------------------|
| Trending Now   | `created:>=YYYY-MM-DD` sort by stars desc   | momentum > 70                       |
| Hidden Gems    | `stars:<10000 created:>=YYYY-MM-DD`         | growth > 75, quality > 70           |
| Exploding      | `created:>=YYYY-MM-DD` sort by stars desc   | acceleration signal from scores     |
| New & Promising| `created:>=6months` sort by stars desc      | score > 50                          |
| Established    | `stars:>50000` sort by stars desc           | quality > 80                        |
| Experimental   | `stars:<1000 created:>=YYYY-MM-DD`          | score < 60, has trend topics        |

### 2. Architecture

```
src/features/discovery/
  modes.ts          → Mode definitions, query builders
  sections.ts       → Section renderers (home page sections)
  tabs.ts           → Tab navigation logic
```

### 3. UI

- Tabs row below header: `[Trending] [Hidden Gems] [Exploding] [New] [Established]`
- Active tab changes the API query and re-fetches
- Active tab label shown in the filter summary
- Default mode: Trending Now

### 4. State

Add `mode` to `RadarStoreState`:
```ts
mode: 'trending' | 'hidden-gems' | 'exploding' | 'new' | 'established' | 'search'
```

When a tab is selected, the filter panel adjusts presets accordingly.

## Consequences
- Users discover without typing a search query
- Each mode becomes a reusable query configuration
- Active tab context is preserved in state

## References
- `docs/RADAR_PRO_PRODUCT_SPEC.md` §7 (Discovery Experience)
- `docs/RADAR_PRO_ROADMAP.md` Phase 3
- `src/api/github.ts`
- `src/components/filters.ts`
