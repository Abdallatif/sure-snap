import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CaptureForm } from './components/CaptureForm'
import { Header } from './components/Header'
import { SetupBanner } from './components/SetupBanner'
import { SettingsSheet } from './components/SettingsSheet'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './components/ui/sheet'
import { useSettings } from './context/SettingsContext'

function App() {
  const { isConfigured } = useSettings()
  const { t } = useTranslation()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      {isConfigured ? (
        <main className="flex flex-1 flex-col p-4">
          <CaptureForm />
        </main>
      ) : (
        <SetupBanner onOpenSettings={() => setSettingsOpen(true)} />
      )}

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{t('settings.title')}</SheetTitle>
          </SheetHeader>
          <SettingsSheet />
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default App
