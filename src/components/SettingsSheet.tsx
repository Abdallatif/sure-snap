import { useTranslation } from 'react-i18next'
import { Label } from './ui/label'
import { AccountsSettings } from './AccountsSettings'
import { ConnectionSettings } from './ConnectionSettings'
import { CurrencyPicker } from './CurrencyPicker'
import { LanguageSettings } from './LanguageSettings'
import { useSettings } from '@/context/SettingsContext'

export function SettingsSheet() {
  const { t } = useTranslation()
  const { currencies, updateSettings } = useSettings()

  return (
    <div className="flex flex-col gap-6 p-4">
      <ConnectionSettings />
      <AccountsSettings />

      <section className="flex flex-col gap-3">
        <Label>{t('settings.currencies')}</Label>
        <CurrencyPicker
          selected={currencies}
          onChange={(next) => updateSettings({ currencies: next })}
        />
      </section>

      <LanguageSettings />
    </div>
  )
}
