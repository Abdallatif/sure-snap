import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from './components/Header'
import { SetupBanner } from './components/SetupBanner'
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
          {/* CaptureForm will go here in Phase 9 */}
        </main>
      ) : (
        <SetupBanner onOpenSettings={() => setSettingsOpen(true)} />
      )}

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{t('settings.title')}</SheetTitle>
          </SheetHeader>
          {/* SettingsSheet content will go here in Phase 8 */}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default App
