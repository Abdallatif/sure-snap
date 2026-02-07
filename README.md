# SureSnap

A Progressive Web App companion for [Sure](https://github.com/we-promise/sure) that enables quick transaction capture with offline support.

## About

SureSnap is a lightweight, mobile-first capture tool designed to log expenses on the go. It prioritizes speed to entry — get in, record a transaction, and get out. Transactions are queued locally and synced to the Sure API when connectivity is available.

## Features

- **Quick transaction entry** — amount, merchant, and category in minimal taps
- **Offline-first** — works without internet; syncs when back online via background queue
- **Bilingual** — English and Arabic with full RTL support
- **PWA** — installable on mobile with service worker caching

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 7 |
| Language | TypeScript 5.9 |
| UI | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v4 |
| Server State | TanStack Query v5 |
| Local Storage | IndexedDB (idb-keyval) + localStorage |
| i18n | i18next + react-i18next |
| PWA | vite-plugin-pwa (Workbox) |
| Package Manager | Yarn 4 |

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 4 (`corepack enable`)

### Install

```bash
yarn install
```

### Development

```bash
yarn dev
```

Opens at `http://localhost:5173`.

### Build

```bash
yarn build
```

### Preview

```bash
yarn preview
```

### Lint

```bash
yarn lint
```

## API Integration

SureSnap connects to a [Sure](https://github.com/we-promise/sure) backend instance:

- **Endpoint**: `/api/v1/transactions`
- **Auth**: API key or OAuth token (configured in app settings)
- **Sync strategy**: Transactions are stored locally in IndexedDB and pushed to the API when online. TanStack Query handles mutation persistence and retry.

API documentation is available in [`sure-docs/api/`](sure-docs/api/).

## Architecture

```
SettingsContext.Provider (localStorage)
└── PersistQueryClientProvider (IndexedDB)
    └── App
        ├── Header
        ├── SetupBanner / CaptureForm
        └── SettingsSheet
```

- **No router** — single capture screen with a settings overlay
- **Offline data** — TanStack Query persists API cache to IndexedDB; service worker caches static assets only
- **Optimistic updates** — transactions appear immediately in the UI before server confirmation

## License

See [Sure](https://github.com/we-promise/sure) for licensing details.
