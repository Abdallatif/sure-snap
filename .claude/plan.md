# SureSnap — Implementation Plan

References: [arch.md](./arch.md) | [prd.md](./prd.md) | [Sure API docs](./sure-docs/api/)

---

## Phase 1: Scaffold

**Goal**: Empty app that runs with all tooling configured.

**Steps**:
1. `yarn create vite sure-snap --template react-ts` (scaffold in place)
2. Install dependencies:
   - UI: `tailwindcss @tailwindcss/vite`, shadcn/ui (via `npx shadcn@latest init`)
   - Data: `@tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister idb-keyval`
   - i18n: `i18next react-i18next`
   - PWA: `vite-plugin-pwa`
3. Configure Tailwind v4 in `vite.config.ts`
4. Initialize shadcn/ui (`components.json`), add components: Button, Input, Sheet, ToggleGroup, Switch, Label, Alert, Badge
5. Set up `index.html` with viewport meta for mobile

**Files created**:
- `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `components.json`
- `index.html`, `src/main.tsx`, `src/App.tsx`
- `src/lib/utils.ts` (shadcn `cn()`)
- `src/components/ui/*` (shadcn primitives)

**Verify**: `yarn dev` opens a blank page with no errors.

---

## Phase 2: Types + API Client

**Goal**: Typed API layer that all hooks will use.

**Steps**:
1. Define TypeScript types from the [Sure API OpenAPI spec](./sure-docs/api/openapi.yaml):
   - `Account` (id, name, balance, currency, account_type)
   - `Category` (id, name, classification, color, icon, parent, subcategories_count)
   - `Transaction` (id, date, amount, currency, name, notes, classification, account, category, tags)
   - `PaginatedResponse<T>` wrapper
   - `CreateTransactionInput` (account_id, date, amount, name, nature, category_id)
2. Build the API client — a `fetch` wrapper that reads `backendUrl` and `apiToken` from function params (not context — keeps it pure). See [arch.md § API Client](./arch.md#api-client).

**Files created**:
- `src/types/index.ts`
- `src/api/client.ts`

**Verify**: Types compile. API client is importable with no runtime errors.

---

## Phase 3: Settings Context

**Goal**: App-wide settings persisted to localStorage. See [arch.md § Settings Context](./arch.md#settings-context) and [prd.md § F5, F6](./prd.md#f5-settings-sheet).

**Steps**:
1. Create `SettingsContext` with provider that reads/writes localStorage
2. Expose: `backendUrl`, `apiToken`, `language`, `enabledAccountIds`, `lastUsedAccountId`
3. Derive `isConfigured` (both URL and token non-empty)
4. On `language` change: set `document.documentElement.dir` and `document.documentElement.lang`

**Files created**:
- `src/context/SettingsContext.tsx`

**Verify**: Wrap App in provider, confirm settings persist across page reload via DevTools → Application → localStorage.

---

## Phase 4: TanStack Query + Persist

**Goal**: Query client with IndexedDB persistence and mutation defaults. See [arch.md § Offline-First Architecture](./arch.md#offline-first-architecture).

**Steps**:
1. Create query client with `networkMode: 'offlineFirst'`, `gcTime: Infinity`
2. Create IndexedDB persister via `idb-keyval` + `createAsyncStoragePersister`
3. Register `setMutationDefaults` for `['transactions', 'create']` with the `mutationFn` from the API client
4. Wire `PersistQueryClientProvider` into `src/main.tsx` with `onSuccess` → `resumePausedMutations()` → `invalidateQueries()`
5. Provider hierarchy: `SettingsContext.Provider` → `PersistQueryClientProvider` → `App`

**Files created**:
- `src/lib/queryClient.ts`

**Files modified**:
- `src/main.tsx` (provider wrapping)

**Verify**: Open DevTools → Application → IndexedDB. Confirm `idb-keyval` store exists after first load.

---

## Phase 5: Data Hooks

**Goal**: All API queries and the create mutation. See [arch.md § Query Configuration](./arch.md#query-configuration-by-type) and [arch.md § Optimistic Updates](./arch.md#optimistic-updates-pattern).

**Steps**:
1. `useAccounts` — `GET /api/v1/accounts`, `staleTime: 5min`, enabled only when `isConfigured`
2. `useCategories` — `GET /api/v1/categories?classification=expense`, `staleTime: 5min`, enabled only when `isConfigured`
3. `useTransactions` — `GET /api/v1/transactions?per_page=100`, `staleTime: 1min`, enabled only when `isConfigured`. Fetches recent transactions for suggestion algorithm.
4. `useCreateTransaction` — mutation with:
   - `mutationKey: ['transactions', 'create']`
   - `scope: { id: 'create-transaction' }` (serial execution)
   - `onMutate`: optimistic insert into transactions cache
   - `onError`: rollback
   - `onSettled`: invalidate transactions query

**Files created**:
- `src/hooks/useAccounts.ts`
- `src/hooks/useCategories.ts`
- `src/hooks/useTransactions.ts`
- `src/hooks/useCreateTransaction.ts`

**Verify**: Temporarily render hook data in App. Confirm accounts/categories load from API (with a test URL/token hardcoded). Confirm data persists in IndexedDB and survives page reload.

---

## Phase 6: i18n

**Goal**: English and Arabic translations with RTL. See [prd.md § F8](./prd.md#f8-internationalization-enar) and [arch.md § i18n](./arch.md#i18n).

**Steps**:
1. Initialize i18next with `react-i18next`, language detector from settings
2. Create translation files with flat keys:
   - `capture.*` (amount, category, description, submit, etc.)
   - `settings.*` (backendUrl, apiToken, language, accounts, testConnection, etc.)
   - `setup.*` (banner message, configure button)
   - `common.*` (save, cancel, success, error, offline, etc.)
3. Hook language changes to settings context → `i18next.changeLanguage()` + RTL toggle
4. Set up locale-aware number formatting (use `Intl.NumberFormat` with the active locale for amount display)

**Files created**:
- `src/i18n/index.ts`
- `src/i18n/en.json`
- `src/i18n/ar.json`

**Verify**: Switch language in code, confirm all strings change. Confirm `dir="rtl"` on `<html>` when Arabic.

---

## Phase 7: Layout + Header

**Goal**: App shell with header and gear icon. See [prd.md § F5.1](./prd.md#f5-settings-sheet).

**Steps**:
1. Build `Header` — app title ("SureSnap"), gear icon button on the right
2. Build `App.tsx` — renders Header + conditional SetupBanner or CaptureForm based on `isConfigured`
3. Manage settings sheet open/close state in App

**Files created**:
- `src/components/Header.tsx`
- `src/components/SetupBanner.tsx`

**Files modified**:
- `src/App.tsx`

**Verify**: App shows header with gear icon. When no settings, shows setup banner. Gear icon opens empty sheet.

---

## Phase 8: Settings Sheet

**Goal**: Full settings panel. See [prd.md § F5](./prd.md#f5-settings-sheet).

**Steps**:
1. **Connection section**: Backend URL input + API token input (masked with show/hide toggle)
2. **Test Connection button**: calls `GET /api/v1/accounts` with the entered URL/token. Shows success (green) or failure (red) feedback.
3. **Accounts section**: renders accounts from `useAccounts()`, each with a Switch toggle. Toggling updates `enabledAccountIds` in settings. Only shown after successful connection.
4. **Language section**: toggle between EN/AR

**Files created**:
- `src/components/SettingsSheet.tsx`

**Verify**: Enter URL + token → test connection → see accounts list → enable some → close sheet → settings persist on reload.

---

## Phase 9: Capture Form

**Goal**: The main capture UI. See [prd.md § F1–F4](./prd.md#f1-quick-transaction-capture).

### 9a: AccountSelector
- ToggleGroup of enabled accounts (from settings + useAccounts data)
- Shows name + currency (e.g. "Cash · ILS")
- Pre-selects `lastUsedAccountId` from settings
- See [prd.md § F2](./prd.md#f2-account-selector)

### 9b: AmountInput
- Large numeric input with `inputMode="decimal"`
- Currency badge based on selected account
- Auto-focuses on mount
- See [prd.md § F1.6](./prd.md#f1-quick-transaction-capture)

### 9c: CategoryPicker
- **Collapsed**: shows selected category chip (icon + name) or "Select category" placeholder
- **Expanded**: 2-column scrollable grid of root expense categories
- Tapping a root with subcategories → shows subcategories + back button
- Tapping a leaf → selects and collapses
- See [prd.md § F3](./prd.md#f3-category-picker)

### 9d: DescriptionInput + SuggestionChips
- Text input for transaction name
- Below: up to 5 suggestion chips from `useTransactions()` cache
- Algorithm: filter by account → filter by category → fuzzy match typed text → group by name → sort by frequency → top 5
- Tapping chip fills description
- See [prd.md § F4](./prd.md#f4-suggestion-chips) and [arch.md § Suggestion Algorithm](./arch.md#suggestion-algorithm)

### 9e: Submit
- Button enabled when account + amount + category are set
- Calls `useCreateTransaction` mutation
- On submit: clear form (in `onMutate` for offline case), show brief success toast, save `lastUsedAccountId`
- Auto-set `date` to today, `nature` to `expense`

**Files created**:
- `src/components/CaptureForm.tsx`
- `src/components/AccountSelector.tsx`
- `src/components/AmountInput.tsx`
- `src/components/CategoryPicker.tsx`
- `src/components/DescriptionInput.tsx`
- `src/components/SuggestionChips.tsx`

**Verify**: Full flow — select account → enter amount → pick category → type/pick description → submit. Transaction appears in Sure. Form clears. Suggestions update.

---

## Phase 10: Offline UX

**Goal**: Visual indicators for offline state and pending sync. See [prd.md § F7](./prd.md#f7-offline-first-sync).

**Steps**:
1. Add a sync status indicator (small badge/dot in header) when there are pending mutations
2. Use `useMutationState` to count pending/paused mutations
3. Show "offline" indicator when `navigator.onLine === false`
4. Test: go offline in DevTools → submit transaction → see pending indicator → go online → indicator clears

**Files modified**:
- `src/components/Header.tsx` (sync indicator)

**Verify**: Full offline round-trip — offline submit → pending indicator → reconnect → syncs → indicator gone → transaction in Sure.

---

## Phase 11: PWA

**Goal**: Installable PWA. See [prd.md § F9](./prd.md#f9-pwa-installability).

**Steps**:
1. Configure `vite-plugin-pwa` in `vite.config.ts`:
   - `registerType: 'autoUpdate'`
   - Manifest: name, short_name, icons (192 + 512), theme_color, background_color, `display: 'standalone'`
   - Workbox: CacheFirst for static assets only (no API caching — see [arch.md § PWA Service Worker](./arch.md#pwa-service-worker-workbox))
2. Create PWA icons (192x192 + 512x512) in `public/icons/`
3. Add `<meta name="theme-color">` to `index.html`

**Files modified**:
- `vite.config.ts`
- `index.html`

**Files created**:
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`

**Verify**: `yarn build && yarn preview` → Lighthouse PWA audit passes → install prompt appears → installed app opens standalone.

---

## Phase 12: Polish

**Steps**:
1. Loading skeletons for accounts/categories while fetching
2. Error toasts for failed API calls
3. Success toast on transaction submit (brief, non-blocking)
4. Mobile touch optimizations (tap targets ≥ 44px, no hover-only states)
5. Test on iOS Safari + Android Chrome

**Verify**: Full end-to-end on mobile device or emulator. All PRD acceptance criteria pass.
