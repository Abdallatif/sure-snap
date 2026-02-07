import { useQuery } from '@tanstack/react-query'
import { getTags } from '@/api/client'
import { useSettings } from '@/context/SettingsContext'

export function useTags() {
  const { backendUrl, apiToken, isConfigured } = useSettings()

  return useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags({ backendUrl, apiToken }),
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000,
  })
}
