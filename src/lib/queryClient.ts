import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { get, set, del } from 'idb-keyval'
import { createTransaction } from '@/api/client'
import { getApiConfig } from './onlineManager'
import type {
  CreateTransactionInput,
  Tag,
  TagDetail,
  Transaction,
  TransactionCollection,
} from '@/types'

// --- Query Client ---

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      gcTime: Infinity,
      staleTime: 5 * 60 * 1000, // 5 min default
    },
    mutations: {
      networkMode: 'online',
      gcTime: Infinity,
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

function resolveTagIds(tagIds: string[] | undefined): Tag[] {
  if (!tagIds?.length) return []
  const cached = queryClient.getQueryData<TagDetail[]>(['tags']) ?? []
  return tagIds.map((id) => {
    const tag = cached.find((t) => t.id === id)
    return { id, name: tag?.name ?? '', color: tag?.color ?? '' }
  })
}

// --- Mutation Defaults ---
// Functions can't be serialized to IndexedDB. After a page reload,
// resumed mutations need their mutationFn AND callbacks re-attached.
// Everything that should survive persistence must live here, not in
// the useMutation hook.

queryClient.setMutationDefaults(['transactions', 'create'], {
  mutationFn: (input: CreateTransactionInput) => {
    const config = getApiConfig()
    if (!config) throw new Error('API not configured')
    return createTransaction(config, input)
  },
  scope: { id: 'create-transaction' },
  retry: 3,

  onMutate: async (input: CreateTransactionInput) => {
    await queryClient.cancelQueries({ queryKey: ['transactions'] })

    const previous =
      queryClient.getQueryData<TransactionCollection>(['transactions'])

    queryClient.setQueryData<TransactionCollection>(['transactions'], (old) => {
      if (!old) return old

      const optimistic: Transaction = {
        id: `optimistic-${Date.now()}`,
        date: input.date,
        amount: String(input.amount),
        currency: input.currency ?? '',
        name: input.name,
        notes: input.notes ?? null,
        classification: input.nature ?? 'expense',
        account: { id: input.account_id, name: '', account_type: '' },
        category: input.category_id
          ? { id: input.category_id, name: '', classification: 'expense', color: '', icon: '' }
          : null,
        merchant: null,
        tags: resolveTagIds(input.tag_ids),
        transfer: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return {
        ...old,
        transactions: [optimistic, ...old.transactions],
      }
    })

    return { previous }
  },

  onError: (
    _err: Error,
    _vars: CreateTransactionInput,
    context: unknown,
  ) => {
    const ctx = context as { previous?: TransactionCollection }
    if (ctx?.previous) {
      queryClient.setQueryData(['transactions'], ctx.previous)
    }
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
  },
})
