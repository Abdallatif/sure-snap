import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { get, set, del } from 'idb-keyval'
import { createTransaction } from '@/api/client'
import type { CreateTransactionInput } from '@/types'

// --- Query Client ---

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      gcTime: Infinity,
      staleTime: 5 * 60 * 1000, // 5 min default
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})

// --- IndexedDB Persister ---

export const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get(key),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
  throttleTime: 1000,
})

// --- Mutation Defaults ---
// Functions can't be serialized to IndexedDB. After a page reload,
// resumed mutations need their mutationFn re-attached. We read the
// API config from localStorage so this works outside React context.

function getApiConfig() {
  try {
    const raw = localStorage.getItem('suresnap-settings')
    if (!raw) throw new Error('No settings')
    const settings = JSON.parse(raw)
    return {
      backendUrl: settings.backendUrl ?? '',
      apiToken: settings.apiToken ?? '',
    }
  } catch {
    return { backendUrl: '', apiToken: '' }
  }
}

queryClient.setMutationDefaults(['transactions', 'create'], {
  mutationFn: (input: CreateTransactionInput) =>
    createTransaction(getApiConfig(), input),
})
