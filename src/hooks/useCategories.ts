import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/client'
import { useSettings } from '@/context/SettingsContext'

export function useCategories() {
  const { backendUrl, apiToken, isConfigured } = useSettings()

  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories({ backendUrl, apiToken }, { classification: 'expense' }),
    enabled: isConfigured,
    select: (data) => data.categories,
  })
}
