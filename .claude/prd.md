# SureSnap — Product Requirements Document

## Overview

SureSnap is a PWA companion app for [Sure](https://github.com/we-promise/sure) that enables quick transaction capture with offline support. It is a capture tool, not a full finance app — optimized for speed-to-entry as users go about their day.

## Target User

A Sure user who wants to log expenses on the go without opening the full Sure app. They open SureSnap, tap a few things, and they're done in under 10 seconds.

---

## Features

### F1: Quick Transaction Capture

The core feature. A single screen that captures a transaction with minimal taps.

**Acceptance Criteria:**
1. The capture screen is the first and only screen the user sees on launch
2. The form includes: account selector, amount input, category picker, description input
3. Date is auto-set to the current date (not shown to user)
4. Transaction nature defaults to `expense`
5. Submitting clears the form and shows a brief success confirmation
6. The amount input auto-focuses on launch for immediate entry
7. All fields except description are required before submit is enabled

### F2: Account Selector

A row of toggle buttons showing the user's enabled accounts.

**Acceptance Criteria:**
1. Displays only accounts the user has enabled in settings
2. Each button shows the account name and currency (e.g. "Cash · ILS")
3. Exactly one account is selected at a time
4. The previously used account is pre-selected on next launch
5. Changing the account updates the currency shown in the amount input

### F3: Category Picker

A collapsible grid of category buttons with 2-level hierarchy.

**Acceptance Criteria:**
1. **Collapsed state**: shows the selected category as a compact chip (icon + name). If no category is selected, shows a "Select category" placeholder
2. **Expanded state**: tapping the collapsed chip expands into a scrollable 2-column grid of root categories
3. Tapping a root category that has subcategories shows its subcategories in the grid, with a back button to return to roots
4. Tapping a root category with no subcategories (or a subcategory) selects it and collapses the picker
5. Categories are fetched from the Sure API and cached offline
6. Only expense categories are shown (classification = `expense`)

### F4: Suggestion Chips

Up to 5 chips shown below the description input, suggesting transaction names based on history.

**Acceptance Criteria:**
1. Suggestions are derived from cached recent transactions (no extra API call)
2. Filtered by the currently selected account (if set)
3. Further filtered by the currently selected category (if set)
4. If the user has typed text in the description, suggestions are filtered to fuzzy-match that text
5. Sorted by frequency (most used names first), top 5 unique names shown
6. Tapping a chip fills the description input with that name

### F5: Settings Sheet

A side-panel (shadcn Sheet) for configuration, opened via a gear icon in the header.

**Acceptance Criteria:**
1. Opens from the header gear icon as a slide-in sheet
2. **Connection section**: Backend URL text input + API token text input
3. **Test Connection button**: calls GET /api/v1/accounts to validate URL + token. Shows success/failure feedback
4. **Accounts section**: lists all accounts fetched from the API, each with a toggle switch to enable/disable visibility in the capture screen
5. **Language section**: toggle between English and Arabic
6. Changing language immediately switches the UI language and text direction (LTR/RTL)
7. All settings persist across app restarts (localStorage)
8. The sheet closes on outside tap or explicit close button
9. API token input is masked by default with a show/hide toggle

### F6: First-Time Setup

Guide the user to configure the app on first launch.

**Acceptance Criteria:**
1. When no backend URL or API token is configured, the capture form is replaced with a setup banner
2. The banner has a clear message and a button that opens the settings sheet
3. After configuring and testing the connection, the capture form becomes available
4. The setup banner does not appear again once configured
5. If the user clears their settings, the banner returns

### F7: Offline-First Sync

Transactions are captured regardless of connectivity and synced when online.

**Acceptance Criteria:**
1. Submitting a transaction while online sends it immediately to the Sure API
2. Submitting while offline stores the transaction locally
3. Offline transactions sync automatically when connectivity returns (no user action)
4. The user sees a visual indicator when there are pending unsynced transactions
5. Optimistic update: newly submitted transactions appear in the suggestions list immediately, even before sync
6. Failed syncs retry automatically with exponential backoff
7. Reference data (accounts, categories) remains available offline from cache

### F8: Internationalization (EN/AR)

Full English and Arabic support with RTL layout.

**Acceptance Criteria:**
1. All user-facing strings are externalized (no hardcoded text)
2. English is the default language
3. Arabic switches the entire layout to RTL
4. The language setting persists across sessions
5. Number formatting respects the selected locale

### F9: PWA Installability

The app is installable as a standalone PWA on mobile devices.

**Acceptance Criteria:**
1. The app includes a valid web app manifest with name, icons, theme color, and `display: standalone`
2. A service worker caches static assets for offline use (API data is cached by TanStack Query in IndexedDB)
3. The app passes Lighthouse PWA audit
4. On supported browsers, the install prompt is shown
5. When installed, the app opens full-screen without browser chrome

---

## Out of Scope

- Receipt camera capture (deferred to future version)
- Transaction editing or deletion (use Sure for that)
- Transaction history / list view
- Multiple users or family member switching
- Merchant selection (not needed for quick capture)
- Income transactions (this is an expense capture tool)
- Budget tracking or analytics
- Tags (can be added later)

## Technical Constraints

- Must work on latest Safari (iOS) and Chrome (Android)
- Bundle size should stay minimal — this is a capture tool that needs to load fast
- No server-side component — purely a static PWA that talks to the Sure API
