import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetupBanner } from '../components/layout/SetupBanner'
import { createWrapper } from '@/__tests__/helpers'

describe('SetupBanner', () => {
  // F6-AC2: banner has clear message and button to open settings
  it('shows setup message', () => {
    render(<SetupBanner onOpenSettings={() => {}} />, {
      wrapper: createWrapper(),
    })
    expect(
      screen.getByText(/connect to your sure instance/i),
    ).toBeInTheDocument()
  })

  it('has a button to open settings', async () => {
    const user = userEvent.setup()
    const onOpenSettings = vi.fn()
    render(<SetupBanner onOpenSettings={onOpenSettings} />, {
      wrapper: createWrapper(),
    })
    const btn = screen.getByRole('button', { name: /open settings/i })
    await user.click(btn)
    expect(onOpenSettings).toHaveBeenCalledOnce()
  })
})
