import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ThemeProvider } from '@/components/theme-provider'
import { SettingsProvider } from '@/context/SettingsContext'
import type { Settings } from '@/context/SettingsContext'
import type { ReactNode } from 'react'
import en from '@/i18n/en.json'
import ar from '@/i18n/ar.json'

const STORAGE_KEY = 'suresnap-settings'

/** Pre-seed localStorage with settings before rendering */
export function seedSettings(overrides: Partial<Settings> = {}) {
  const defaults: Settings = {
    backendUrl: '',
    apiToken: '',
    language: 'en',
    enabledAccountIds: [],
    lastUsedAccountId: null,
    currencies: ['USD', 'EUR', 'ILS'],
    showTags: false,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaults, ...overrides }))
}

/** Create a fresh i18n instance for testing */
export function createTestI18n(lng = 'en') {
  const instance = i18n.createInstance()
  instance.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })
  return instance
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  })
}

interface WrapperOptions {
  settings?: Partial<Settings>
  lng?: string
}

export function createWrapper(options: WrapperOptions = {}) {
  const { settings, lng = 'en' } = options

  if (settings) seedSettings(settings)

  const queryClient = createTestQueryClient()
  const i18nInstance = createTestI18n(lng)

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <I18nextProvider i18n={i18nInstance}>
        <ThemeProvider defaultTheme="system" storageKey="suresnap-theme">
          <SettingsProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </SettingsProvider>
        </ThemeProvider>
      </I18nextProvider>
    )
  }
}

/** Render with all providers */
export function renderWithProviders(
  ui: React.ReactElement,
  options: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  const { settings, lng, ...renderOptions } = options
  return render(ui, {
    wrapper: createWrapper({ settings, lng }),
    ...renderOptions,
  })
}
