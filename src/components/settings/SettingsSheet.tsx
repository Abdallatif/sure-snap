import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { AccountsSettings } from './AccountsSettings'
import { ConnectionSettings } from './ConnectionSettings'
import { CurrencyPicker } from './CurrencyPicker'
import { LanguageSettings } from './LanguageSettings'
import { useSettings } from '@/context/SettingsContext'

export function SettingsSheet() {
  const { t } = useTranslation()
  const { currencies, showTags, showNotes, sortCategoriesByUsage, transactionsPerPage, accountIconsView, updateSettings } = useSettings()
  const [perPageDraft, setPerPageDraft] = useState(String(transactionsPerPage))

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
      <ConnectionSettings />
      <AccountsSettings />

      <section className="flex items-center justify-between">
        <Label htmlFor="account-icons-view">{t('settings.accountIconsView')}</Label>
        <Switch
          id="account-icons-view"
          checked={accountIconsView}
          onCheckedChange={(checked) => updateSettings({ accountIconsView: checked })}
        />
      </section>

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

      <section className="flex items-center justify-between">
        <Label htmlFor="show-notes">{t('settings.showNotes')}</Label>
        <Switch
          id="show-notes"
          checked={showNotes}
          onCheckedChange={(checked) => updateSettings({ showNotes: checked })}
        />
      </section>

      <section className="flex items-center justify-between">
        <Label htmlFor="sort-categories">{t('settings.sortCategoriesByUsage')}</Label>
        <Switch
          id="sort-categories"
          checked={sortCategoriesByUsage}
          onCheckedChange={(checked) => updateSettings({ sortCategoriesByUsage: checked })}
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="transactions-per-page">{t('settings.transactionsPerPage')}</Label>
          <Input
            id="transactions-per-page"
            type="number"
            min={10}
            max={500}
            value={perPageDraft}
            onChange={(e) => setPerPageDraft(e.target.value)}
            onBlur={() => {
              const val = Math.min(500, Math.max(10, parseInt(perPageDraft, 10) || transactionsPerPage))
              setPerPageDraft(String(val))
              if (val !== transactionsPerPage) updateSettings({ transactionsPerPage: val })
            }}
            className="w-20"
          />
        </div>
        <p className="text-xs text-muted-foreground">{t('settings.transactionsPerPageHint')}</p>
      </section>

      <LanguageSettings />
    </div>
  )
}
