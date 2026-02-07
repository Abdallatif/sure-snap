import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { useSettings } from '@/context/SettingsContext'
import { useAccounts } from '@/hooks/useAccounts'
import { getAccounts } from '@/api/client'

export function SettingsSheet() {
  const { t } = useTranslation()
  const settings = useSettings()
  const { data: accounts } = useAccounts()

  const [showToken, setShowToken] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  async function handleTestConnection() {
    setTesting(true)
    setTestResult(null)
    try {
      await getAccounts({
        backendUrl: settings.backendUrl,
        apiToken: settings.apiToken,
      })
      setTestResult('success')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  function toggleAccount(id: string, enabled: boolean) {
    const current = settings.enabledAccountIds
    const next = enabled
      ? [...current, id]
      : current.filter((a) => a !== id)
    settings.updateSettings({ enabledAccountIds: next })
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Connection */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="backend-url">{t('settings.backendUrl')}</Label>
          <Input
            id="backend-url"
            type="url"
            placeholder={t('settings.backendUrlPlaceholder')}
            value={settings.backendUrl}
            onChange={(e) => {
              settings.updateSettings({ backendUrl: e.target.value })
              setTestResult(null)
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="api-token">{t('settings.apiToken')}</Label>
          <div className="relative">
            <Input
              id="api-token"
              type={showToken ? 'text' : 'password'}
              placeholder={t('settings.apiTokenPlaceholder')}
              value={settings.apiToken}
              onChange={(e) => {
                settings.updateSettings({ apiToken: e.target.value })
                setTestResult(null)
              }}
              className="pe-16"
            />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="absolute end-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowToken((v) => !v)}
            >
              {showToken ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              <span className="sr-only">
                {showToken ? t('settings.hideToken') : t('settings.showToken')}
              </span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!settings.backendUrl.trim() || !settings.apiToken.trim() || testing}
            onClick={handleTestConnection}
          >
            {testing && <Loader2 className="animate-spin" />}
            {t('settings.testConnection')}
          </Button>
          {testResult === 'success' && (
            <span className="text-sm text-green-600 dark:text-green-400">
              {t('settings.connectionSuccess')}
            </span>
          )}
          {testResult === 'error' && (
            <span className="text-sm text-destructive">
              {t('settings.connectionFailed')}
            </span>
          )}
        </div>
      </section>

      {/* Accounts */}
      {settings.isConfigured && accounts && accounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <Label>{t('settings.accounts')}</Label>
          <div className="flex max-h-[200px] flex-col gap-2 overflow-y-auto">
            {accounts.map((account) => (
              <label
                key={account.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm" dir="auto">
                  {account.name}
                  <span className="text-muted-foreground ms-1.5 text-xs">
                    {account.currency}
                  </span>
                </span>
                <Switch
                  checked={settings.enabledAccountIds.includes(account.id)}
                  onCheckedChange={(checked) => toggleAccount(account.id, !!checked)}
                />
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Language */}
      <section className="flex flex-col gap-3">
        <Label>{t('settings.language')}</Label>
        <div className="flex gap-2">
          <Button
            variant={settings.language === 'en' ? 'default' : 'outline'}
            size="sm"
            onClick={() => settings.updateSettings({ language: 'en' })}
          >
            English
          </Button>
          <Button
            variant={settings.language === 'ar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => settings.updateSettings({ language: 'ar' })}
          >
            العربية
          </Button>
        </div>
      </section>
    </div>
  )
}
