import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { useSettings } from '@/context/SettingsContext'

export function LanguageSettings() {
  const { t } = useTranslation()
  const { language, updateSettings } = useSettings()

  return (
    <section className="flex flex-col gap-3">
      <Label>{t('settings.language')}</Label>
      <div className="flex gap-2">
        <Button
          variant={language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSettings({ language: 'en' })}
        >
          English
        </Button>
        <Button
          variant={language === 'ar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSettings({ language: 'ar' })}
        >
          العربية
        </Button>
      </div>
    </section>
  )
}
