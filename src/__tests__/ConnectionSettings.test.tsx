import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConnectionSettings } from '../components/settings/ConnectionSettings'
import { createWrapper } from '@/__tests__/helpers'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('ConnectionSettings', () => {
  // F5-AC2: backend URL and API token inputs
  it('shows backend URL input', () => {
    render(<ConnectionSettings />, {
      wrapper: createWrapper({
        settings: { backendUrl: 'https://sure.test', apiToken: 'tok' },
      }),
    })
    expect(screen.getByLabelText(/backend url/i)).toBeInTheDocument()
  })

  it('shows API token input', () => {
    render(<ConnectionSettings />, {
      wrapper: createWrapper({
        settings: { backendUrl: 'https://sure.test', apiToken: 'tok' },
      }),
    })
    expect(screen.getByLabelText(/api token/i)).toBeInTheDocument()
  })

  // F5-AC10: API token is masked by default
  it('masks API token by default', () => {
    render(<ConnectionSettings />, {
      wrapper: createWrapper({
        settings: { backendUrl: '', apiToken: '' },
      }),
    })
    const tokenInput = screen.getByLabelText(/api token/i)
    expect(tokenInput).toHaveAttribute('type', 'password')
  })

  // F5-AC10: show/hide toggle for token
  it('toggles token visibility', async () => {
    const user = userEvent.setup()
    render(<ConnectionSettings />, {
      wrapper: createWrapper({
        settings: { backendUrl: '', apiToken: '' },
      }),
    })
    const tokenInput = screen.getByLabelText(/api token/i)
    expect(tokenInput).toHaveAttribute('type', 'password')

    // Click show button
    await user.click(screen.getByRole('button', { name: /show/i }))
    expect(tokenInput).toHaveAttribute('type', 'text')

    // Click hide button
    await user.click(screen.getByRole('button', { name: /hide/i }))
    expect(tokenInput).toHaveAttribute('type', 'password')
  })

  // F5-AC3: test connection button
  it('has a test connection button', () => {
    render(<ConnectionSettings />, {
      wrapper: createWrapper({
        settings: { backendUrl: 'https://sure.test', apiToken: 'tok' },
      }),
    })
    expect(
      screen.getByRole('button', { name: /test connection/i }),
    ).toBeInTheDocument()
  })

  // F5-AC3: test connection disabled when fields empty
  it('disables test connection when both URL and token are empty', () => {
    render(<ConnectionSettings />, {
      wrapper: createWrapper({
        settings: { backendUrl: '', apiToken: '' },
      }),
    })
    expect(
      screen.getByRole('button', { name: /test connection/i }),
    ).toBeDisabled()
  })

  // F5-AC3: test connection shows success
  it('shows success after successful connection test', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ accounts: [], pagination: {} }),
      }),
    )
    const user = userEvent.setup()
    render(<ConnectionSettings />, {
      wrapper: createWrapper({
        settings: { backendUrl: 'https://sure.test', apiToken: 'tok123' },
      }),
    })
    await user.click(screen.getByRole('button', { name: /test connection/i }))
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument()
    })
  })

  // F5-AC3: test connection shows failure
  it('shows failure after failed connection test', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    )
    const user = userEvent.setup()
    render(<ConnectionSettings />, {
      wrapper: createWrapper({
        settings: { backendUrl: 'https://sure.test', apiToken: 'tok123' },
      }),
    })
    await user.click(screen.getByRole('button', { name: /test connection/i }))
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument()
    })
  })
})
