# Radar Pro

Open Source project discovery and monitoring platform.

## Tech Stack

- **Vite** — Build tool
- **TypeScript** — Type safety
- **SCSS** — Styling (glassmorphism, neon accents)
- **Tailwind CSS** — Utility classes (CDN)
- **GitHub Search API** — Data source

## Project Structure

```
src/
├── api/
│   ├── github.ts     — GitHub API client
│   └── types.ts      — API response types
├── components/
│   ├── filters.ts    — Filter panel logic
├── core/
│   ├── radar-score.ts — Radar score calculation
│   └── render.ts     — DOM rendering (cards, table, scroll-reveal)
├── models/
│   └── repository.ts — Repository interfaces
├── state/
│   └── store.ts      — Global state management
├── utils/
│   ├── dates.ts      — Date formatting
│   ├── format.ts     — Number formatting, language colors
│   └── storage.ts    — localStorage persistence
└── styles/
    ├── main.scss     — Entry point
    ├── _variables.scss
    ├── _glass.scss
    ├── _animations.scss
    └── components/
        ├── _cards.scss
        ├── _buttons.scss
        └── _filters.scss
```

## Getting Started

```bash
npm install
npm run dev      # Development server
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Deploy to GitHub Pages

On every push to `main`, the GitHub Actions workflow in `.github/workflows/deploy-pages.yml` automatically builds and deploys to GitHub Pages.

Manual trigger: **Actions** → **Deploy to GitHub Pages** → **Run workflow**

The site is served at:
```
https://<username>.github.io/opensource-radar/
```

## Features

- Search repositories by topic
- Filter by stars, creation date, language
- Grid/List view toggle
- Track repositories (localStorage)
- Sort by stars, growth, forks, activity, score
- Scroll-reveal animations
- Dark glassmorphism UI
