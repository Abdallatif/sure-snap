import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'sileo'
import { CaptureForm } from './components/capture/CaptureForm'
import { TransferForm } from './components/capture/TransferForm'
import { Header } from './components/layout/Header'
import { SetupBanner } from './components/layout/SetupBanner'
import { SettingsSheet } from './components/settings/SettingsSheet'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './components/ui/sheet'
import { useTheme } from './components/theme-provider'
import { useSettings } from './context/SettingsContext'

function App() {
  const { isConfigured } = useSettings()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [transferMode, setTransferMode] = useState(false)

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      {isConfigured ? (
        <main className="flex flex-1 flex-col p-4">
          {transferMode ? (
            <TransferForm onToggleTransfer={setTransferMode} />
          ) : (
            <CaptureForm onToggleTransfer={setTransferMode} />
          )}
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

      <Toaster
        position="top-center"
        offset={{ top: 8 }}
        options={{
          duration: 3000,
          fill: !isDark ? '#171717' : '#FFFFFF',
          styles: !isDark
            ? { title: '!text-gray-100', description: '!text-gray-400' }
            : { description: '!text-gray-500' },
        }}
      />
    </div>
  )
}

export default App
