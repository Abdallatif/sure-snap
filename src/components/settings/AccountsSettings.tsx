import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { LucideIcon } from '../LucideIcon'
import { useSettings } from '@/context/SettingsContext'
import { useAccounts } from '@/hooks/useAccounts'
import { getAccountIcon, ACCOUNT_ICON_OPTIONS } from '@/lib/accountIcons'

export function AccountsSettings() {
  const { t } = useTranslation()
  const { isConfigured, enabledAccountIds, accountIcons, updateSettings } = useSettings()
  const { data: accounts } = useAccounts()
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)

  if (!isConfigured || !accounts || accounts.length === 0) return null

  function toggleAccount(id: string, enabled: boolean) {
    const next = enabled
      ? [...enabledAccountIds, id]
      : enabledAccountIds.filter((a) => a !== id)
    updateSettings({ enabledAccountIds: next })
  }

  function setAccountIcon(accountId: string, iconName: string) {
    updateSettings({ accountIcons: { ...accountIcons, [accountId]: iconName } })
    setOpenPopoverId(null)
  }

  return (
    <section className="flex flex-col gap-3">
      <Label>{t('settings.accounts')}</Label>
      <div className="flex max-h-50 flex-col gap-2 overflow-y-auto">
        {accounts.map((account) => {
          const iconName = getAccountIcon(account, accountIcons)
          return (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm" dir="auto">
                <Popover
                  open={openPopoverId === account.id}
                  onOpenChange={(open) => setOpenPopoverId(open ? account.id : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                    >
                      <LucideIcon name={iconName} className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="grid grid-cols-5 gap-1">
                      {ACCOUNT_ICON_OPTIONS.map((icon) => (
                        <Button
                          key={icon}
                          variant={icon === iconName ? 'secondary' : 'ghost'}
                          size="icon"
                          className="size-9"
                          onClick={(e) => {
                            e.preventDefault()
                            setAccountIcon(account.id, icon)
                          }}
                        >
                          <LucideIcon name={icon} className="size-4" />
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {account.name}
                <span className="ms-1.5 text-xs text-muted-foreground">
                  {account.currency}
                </span>
              </span>
              <Switch
                checked={enabledAccountIds.includes(account.id)}
                onCheckedChange={(checked) => toggleAccount(account.id, !!checked)}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
