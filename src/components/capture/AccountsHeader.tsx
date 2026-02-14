import { useTranslation } from 'react-i18next'
import { ArrowLeftRight } from 'lucide-react'
import { Toggle } from '../ui/toggle'

interface AccountsHeaderProps {
  transferMode: boolean
  onToggleTransfer: (pressed: boolean) => void
}

export function AccountsHeader({
  transferMode,
  onToggleTransfer,
}: AccountsHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium">
        {transferMode ? t('capture.transfer') : t('capture.accounts')}
      </label>
      <Toggle
        variant="outline"
        size="sm"
        pressed={transferMode}
        onPressedChange={onToggleTransfer}
        aria-label={t('capture.transfer')}
      >
        <ArrowLeftRight className="size-4" />
      </Toggle>
    </div>
  )
}
