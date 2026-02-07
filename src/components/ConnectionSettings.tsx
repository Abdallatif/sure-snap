import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useSettings } from '@/context/SettingsContext'
import { getAccounts } from '@/api/client'

export function ConnectionSettings() {
  const { t } = useTranslation()
  const { backendUrl, apiToken, updateSettings } = useSettings()

  const [showToken, setShowToken] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  async function handleTestConnection() {
    setTesting(true)
    setTestResult(null)
    try {
      await getAccounts({ backendUrl, apiToken })
      setTestResult('success')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="backend-url">{t('settings.backendUrl')}</Label>
        <Input
          id="backend-url"
          type="url"
          placeholder={t('settings.backendUrlPlaceholder')}
          value={backendUrl}
          onChange={(e) => {
            updateSettings({ backendUrl: e.target.value })
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
            value={apiToken}
            onChange={(e) => {
              updateSettings({ apiToken: e.target.value })
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
          disabled={!backendUrl.trim() || !apiToken.trim() || testing}
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
  )
}
