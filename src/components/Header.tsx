import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'

interface HeaderProps {
  onOpenSettings: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <h1 className="text-lg font-semibold">SureSnap</h1>
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
