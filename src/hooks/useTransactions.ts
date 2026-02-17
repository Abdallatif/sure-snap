import { useQuery } from '@tanstack/react-query'
import { getTransactions } from '@/api/client'
import { useSettings } from '@/context/SettingsContext'

export function useTransactions() {
  const { backendUrl, apiToken, isConfigured, transactionsPerPage } = useSettings()

  return useQuery({
    queryKey: ['transactions', transactionsPerPage],
    queryFn: () => getTransactions({ backendUrl, apiToken }, { per_page: transactionsPerPage }),
    enabled: isConfigured,
    staleTime: 60 * 1000, // 1 min — fresher data for suggestion algorithm
    select: (data) => data.transactions,
  })
}
