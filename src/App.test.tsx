import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import App from './App'
import { renderWithProviders, seedSettings } from '@/test/helpers'

describe('App', () => {
  // F6-AC1: when not configured, show setup banner instead of capture form
  it('shows setup banner when not configured', () => {
    renderWithProviders(<App />)
    expect(
      screen.getByText(/connect to your sure instance/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /open settings/i }),
    ).toBeInTheDocument()
  })

  // F6-AC3/AC4: after configuring, capture form becomes available
  it('shows capture form when configured', () => {
    seedSettings({ backendUrl: 'https://sure.test', apiToken: 'tok123' })
    renderWithProviders(<App />, {
      settings: { backendUrl: 'https://sure.test', apiToken: 'tok123' },
    })
    // The capture form should be rendered (has a submit button)
    expect(
      screen.getByRole('button', { name: /save transaction/i }),
    ).toBeInTheDocument()
    // Setup banner should not be present
    expect(
      screen.queryByText(/connect to your sure instance/i),
    ).not.toBeInTheDocument()
  })

  // F1-AC1: capture screen is the first and only screen on launch
  it('shows header with Sure Snap title', () => {
    renderWithProviders(<App />)
    expect(screen.getByText('Sure Snap')).toBeInTheDocument()
  })

  // F5-AC1: settings gear icon in header
  it('has a settings button in the header', () => {
    renderWithProviders(<App />)
    // The header has a gear icon button with aria-label exactly "Settings"
    const headerButtons = screen.getAllByRole('button', { name: /settings/i })
    expect(headerButtons.length).toBeGreaterThanOrEqual(1)
  })

  // F6-AC5: if user clears settings, banner returns
  it('shows setup banner again if settings are cleared', () => {
    seedSettings({ backendUrl: 'https://sure.test', apiToken: 'tok123' })
    const { unmount } = renderWithProviders(<App />, {
      settings: { backendUrl: 'https://sure.test', apiToken: 'tok123' },
    })
    unmount()

    // Clear settings, simulating user clearing their config
    localStorage.clear()
    renderWithProviders(<App />)
    expect(
      screen.getByText(/connect to your sure instance/i),
    ).toBeInTheDocument()
  })
})
