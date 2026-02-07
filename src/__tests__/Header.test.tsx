import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '../components/Header'
import { createWrapper } from '@/__tests__/helpers'

// Mock useConnectionStatus
vi.mock('../hooks/useOnlineStatus', () => ({
  useConnectionStatus: vi.fn(() => 'online'),
}))

// Mock useMutationState to return empty by default
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useMutationState: vi.fn(() => []),
  }
})

import { useConnectionStatus } from '../hooks/useOnlineStatus'
import { useMutationState } from '@tanstack/react-query'

describe('Header', () => {
  it('displays the Sure Snap title', () => {
    render(<Header onOpenSettings={() => {}} />, {
      wrapper: createWrapper(),
    })
    expect(screen.getByText('Sure Snap')).toBeInTheDocument()
  })

  it('calls onOpenSettings when gear icon is clicked', async () => {
    const user = userEvent.setup()
    const onOpenSettings = vi.fn()
    render(<Header onOpenSettings={onOpenSettings} />, {
      wrapper: createWrapper(),
    })
    await user.click(screen.getByRole('button', { name: /settings/i }))
    expect(onOpenSettings).toHaveBeenCalledOnce()
  })

  // F7-AC4: blue badge with pending count
  it('shows pending sync count badge', () => {
    vi.mocked(useMutationState).mockReturnValue(['pending', 'pending'] as never[])
    render(<Header onOpenSettings={() => {}} />, {
      wrapper: createWrapper(),
    })
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  // F7-AC5: offline badge (amber)
  it('shows offline badge when status is offline', () => {
    vi.mocked(useConnectionStatus).mockReturnValue('offline')
    vi.mocked(useMutationState).mockReturnValue([])
    render(<Header onOpenSettings={() => {}} />, {
      wrapper: createWrapper(),
    })
    expect(screen.getByText(/offline/i)).toBeInTheDocument()
  })

  // F7-AC5: server unreachable badge (red)
  it('shows server unreachable badge when backend is down', () => {
    vi.mocked(useConnectionStatus).mockReturnValue('server-unreachable')
    vi.mocked(useMutationState).mockReturnValue([])
    render(<Header onOpenSettings={() => {}} />, {
      wrapper: createWrapper(),
    })
    expect(screen.getByText(/server unreachable/i)).toBeInTheDocument()
  })

  // Theme toggle cycles through light -> dark -> system
  it('has a theme toggle button', () => {
    vi.mocked(useConnectionStatus).mockReturnValue('online')
    render(<Header onOpenSettings={() => {}} />, {
      wrapper: createWrapper(),
    })
    // The theme button should exist with a theme label
    expect(
      screen.getByRole('button', { name: /mode/i }),
    ).toBeInTheDocument()
  })
})
