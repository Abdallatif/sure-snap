import { useQuery } from '@tanstack/react-query'
import { getAccounts } from '@/api/client'
import { useSettings } from '@/context/SettingsContext'

export function useAccounts() {
  const { backendUrl, apiToken, isConfigured } = useSettings()

  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccounts({ backendUrl, apiToken }),
    enabled: isConfigured,
    select: (data) => data.accounts,
  })
}
