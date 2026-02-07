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
│   │   ├── Header.tsx            # App title + offline/sync badges + gear icon
│   │   ├── CaptureForm.tsx       # Orchestrates the full capture flow
│   │   ├── AccountSelector.tsx   # 2-column grid of enabled accounts (name + currency stacked)
│   │   ├── AmountInput.tsx       # Large numeric input + currency toggle buttons
│   │   ├── CategoryPicker.tsx    # Flat grid of categories, expanded by default
│   │   ├── DescriptionInput.tsx  # Text input for transaction name
│   │   ├── TagPicker.tsx         # Toggleable colored tag chips (multi-select)
│   │   ├── SuggestionChips.tsx   # Recent matching transaction names
│   │   ├── SettingsSheet.tsx     # Sheet drawer with all settings
│   │   └── SetupBanner.tsx       # First-time setup prompt
│   ├── hooks/
│   │   ├── useAccounts.ts        # Query: GET /api/v1/accounts
│   │   ├── useCategories.ts      # Query: GET /api/v1/categories
│   │   ├── useTransactions.ts    # Query: GET /api/v1/transactions (recent)
│   │   ├── useTags.ts             # Query: GET /api/v1/tags
│   │   ├── useCreateTransaction.ts # Mutation (key only — callbacks in setMutationDefaults)
│   │   └── useOnlineStatus.ts    # Subscribes to connectionStatus from onlineManager
│   ├── context/
│   │   └── SettingsContext.tsx    # backendUrl, apiToken, language, enabledAccountIds, currencies
│   ├── i18n/
│   │   ├── index.ts              # i18next configuration
│   │   ├── en.json
│   │   └── ar.json
│   ├── types/
│   │   └── index.ts              # Account, Category, Transaction, API response types
│   └── lib/
│       ├── onlineManager.ts      # Custom onlineManager (backend ping + connectionStatus store)
│       ├── queryClient.ts        # TanStack Query client + persister + mutation defaults
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

**Queries** use `networkMode: 'offlineFirst'` — always attempts the first request (returns cached data on failure), then pauses retries if offline. Good for serving stale data from the persistence layer.

**Mutations** use `networkMode: 'online'` — the mutation never fires when offline, instead immediately entering `isPaused: true`. This is the correct mode for a queue-and-sync pattern without a service worker intercepting API calls. The mutation is persisted to IndexedDB and fired when connectivity returns. Using `'offlineFirst'` for mutations would waste a request attempt against an unreachable endpoint.

### Data Flow

```
User submits transaction
        │
        ▼
useMutation created (networkMode: 'online')
        │
        ├─ onMutate: optimistic update → transaction appears in cache immediately
        │
        ├─ Online?  → POST /api/v1/transactions → onSettled: invalidate cache
        │
        └─ Offline? → mutation paused immediately (isPaused: true)
                     → mutation state persisted to IndexedDB
                     → form resets, user can submit more transactions
                     → on reconnect: mutations fire in order (scope serialization)
                     → syncs queued transactions sequentially
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
      networkMode: 'online',      // pause immediately when offline, fire when online
      gcTime: Infinity,           // don't GC paused mutations while user is offline
    },
  },
})
```

**Why `gcTime: Infinity` on both**: The persister saves the entire query cache and pending mutations to IndexedDB. If `gcTime` is shorter than the offline period, data or queued mutations get garbage collected before they can sync. Setting it to `Infinity` ensures everything survives.

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

When mutations are persisted to IndexedDB, **only the state is saved — all functions are lost**. This includes `mutationFn`, `onMutate`, `onError`, `onSettled`, and `scope`. After a page reload, resumed mutations need everything re-attached via `setMutationDefaults`:

```ts
// Register BEFORE PersistQueryClientProvider renders.
// ALL function-based options must live here — NOT in useMutation().
queryClient.setMutationDefaults(['transactions', 'create'], {
  mutationFn: (input) => {
    const config = getApiConfig()
    if (!config) throw new Error('API not configured')
    return createTransaction(config, input)
  },
  scope: { id: 'create-transaction' },
  retry: 3,
  onMutate: async (input) => { /* optimistic update */ },
  onError: (_err, _vars, context) => { /* rollback */ },
  onSettled: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }) },
})
```

The `useMutation` hook in components should **only reference the mutation key** — no inline `mutationFn` or callbacks, as those would shadow the defaults and be lost after rehydration:

```ts
// CORRECT — inherits everything from setMutationDefaults
useMutation({ mutationKey: ['transactions', 'create'] })

// WRONG — inline options override defaults, then vanish after persistence
useMutation({ mutationKey: ['transactions', 'create'], mutationFn: ..., onSettled: ... })
```

Without `setMutationDefaults`, `resumePausedMutations()` throws "No mutationFn found" after page reload. Without the callbacks in defaults, resumed mutations have no rollback on error and no query invalidation on settle.

### App Bootstrap Sequence

```ts
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    dehydrateOptions: {
      shouldDehydrateMutation: (mutation) =>
        mutation.state.isPaused || mutation.state.status === 'pending',
    },
  }}
  onSuccess={() => {
    queryClient.resumePausedMutations().then(() => {
      queryClient.invalidateQueries()
    })
  }}
>
```

**`shouldDehydrateMutation`**: By default, TanStack Query does **not** persist mutations (`() => false`). We opt in for paused and pending mutations only — not errored or completed ones, which would cause unnecessary replays.

1. App loads → `PersistQueryClientProvider` restores query cache + pending mutations from IndexedDB
2. `onSuccess` fires → `resumePausedMutations()` replays any offline transactions
3. After mutations complete → `invalidateQueries()` refetches fresh data

### Mutation Scoping

Mutations use `scope.id` (in `setMutationDefaults`) to ensure serial execution. Without scoping, multiple offline submissions could race when connectivity returns:

```ts
queryClient.setMutationDefaults(['transactions', 'create'], {
  scope: { id: 'create-transaction' },
  // ...
})
```

All mutations with the same `scope.id` execute in order — subsequent ones wait until prior ones complete.

### Query Configuration by Type

| Query | `staleTime` | Notes |
|---|---|---|
| `useAccounts` | 5 min | Reference data, rarely changes |
| `useCategories` | 5 min | Reference data, rarely changes |
| `useTags` | 5 min | Reference data, rarely changes |
| `useTransactions` | 1 min | Want fresher data for suggestions |

### Optimistic Updates Pattern

All callbacks live in `setMutationDefaults` (not in the `useMutation` hook) so they survive IndexedDB persistence:

```ts
queryClient.setMutationDefaults(['transactions', 'create'], {
  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey: ['transactions'] })
    const previous = queryClient.getQueryData(['transactions'])
    queryClient.setQueryData(['transactions'], (old) => ({
      ...old,
      transactions: [optimisticTransaction, ...old.transactions],
    }))
    return { previous }
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(['transactions'], context.previous) // rollback
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
  },
})
```

**Important**: With `networkMode: 'online'`, `onMutate` still fires immediately (even when offline) — it's the `mutationFn` that pauses. This means the optimistic update appears instantly, the form can reset, and the user can keep submitting. UI side effects (clearing the form, showing a toast) should happen in the component's `handleSubmit`, not in callbacks.

### Online Manager (Backend Reachability)

TanStack Query's default `onlineManager` only checks `navigator.onLine`, which misses the case where the network is up but the backend is down. We override it in `src/lib/onlineManager.ts` to ping the actual backend:

```ts
onlineManager.setEventListener((setOnline) => {
  // Combines navigator.onLine + periodic backend ping (GET /api/v1/accounts?per_page=1)
  // Pings every 30s, only when the tab is visible
  // Any HTTP response (even 4xx) = reachable; network error/timeout = unreachable
})
```

This gives us:
- **Mutations pause** when the backend is unreachable (not just when the browser is offline)
- **Mutations resume** automatically when the backend becomes reachable again
- The ping only runs when the tab is focused (no background battery drain)

A parallel `connectionStatus` subscribable exposes three states for the UI:

| Status | Meaning | Header badge |
|---|---|---|
| `'online'` | Network up + backend reachable | No badge |
| `'offline'` | `navigator.onLine` is false | Amber "Offline" badge with WifiOff icon |
| `'server-unreachable'` | Network up but backend ping failed | Red "Server unreachable" badge with ServerOff icon |

The `useConnectionStatus()` hook subscribes to this store via `useSyncExternalStore`.

### Pending Mutations Indicator

The Header uses `useMutationState({ filters: { status: 'pending' } })` to show a count of queued mutations with a spinning loader icon. This appears alongside the offline/server badges.

### CaptureForm Submit Button

The submit button uses `isPending && !isPaused` (not just `isPending`) to determine the disabled/loading state. When mutations are paused (queued offline), the button stays enabled so users can submit multiple transactions. The pending count in the header provides sync visibility.

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
  backendUrl: string              // e.g. "https://app.sure.am"
  apiToken: string                // X-Api-Key value
  language: 'en' | 'ar'
  enabledAccountIds: string[]     // accounts visible in AccountSelector
  lastUsedAccountId: string|null  // auto-set on submit, not shown in settings sheet
  currencies: string[]            // available currencies for the capture form (default: ['USD', 'EUR', 'ILS'])
  showTags: boolean               // show tag picker in capture form (default: false)
}

// Derived
isConfigured: boolean         // backendUrl && apiToken both non-empty
```

- Persisted to localStorage on every change
- Loaded from localStorage on app init
- When `!isConfigured`, the app shows SetupBanner instead of CaptureForm
- `lastUsedAccountId` is managed automatically (set on transaction submit, read by AccountSelector for pre-selection) — not exposed in the Settings Sheet

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
│   │   ├── Header                   ← useConnectionStatus() + useMutationState() + gear icon
│   │   ├── SetupBanner              ← settings.isConfigured
│   │   └── CaptureForm
│   │       ├── AccountSelector      ← useAccounts() + settings.enabledAccountIds (2-col grid)
│   │       ├── AmountInput          ← selected currency + settings.currencies (toggle buttons)
│   │       ├── CategoryPicker       ← useCategories() (flat grid, expanded by default)
│   │       ├── TagPicker            ← useTags() (toggleable colored chips, multi-select)
│   │       ├── DescriptionInput     ← local state
│   │       ├── SuggestionChips      ← useTransactions() filtered
│   │       └── Submit Button        ← useCreateTransaction()
│   └── SettingsSheet
│       ├── Connection section       ← settings (URL, token)
│       ├── Accounts section         ← useAccounts() + settings.enabledAccountIds
│       ├── Currencies section       ← settings.currencies (add/remove)
│       └── Language section         ← settings.language
```

## Suggestion Algorithm

1. Read recent transactions from TanStack Query cache
2. Filter by selected `account_id` (if set)
3. Filter by selected `category_id` (if set)
4. If user has typed text in description, fuzzy-match against `name`
5. Group remaining by `name`, sort by frequency (most used first)
6. Return top 5 unique names as suggestion chips
