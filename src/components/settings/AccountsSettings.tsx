import { useTranslation } from 'react-i18next'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { useSettings } from '@/context/SettingsContext'
import { useAccounts } from '@/hooks/useAccounts'

export function AccountsSettings() {
  const { t } = useTranslation()
  const { isConfigured, enabledAccountIds, updateSettings } = useSettings()
  const { data: accounts } = useAccounts()

  if (!isConfigured || !accounts || accounts.length === 0) return null

  function toggleAccount(id: string, enabled: boolean) {
    const next = enabled
      ? [...enabledAccountIds, id]
      : enabledAccountIds.filter((a) => a !== id)
    updateSettings({ enabledAccountIds: next })
  }

  return (
    <section className="flex flex-col gap-3">
      <Label>{t('settings.accounts')}</Label>
      <div className="flex max-h-50 flex-col gap-2 overflow-y-auto">
        {accounts.map((account) => (
          <label
            key={account.id}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <span className="text-sm" dir="auto">
              {account.name}
              <span className="ms-1.5 text-xs text-muted-foreground">
                {account.currency}
              </span>
            </span>
            <Switch
              checked={enabledAccountIds.includes(account.id)}
              onCheckedChange={(checked) => toggleAccount(account.id, !!checked)}
            />
          </label>
        ))}
      </div>
    </section>
  )
}
