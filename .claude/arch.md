# SureSnap — Architecture

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite |
| Language | TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 |
| Server State | TanStack Query v5 + persistor |
| Local State | React Context (settings in localStorage) |
| i18n | i18next + react-i18next (EN, AR + RTL) |
| PWA | vite-plugin-pwa (Workbox) |
| Package Manager | yarn |
| HTTP | Native `fetch` (no Axios) |

## Project Structure

```
sure-snap/
├── public/
│   ├── favicon.svg
│   └── icons/                    # PWA icons (192, 512)
├── src/
│   ├── main.tsx                  # Entry: providers wrapping <App />
│   ├── App.tsx                   # Layout: Header + CaptureForm or SetupBanner
│   ├── api/
│   │   └── client.ts             # fetch wrapper, reads settings for base URL + API key
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── Header.tsx            # App title + gear icon → opens SettingsSheet
│   │   ├── CaptureForm.tsx       # Orchestrates the full capture flow
│   │   ├── AccountSelector.tsx   # Toggle group of enabled accounts
│   │   ├── AmountInput.tsx       # Large numeric input + currency badge
│   │   ├── CategoryPicker.tsx    # Collapsible grid of category buttons
│   │   ├── DescriptionInput.tsx  # Text input for transaction name
│   │   ├── SuggestionChips.tsx   # Recent matching transaction names
│   │   ├── SettingsSheet.tsx     # Sheet drawer with all settings
│   │   └── SetupBanner.tsx       # First-time setup prompt
│   ├── hooks/
│   │   ├── useAccounts.ts        # Query: GET /api/v1/accounts
│   │   ├── useCategories.ts      # Query: GET /api/v1/categories
│   │   ├── useTransactions.ts    # Query: GET /api/v1/transactions (recent)
│   │   └── useCreateTransaction.ts # Mutation with offline retry
│   ├── context/
│   │   └── SettingsContext.tsx    # backendUrl, apiToken, language, enabledAccountIds
│   ├── i18n/
│   │   ├── index.ts              # i18next configuration
│   │   ├── en.json
│   │   └── ar.json
│   ├── types/
│   │   └── index.ts              # Account, Category, Transaction, API response types
│   └── lib/
│       ├── queryClient.ts        # TanStack Query client + IndexedDB persister setup
│       └── utils.ts              # shadcn cn() utility
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json               # shadcn config
├── package.json
└── CLAUDE.md
```

## Screens

Two views, no router:

1. **Capture Screen** — the main and only screen. Always visible.
2. **Settings Sheet** — slides in as a shadcn Sheet overlay from the side. No navigation, just open/close.

## Offline-First Architecture

### Network Mode

All queries and mutations use `networkMode: 'offlineFirst'`. This always attempts the first request (which may succeed from the service worker cache), then pauses retries if offline. This is the correct mode for a PWA with a service worker — unlike `'online'` (won't attempt at all offline) or `'always'` (ignores network status).

### Data Flow

```
User submits transaction
        │
        ▼
useMutation fires (networkMode: 'offlineFirst')
        │
        ├─ onMutate: optimistic update → transaction appears in cache immediately
        │
        ├─ Online?  → POST /api/v1/transactions → onSuccess: confirm in cache
        │
        └─ Offline? → mutation paused (status: 'success', fetchStatus: 'paused')
                     → mutation state persisted to IndexedDB
                     → on reconnect: resumePausedMutations() fires
                     → syncs queued transactions in order
```

### Persistence Layers

| Data | Storage | Mechanism |
|---|---|---|
| Query cache (accounts, categories, transactions) | IndexedDB | `PersistQueryClientProvider` + `idb-keyval` |
| Pending mutations (offline transactions) | IndexedDB | TanStack mutation persistence (same persister) |
| Settings (URL, token, language, enabled accounts) | localStorage | React Context with `useEffect` sync |

### TanStack Query Client Configuration

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      gcTime: Infinity,           // never garbage collect — we need offline access
      staleTime: 5 * 60 * 1000,  // 5 min default for reference data
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})
```

**Why `gcTime: Infinity`**: The persister saves the entire query cache to IndexedDB. If `gcTime` is shorter than the persister's `maxAge`, data gets garbage collected from memory before it can be restored on next load. Setting it to `Infinity` ensures cached data survives app restarts.

### IndexedDB Persister (via `idb-keyval`)

```ts
import { get, set, del } from 'idb-keyval'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get(key),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
  throttleTime: 1000, // don't write more than once per second
})
```

IndexedDB over localStorage because: larger storage limits, non-blocking async reads/writes, and significantly better performance with larger datasets (transaction history cache).

### Mutation Persistence with `setMutationDefaults`

When mutations are persisted to IndexedDB, **only the state is saved — functions can't be serialized**. After a page reload, resumed mutations need their `mutationFn` re-attached. This is done via `setMutationDefaults`:

```ts
// Register BEFORE PersistQueryClientProvider renders
queryClient.setMutationDefaults(['transactions', 'create'], {
  mutationFn: (variables) => apiClient.createTransaction(variables),
})
```

Without this, `resumePausedMutations()` throws "No mutationFn found" after page reload.

### App Bootstrap Sequence

```ts
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister, maxAge: 7 * 24 * 60 * 60 * 1000 }} // 7 days
  onSuccess={() => {
    // Cache restored from IndexedDB → resume any queued offline mutations
    queryClient.resumePausedMutations().then(() => {
      queryClient.invalidateQueries()
    })
  }}
>
```

1. App loads → `PersistQueryClientProvider` restores query cache from IndexedDB
2. `onSuccess` fires → `resumePausedMutations()` replays any offline transactions
3. After mutations complete → `invalidateQueries()` refetches fresh data

### Mutation Scoping

Mutations use `scope.id` to ensure serial execution. Without scoping, multiple offline submissions could race when connectivity returns:

```ts
useMutation({
  mutationKey: ['transactions', 'create'],
  scope: { id: 'create-transaction' },
  // ...
})
```

All mutations with the same `scope.id` execute in order — subsequent ones start in `isPaused: true` until prior ones complete.

### Query Configuration by Type

| Query | `staleTime` | Notes |
|---|---|---|
| `useAccounts` | 5 min | Reference data, rarely changes |
| `useCategories` | 5 min | Reference data, rarely changes |
| `useTransactions` | 1 min | Want fresher data for suggestions |

### Optimistic Updates Pattern

```ts
// useCreateTransaction mutation
onMutate: async (newTransaction) => {
  await queryClient.cancelQueries({ queryKey: ['transactions'] })
  const previous = queryClient.getQueryData(['transactions'])
  queryClient.setQueryData(['transactions'], (old) => [newTransaction, ...old])
  return { previous }
},
onError: (_err, _vars, context) => {
  queryClient.setQueryData(['transactions'], context.previous) // rollback
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['transactions'] })
},
```

**Important**: `onSuccess` callbacks won't fire while offline. UI side effects (like clearing the form, showing a toast) should happen in `onMutate` for the offline case, not `onSuccess`.

### Status vs FetchStatus

TanStack Query separates data state from network state. Both must be used for correct offline UI:

| `status` | `fetchStatus` | UI meaning |
|---|---|---|
| `success` | `idle` | Data loaded, all synced |
| `success` | `fetching` | Showing cached data, refreshing in background |
| `success` | `paused` | Showing cached data, offline (can't refresh) |
| `pending` | `paused` | No cached data and offline — show empty/placeholder |

Use this to show a "pending sync" indicator when `fetchStatus === 'paused'` and there are unsynced mutations.

### PWA Service Worker (Workbox)

The service worker only caches **static assets** (app shell). TanStack Query owns all API data caching via its IndexedDB persister — no need for a second cache layer for API responses.

| Route Pattern | Strategy | Reason |
|---|---|---|
| Static assets (JS, CSS, HTML) | CacheFirst | Immutable build outputs, makes the app load offline |
| PWA icons / fonts | CacheFirst | Static resources |

API requests (`/api/v1/*`) are **not** cached by the service worker. TanStack Query handles this entirely: persisted cache in IndexedDB is restored on app start, and `networkMode: 'offlineFirst'` ensures queries return cached data when offline.

## API Client

`src/api/client.ts` — thin `fetch` wrapper:

- Reads `backendUrl` and `apiToken` from SettingsContext
- Sets `X-Api-Key` header on every request
- Returns typed JSON responses
- Throws on non-2xx status for TanStack Query error handling
- No external HTTP library needed

## Settings Context

```ts
interface Settings {
  backendUrl: string          // e.g. "https://app.sure.am"
  apiToken: string            // X-Api-Key value
  language: 'en' | 'ar'
  enabledAccountIds: string[] // accounts visible in AccountSelector
}

// Derived
isConfigured: boolean         // backendUrl && apiToken both non-empty
```

- Persisted to localStorage on every change
- Loaded from localStorage on app init
- When `!isConfigured`, the app shows SetupBanner instead of CaptureForm

## i18n

- **i18next** with `react-i18next` `useTranslation()` hook
- Flat key namespace: `"capture.amount"`, `"settings.backendUrl"`, etc.
- Language change sets `document.documentElement.dir` to `rtl` or `ltr`
- Tailwind v4 built-in RTL utilities (`rtl:` variant)

## Component Data Dependencies

```
App
├── SettingsContext.Provider          ← localStorage
│   ├── PersistQueryClientProvider    ← IndexedDB
│   │   ├── Header                   ← settings (gear icon)
│   │   ├── SetupBanner              ← settings.isConfigured
│   │   └── CaptureForm
│   │       ├── AccountSelector      ← useAccounts() + settings.enabledAccountIds
│   │       ├── AmountInput          ← selected account (for currency)
│   │       ├── CategoryPicker       ← useCategories()
│   │       ├── DescriptionInput     ← local state
│   │       ├── SuggestionChips      ← useTransactions() filtered
│   │       └── Submit Button        ← useCreateTransaction()
│   └── SettingsSheet
│       ├── Connection section       ← settings (URL, token)
│       ├── Accounts section         ← useAccounts() + settings.enabledAccountIds
│       └── Language section         ← settings.language
```

## Suggestion Algorithm

1. Read recent transactions from TanStack Query cache
2. Filter by selected `account_id` (if set)
3. Filter by selected `category_id` (if set)
4. If user has typed text in description, fuzzy-match against `name`
5. Group remaining by `name`, sort by frequency (most used first)
6. Return top 5 unique names as suggestion chips
