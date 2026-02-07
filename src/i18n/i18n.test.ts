import { describe, it, expect } from 'vitest'
import en from './en.json'
import ar from './ar.json'

describe('Internationalization (F8)', () => {
  // F8-AC1: all user-facing strings are externalized
  it('English and Arabic have the same keys', () => {
    const enKeys = Object.keys(en).sort()
    const arKeys = Object.keys(ar).sort()
    expect(enKeys).toEqual(arKeys)
  })

  it('no empty values in English translations', () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value, `en key "${key}" should not be empty`).not.toBe('')
    }
  })

  it('no empty values in Arabic translations', () => {
    for (const [key, value] of Object.entries(ar)) {
      expect(value, `ar key "${key}" should not be empty`).not.toBe('')
    }
  })

  // Verify key categories cover the PRD features
  it('has capture form strings', () => {
    expect(en).toHaveProperty('capture.amount')
    expect(en).toHaveProperty('capture.category')
    expect(en).toHaveProperty('capture.description')
    expect(en).toHaveProperty('capture.submit')
    expect(en).toHaveProperty('capture.success')
    expect(en).toHaveProperty('capture.tags')
  })

  it('has settings strings', () => {
    expect(en).toHaveProperty('settings.title')
    expect(en).toHaveProperty('settings.backendUrl')
    expect(en).toHaveProperty('settings.apiToken')
    expect(en).toHaveProperty('settings.testConnection')
    expect(en).toHaveProperty('settings.accounts')
    expect(en).toHaveProperty('settings.currencies')
    expect(en).toHaveProperty('settings.language')
    expect(en).toHaveProperty('settings.showTags')
  })

  it('has setup banner strings', () => {
    expect(en).toHaveProperty('setup.message')
    expect(en).toHaveProperty('setup.configure')
  })

  it('has offline/connectivity strings', () => {
    expect(en).toHaveProperty('common.offline')
    expect(en).toHaveProperty('common.serverUnreachable')
  })
})
