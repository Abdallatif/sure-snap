import { useMutationState } from '@tanstack/react-query'
import { Loader2, Moon, ServerOff, Settings, Sun, SunMoon, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useConnectionStatus } from '../hooks/useOnlineStatus'
import { useTheme } from './theme-provider'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface HeaderProps {
  onOpenSettings: () => void
}

const themeOrder = ['light', 'dark', 'system'] as const
const themeIcons = { light: Sun, dark: Moon, system: SunMoon }
const themeLabels = {
  light: 'settings.themeLight',
  dark: 'settings.themeDark',
  system: 'settings.themeSystem',
} as const

export function Header({ onOpenSettings }: HeaderProps) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
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
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const next = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]
            setTheme(next)
          }}
          aria-label={t(themeLabels[theme])}
        >
          {(() => { const Icon = themeIcons[theme]; return <Icon className="size-5" /> })()}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          aria-label={t('settings.title')}
        >
          <Settings className="size-5" />
        </Button>
      </div>
    </header>
  )
}
