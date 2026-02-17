import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { LucideIcon } from '../LucideIcon'
import { cn } from '@/lib/utils'
import { useSettings } from '@/context/SettingsContext'
import { getAccountIcon } from '@/lib/accountIcons'
import type { AccountDetail } from '@/types'

interface AccountSelectorProps {
  accounts: AccountDetail[]
  enabledAccountIds: string[]
  selectedAccountId: string | null
  disabledAccountId?: string | null
  onSelect: (accountId: string) => void
}

export function AccountSelector({
  accounts,
  enabledAccountIds,
  selectedAccountId,
  disabledAccountId,
  onSelect,
}: AccountSelectorProps) {
  const { t } = useTranslation()
  const { accountIconsView, accountIcons } = useSettings()

  const enabledAccounts = accounts.filter((a) =>
    enabledAccountIds.includes(a.id),
  )

  if (enabledAccounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('capture.noAccounts')}
      </p>
    )
  }

  if (accountIconsView) {
    return (
      <div className="flex justify-center gap-2 overflow-x-auto pb-2">
        {enabledAccounts.map((account) => {
          const isSelected = account.id === selectedAccountId
          const isDisabled = account.id === disabledAccountId
          return (
            <Button
              key={account.id}
              variant="outline"
              disabled={isDisabled}
              onClick={() => onSelect(account.id)}
              className={cn(
                'relative size-12 shrink-0 rounded-full p-0',
                isSelected && 'border-primary bg-accent dark:border-primary',
                isDisabled && 'opacity-40',
              )}
            >
              <LucideIcon
                name={getAccountIcon(account, accountIcons)}
                className="size-6"
              />
              <Badge variant="secondary" className={cn("absolute -bottom-1.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 border-input text-[10px] px-1.5 py-0", isSelected && "border-primary dark:border-primary")}>
                {account.currency}
              </Badge>
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {enabledAccounts.map((account) => {
        const isDisabled = account.id === disabledAccountId
        return (
        <Button
          key={account.id}
          variant="outline"
          disabled={isDisabled}
          onClick={() => onSelect(account.id)}
          className={cn(
            'flex h-auto min-h-13 flex-col items-center justify-center gap-0.5 px-3 py-2',
            account.id === selectedAccountId &&
              'border-primary bg-accent text-accent-foreground dark:bg-accent dark:border-primary',
            isDisabled && 'opacity-40',
          )}
        >
          <span className="text-sm font-medium">{account.name}</span>
          <span className="text-xs text-muted-foreground">
            {account.currency}
          </span>
        </Button>
        )
      })}
    </div>
  )
}
