import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsSheet } from './SettingsSheet'
import { createWrapper } from '@/test/helpers'

// Mock child components to avoid deep dependency issues
vi.mock('./ConnectionSettings', () => ({
  ConnectionSettings: () => <div data-testid="connection-settings" />,
}))
vi.mock('./AccountsSettings', () => ({
  AccountsSettings: () => <div data-testid="accounts-settings" />,
}))

describe('SettingsSheet', () => {
  // F5-AC2: connection section
  it('renders connection settings', () => {
    render(<SettingsSheet />, {
      wrapper: createWrapper({
        settings: { backendUrl: 'https://sure.test', apiToken: 'tok' },
      }),
    })
    expect(screen.getByTestId('connection-settings')).toBeInTheDocument()
  })

  // F5-AC4: accounts section
  it('renders accounts settings', () => {
    render(<SettingsSheet />, {
      wrapper: createWrapper({
        settings: { backendUrl: 'https://sure.test', apiToken: 'tok' },
      }),
    })
    expect(screen.getByTestId('accounts-settings')).toBeInTheDocument()
  })

  // F5-AC5: currencies section
  it('renders currencies section', () => {
    render(<SettingsSheet />, {
      wrapper: createWrapper({
        settings: { backendUrl: 'https://sure.test', apiToken: 'tok' },
      }),
    })
    expect(screen.getByText(/currencies/i)).toBeInTheDocument()
  })

  // F9-AC7: show tags toggle
  it('renders show tags toggle', () => {
    render(<SettingsSheet />, {
      wrapper: createWrapper({
        settings: { backendUrl: 'https://sure.test', apiToken: 'tok' },
      }),
    })
    expect(screen.getByText(/show tags/i)).toBeInTheDocument()
  })

  // F5-AC6: language section
  it('renders language settings', () => {
    render(<SettingsSheet />, {
      wrapper: createWrapper({
        settings: { backendUrl: 'https://sure.test', apiToken: 'tok' },
      }),
    })
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('العربية')).toBeInTheDocument()
  })
})
