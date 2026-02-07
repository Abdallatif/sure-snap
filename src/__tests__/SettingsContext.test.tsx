import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SettingsProvider, useSettings } from '../context/SettingsContext'
import { createTestI18n } from '@/__tests__/helpers'
import { I18nextProvider } from 'react-i18next'
import type { ReactNode } from 'react'

const STORAGE_KEY = 'suresnap-settings'

function wrapper({ children }: { children: ReactNode }) {
  const i18nInstance = createTestI18n()
  return (
    <I18nextProvider i18n={i18nInstance}>
      <SettingsProvider>{children}</SettingsProvider>
    </I18nextProvider>
  )
}

describe('SettingsContext', () => {
  // F5-AC8: All settings persist across app restarts (localStorage)
  it('loads default settings when localStorage is empty', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.backendUrl).toBe('')
    expect(result.current.apiToken).toBe('')
    expect(result.current.language).toBe('en')
    expect(result.current.enabledAccountIds).toEqual([])
    expect(result.current.lastUsedAccountId).toBeNull()
    expect(result.current.currencies).toEqual(['USD', 'EUR', 'ILS'])
    expect(result.current.showTags).toBe(false)
  })

  it('loads persisted settings from localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ backendUrl: 'https://sure.test', apiToken: 'tok123' }),
    )
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.backendUrl).toBe('https://sure.test')
    expect(result.current.apiToken).toBe('tok123')
  })

  // F5-AC8: settings persist
  it('persists settings to localStorage on update', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })
    act(() => {
      result.current.updateSettings({ backendUrl: 'https://new.url' })
    })
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.backendUrl).toBe('https://new.url')
  })

  // F6-AC3/AC4: isConfigured logic
  it('isConfigured is false when URL or token is empty', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.isConfigured).toBe(false)
  })

  it('isConfigured is true when both URL and token are set', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ backendUrl: 'https://sure.test', apiToken: 'tok123' }),
    )
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.isConfigured).toBe(true)
  })

  // F5-AC6: default currencies
  it('has default currencies USD, EUR, ILS', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.currencies).toEqual(['USD', 'EUR', 'ILS'])
  })

  // F8-AC2: English is default
  it('defaults to English', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.language).toBe('en')
  })

  // F8-AC3: Arabic switches to RTL
  it('sets dir=rtl on html when language is Arabic', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ language: 'ar' }))
    renderHook(() => useSettings(), { wrapper })
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')
  })

  it('sets dir=ltr on html when language is English', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ language: 'en' }))
    renderHook(() => useSettings(), { wrapper })
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.documentElement.lang).toBe('en')
  })
})
