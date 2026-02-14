import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountsHeader } from '../components/capture/AccountsHeader'
import { createWrapper } from './helpers'

describe('AccountsHeader', () => {
  it('shows "Accounts" label when transferMode is false', () => {
    render(
      <AccountsHeader transferMode={false} onToggleTransfer={() => {}} />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText('Accounts')).toBeInTheDocument()
  })

  it('shows "Transfer" label when transferMode is true', () => {
    render(
      <AccountsHeader transferMode={true} onToggleTransfer={() => {}} />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText('Transfer')).toBeInTheDocument()
  })

  it('calls onToggleTransfer when toggle is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <AccountsHeader transferMode={false} onToggleTransfer={onToggle} />,
      { wrapper: createWrapper() },
    )
    await user.click(screen.getByRole('button', { name: /transfer/i }))
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('toggle is pressed when transferMode is true', () => {
    render(
      <AccountsHeader transferMode={true} onToggleTransfer={() => {}} />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByRole('button', { name: /transfer/i })).toHaveAttribute(
      'data-state',
      'on',
    )
  })
})
