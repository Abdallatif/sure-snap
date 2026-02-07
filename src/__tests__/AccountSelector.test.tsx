import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountSelector } from '../components/AccountSelector'
import { createWrapper } from '@/__tests__/helpers'
import type { AccountDetail } from '@/types'

const accounts: AccountDetail[] = [
  { id: '1', name: 'Cash', balance: '100', currency: 'USD', classification: 'asset', account_type: 'depository' },
  { id: '2', name: 'Bank', balance: '500', currency: 'EUR', classification: 'asset', account_type: 'depository' },
  { id: '3', name: 'Credit', balance: '-200', currency: 'ILS', classification: 'liability', account_type: 'credit' },
]

describe('AccountSelector', () => {
  // F2-AC1: displays only enabled accounts
  it('displays only enabled accounts', () => {
    render(
      <AccountSelector
        accounts={accounts}
        enabledAccountIds={['1', '3']}
        selectedAccountId={null}
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Credit')).toBeInTheDocument()
    expect(screen.queryByText('Bank')).not.toBeInTheDocument()
  })

  // F2-AC3: each button shows account name and currency
  it('shows account name and currency for each button', () => {
    render(
      <AccountSelector
        accounts={accounts}
        enabledAccountIds={['1', '2']}
        selectedAccountId={null}
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('Bank')).toBeInTheDocument()
    expect(screen.getByText('EUR')).toBeInTheDocument()
  })

  // F2-AC4: exactly one account selected at a time
  it('calls onSelect when an account is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <AccountSelector
        accounts={accounts}
        enabledAccountIds={['1', '2']}
        selectedAccountId={null}
        onSelect={onSelect}
      />,
      { wrapper: createWrapper() },
    )
    await user.click(screen.getByText('Cash'))
    expect(onSelect).toHaveBeenCalledWith('1')
  })

  // F2-AC2: laid out as 2-column grid
  it('renders a 2-column grid', () => {
    const { container } = render(
      <AccountSelector
        accounts={accounts}
        enabledAccountIds={['1', '2']}
        selectedAccountId={null}
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(container.querySelector('.grid-cols-2')).toBeInTheDocument()
  })

  it('shows "no accounts" message when no accounts are enabled', () => {
    render(
      <AccountSelector
        accounts={accounts}
        enabledAccountIds={[]}
        selectedAccountId={null}
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText(/no accounts enabled/i)).toBeInTheDocument()
  })
})
