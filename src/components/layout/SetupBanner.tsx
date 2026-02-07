import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'

interface SetupBannerProps {
  onOpenSettings: () => void
}

export function SetupBanner({ onOpenSettings }: SetupBannerProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-muted-foreground">{t('setup.message')}</p>
      <Button onClick={onOpenSettings}>{t('setup.configure')}</Button>
    </div>
  )
}
