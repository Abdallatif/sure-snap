import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import type { AccountDetail } from '@/types'

interface AccountSelectorProps {
  accounts: AccountDetail[]
  enabledAccountIds: string[]
  selectedAccountId: string | null
  onSelect: (accountId: string) => void
}

export function AccountSelector({
  accounts,
  enabledAccountIds,
  selectedAccountId,
  onSelect,
}: AccountSelectorProps) {
  const { t } = useTranslation()

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

  return (
    <div className="grid grid-cols-2 gap-2">
      {enabledAccounts.map((account) => (
        <Button
          key={account.id}
          variant="outline"
          onClick={() => onSelect(account.id)}
          className={cn(
            'flex h-auto min-h-13 flex-col items-center justify-center gap-0.5 px-3 py-2',
            account.id === selectedAccountId &&
              'border-primary bg-accent text-accent-foreground dark:bg-accent dark:border-primary',
          )}
        >
          <span className="text-sm font-medium">{account.name}</span>
          <span className="text-xs text-muted-foreground">
            {account.currency}
          </span>
        </Button>
      ))}
    </div>
  )
}
