# CLAUDE.md

## Project Overview

SureSnap is a PWA companion app for [Sure](https://github.com/we-promise/sure) that enables quick transaction capture with offline support.

## Core Features

- Quick transaction entry (amount, merchant, category)
- Offline-first with background sync to Sure API
- Camera receipt capture (optional)
- Minimal UI for speed

## API Integration

- Docs at [Sure API](/sure-docs/api/*)
- Backend: Sure API (`/api/v1/transactions`)
- Auth: API key or OAuth token
- Sync: Queue transactions locally, push when online

## Development Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Conventions

- Keep it minimal - this is a capture tool, not a full finance app
- Prioritize speed to entry over features
- All user-facing strings use i18n
- Match Sure's category/tag structure for seamless sync
