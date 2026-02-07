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
yarn install          # Install dependencies
yarn dev              # Start dev server
yarn build            # Production build
yarn preview          # Preview production build
yarn tsc --noEmit     # Type-check (no npx — typescript is a devDependency)
```

## Conventions

- Keep it minimal - this is a capture tool, not a full finance app
- Prioritize speed to entry over features
- All user-facing strings use i18n
- Match Sure's category/tag structure for seamless sync

## RTL Support

This app supports English (LTR) and Arabic (RTL). The `SettingsContext` sets `dir` and `lang` on `<html>` when the language changes.

When working with shadcn/ui components, use **logical CSS properties** instead of physical ones so they flip automatically in RTL:
- Positioning: `end-0` / `start-0` instead of `right-0` / `left-0`
- Borders: `border-s` / `border-e` instead of `border-l` / `border-r`
- Spacing: `ms-*` / `me-*` / `ps-*` / `pe-*` instead of `ml-*` / `mr-*` / `pl-*` / `pr-*`
- Text: `text-start` / `text-end` instead of `text-left` / `text-right`
- For directional animations (e.g. slide), use `ltr:` and `rtl:` variant prefixes to flip direction

Reference: [shadcn RTL docs](https://ui.shadcn.com/docs/rtl)

## Commit Convention

- One-line message that describes **why**, not what
- Use conventional prefix: `fix:`, `feat:`, `refactor:`, `docs:`, `chore:`
- No AI/LLM attribution in commit messages
- Example: `fix: allow empty API origin for same-origin deployments`

## Releasing a New Version

Image: `ghcr.io/abdallatif/sure-snap` (built by `.github/workflows/docker.yml`)

1. Bump the `version` field in `package.json`
2. Commit: `git commit -am "release v<version>"`
3. Tag: `git tag v<version>`
4. Push both: `git push origin main --tags`

The workflow auto-publishes `:<version>`, `:<major>.<minor>`, and `:latest`.
