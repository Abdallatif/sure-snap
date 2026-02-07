import { useTranslation } from 'react-i18next'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { AccountsSettings } from './AccountsSettings'
import { ConnectionSettings } from './ConnectionSettings'
import { CurrencyPicker } from './CurrencyPicker'
import { LanguageSettings } from './LanguageSettings'
import { useSettings } from '@/context/SettingsContext'

export function SettingsSheet() {
  const { t } = useTranslation()
  const { currencies, showTags, updateSettings } = useSettings()

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
      <ConnectionSettings />
      <AccountsSettings />

      <section className="flex flex-col gap-3">
        <Label>{t('settings.currencies')}</Label>
        <CurrencyPicker
          selected={currencies}
          onChange={(next) => updateSettings({ currencies: next })}
        />
      </section>

      <section className="flex items-center justify-between">
        <Label htmlFor="show-tags">{t('settings.showTags')}</Label>
        <Switch
          id="show-tags"
          checked={showTags}
          onCheckedChange={(checked) => updateSettings({ showTags: checked })}
        />
      </section>

      <LanguageSettings />
    </div>
  )
}
