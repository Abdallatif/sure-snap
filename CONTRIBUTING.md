# Contributing

This guide covers how to set up the project locally and the conventions we follow.

## Getting started

### Prerequisites

- Node.js 18+
- Yarn 4 (enable via `corepack enable`)

### Setup

```bash
git clone https://github.com/abdallatif/sure-snap.git
cd sure-snap
corepack enable
yarn install
```

### Development

```bash
yarn dev          # Start dev server at http://localhost:5173
yarn build        # Production build
yarn preview      # Preview the production build
yarn lint         # Run ESLint
yarn tsc --noEmit # Type-check without emitting
```

## Project structure

```
src/
├── components/   # React components
├── contexts/     # React contexts (settings, theme)
├── hooks/        # Custom hooks
├── lib/          # Utilities and helpers
├── locales/      # i18n translation files (en, ar)
└── main.tsx      # Entry point
```

## Conventions

### Code style

- TypeScript strict mode
- ESLint enforces style — run `yarn lint` before committing
- Keep components small and focused

### i18n

All user-facing strings must use i18n (`useTranslation` hook). Add keys to both `en` and `ar` locale files.

### RTL support

Use logical CSS properties so layouts flip correctly in RTL:

| Instead of | Use |
|---|---|
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `left-*` / `right-*` | `start-*` / `end-*` |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `border-l` / `border-r` | `border-s` / `border-e` |

For directional animations, use `ltr:` and `rtl:` variant prefixes.

### Commits

- Write concise commit messages that describe **why**, not just what
- Use imperative mood ("add feature" not "added feature")

## Submitting changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `yarn lint` and `yarn tsc --noEmit` to check for errors
4. Open a pull request against `main`

## Reporting issues

Open an issue at [github.com/abdallatif/sure-snap/issues](https://github.com/abdallatif/sure-snap/issues) with:

- What you expected to happen
- What actually happened
- Steps to reproduce

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
