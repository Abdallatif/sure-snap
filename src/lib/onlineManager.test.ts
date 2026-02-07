import { describe, it, expect, beforeEach } from 'vitest'
import { getApiConfig } from './onlineManager'

const STORAGE_KEY = 'suresnap-settings'

beforeEach(() => {
  localStorage.clear()
})

describe('getApiConfig', () => {
  it('returns null when no settings in localStorage', () => {
    expect(getApiConfig()).toBeNull()
  })

  it('returns config with empty backendUrl (same-origin mode)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ backendUrl: '', apiToken: 'tok' }),
    )
    expect(getApiConfig()).toEqual({ backendUrl: '', apiToken: 'tok' })
  })

  it('returns null when apiToken is empty', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ backendUrl: 'https://sure.test', apiToken: '' }),
    )
    expect(getApiConfig()).toBeNull()
  })

  it('returns config with empty backendUrl when whitespace-only (same-origin mode)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ backendUrl: '   ', apiToken: 'tok' }),
    )
    expect(getApiConfig()).toEqual({ backendUrl: '', apiToken: 'tok' })
  })

  it('returns trimmed config when both values are set', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ backendUrl: ' https://sure.test ', apiToken: ' tok123 ' }),
    )
    const config = getApiConfig()
    expect(config).toEqual({
      backendUrl: 'https://sure.test',
      apiToken: 'tok123',
    })
  })

  it('returns null for malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json')
    expect(getApiConfig()).toBeNull()
  })
})
