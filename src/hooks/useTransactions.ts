import { useQuery } from '@tanstack/react-query'
import { getTransactions } from '@/api/client'
import { useSettings } from '@/context/SettingsContext'

export function useTransactions() {
  const { backendUrl, apiToken, isConfigured } = useSettings()

  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => getTransactions({ backendUrl, apiToken }, { per_page: 100 }),
    enabled: isConfigured,
    staleTime: 60 * 1000, // 1 min — fresher data for suggestion algorithm
    select: (data) => data.transactions,
  })
}
