import { useCallback, useEffect, useState } from 'react'
import { getHistory, clearHistory, invalidateCache } from '@/lib/transactionHistory'
import type { TransactionHistoryEntry } from '@/lib/transactionHistory'

export function useTransactionHistory() {
  const [entries, setEntries] = useState<TransactionHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    invalidateCache()
    const data = await getHistory()
    setEntries([...data])
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const clear = useCallback(async () => {
    await clearHistory()
    setEntries([])
  }, [])

  return { entries, loading, refresh, clear }
}
