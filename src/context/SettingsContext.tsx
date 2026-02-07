import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import i18n from '../i18n'

export interface Settings {
  backendUrl: string
  apiToken: string
  language: 'en' | 'ar'
  enabledAccountIds: string[]
  lastUsedAccountId: string | null
  currencies: string[]
}

interface SettingsContextValue extends Settings {
  isConfigured: boolean
  updateSettings: (patch: Partial<Settings>) => void
}

const STORAGE_KEY = 'suresnap-settings'

const defaultSettings: Settings = {
  backendUrl: '',
  apiToken: '',
  language: 'en',
  enabledAccountIds: [],
  lastUsedAccountId: null,
  currencies: ['USD', 'EUR', 'ILS'],
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw)
    return { ...defaultSettings, ...parsed }
  } catch {
    return defaultSettings
  }
}

function persistSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

function applyLanguage(lang: 'en' | 'ar') {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lang
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  // Apply language on mount and when it changes
  useEffect(() => {
    applyLanguage(settings.language)
    i18n.changeLanguage(settings.language)
  }, [settings.language])

  // Persist to localStorage on every change
  useEffect(() => {
    persistSettings(settings)
  }, [settings])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      isConfigured: settings.backendUrl.trim() !== '' && settings.apiToken.trim() !== '',
      updateSettings,
    }),
    [settings, updateSettings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}
