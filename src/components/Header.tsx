import { useMutationState } from '@tanstack/react-query'
import { Loader2, ServerOff, Settings, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useConnectionStatus } from '../hooks/useOnlineStatus'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface HeaderProps {
  onOpenSettings: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { t } = useTranslation()
  const status = useConnectionStatus()
  const pendingCount = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => mutation.state.status,
  }).length

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">SureSnap</h1>
        {status === 'offline' && (
          <Badge variant="outline" className="gap-1 text-xs text-amber-600">
            <WifiOff className="size-3" />
            {t('common.offline')}
          </Badge>
        )}
        {status === 'server-unreachable' && (
          <Badge variant="outline" className="gap-1 text-xs text-red-600">
            <ServerOff className="size-3" />
            {t('common.serverUnreachable')}
          </Badge>
        )}
        {pendingCount > 0 && (
          <Badge variant="outline" className="gap-1 text-xs text-blue-600">
            <Loader2 className="size-3 animate-spin" />
            {pendingCount}
          </Badge>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSettings}
        aria-label={t('settings.title')}
      >
        <Settings className="size-5" />
      </Button>
    </header>
  )
}
