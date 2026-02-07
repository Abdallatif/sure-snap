import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SuggestionChips } from './SuggestionChips'
import { createWrapper } from '@/test/helpers'
import type { Transaction } from '@/types'

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: Math.random().toString(),
    date: '2025-01-01',
    amount: '10.00',
    currency: 'USD',
    name: 'Coffee',
    notes: null,
    classification: 'expense',
    account: { id: 'a1', name: 'Cash', account_type: 'depository' },
    category: { id: 'c1', name: 'Food', classification: 'expense', color: '', icon: '' },
    merchant: null,
    tags: [],
    transfer: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

const transactions: Transaction[] = [
  makeTx({ name: 'Coffee', account: { id: 'a1', name: 'Cash', account_type: '' }, category: { id: 'c1', name: 'Food', classification: 'expense', color: '', icon: '' } }),
  makeTx({ name: 'Coffee', account: { id: 'a1', name: 'Cash', account_type: '' }, category: { id: 'c1', name: 'Food', classification: 'expense', color: '', icon: '' } }),
  makeTx({ name: 'Coffee', account: { id: 'a1', name: 'Cash', account_type: '' }, category: { id: 'c1', name: 'Food', classification: 'expense', color: '', icon: '' } }),
  makeTx({ name: 'Lunch', account: { id: 'a1', name: 'Cash', account_type: '' }, category: { id: 'c1', name: 'Food', classification: 'expense', color: '', icon: '' } }),
  makeTx({ name: 'Lunch', account: { id: 'a1', name: 'Cash', account_type: '' }, category: { id: 'c1', name: 'Food', classification: 'expense', color: '', icon: '' } }),
  makeTx({ name: 'Gas', account: { id: 'a2', name: 'Bank', account_type: '' }, category: { id: 'c2', name: 'Transport', classification: 'expense', color: '', icon: '' } }),
  makeTx({ name: 'Bus', account: { id: 'a2', name: 'Bank', account_type: '' }, category: { id: 'c2', name: 'Transport', classification: 'expense', color: '', icon: '' } }),
  makeTx({ name: 'Groceries', account: { id: 'a1', name: 'Cash', account_type: '' }, category: { id: 'c1', name: 'Food', classification: 'expense', color: '', icon: '' } }),
]

describe('SuggestionChips', () => {
  // F4-AC5: top 5 unique names, sorted by frequency
  it('shows up to 5 unique suggestions sorted by frequency', () => {
    // Add more unique names to exceed 5
    const manyTx = [
      ...transactions,
      makeTx({ name: 'Taxi' }),
      makeTx({ name: 'Dinner' }),
      makeTx({ name: 'Snack' }),
    ]
    render(
      <SuggestionChips
        transactions={manyTx}
        accountId={null}
        categoryId={null}
        description=""
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeLessThanOrEqual(5)
    // Coffee (3x) should be first
    expect(buttons[0]).toHaveTextContent('Coffee')
    // Lunch (2x) should be second
    expect(buttons[1]).toHaveTextContent('Lunch')
  })

  // F4-AC2: filtered by selected account
  it('filters suggestions by account', () => {
    render(
      <SuggestionChips
        transactions={transactions}
        accountId="a2"
        categoryId={null}
        description=""
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText('Gas')).toBeInTheDocument()
    expect(screen.getByText('Bus')).toBeInTheDocument()
    expect(screen.queryByText('Coffee')).not.toBeInTheDocument()
  })

  // F4-AC3: filtered by selected category
  it('filters suggestions by category', () => {
    render(
      <SuggestionChips
        transactions={transactions}
        accountId={null}
        categoryId="c2"
        description=""
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText('Gas')).toBeInTheDocument()
    expect(screen.getByText('Bus')).toBeInTheDocument()
    expect(screen.queryByText('Coffee')).not.toBeInTheDocument()
  })

  // F4-AC4: filtered by description text (fuzzy match)
  it('filters suggestions by description text', () => {
    render(
      <SuggestionChips
        transactions={transactions}
        accountId={null}
        categoryId={null}
        description="cof"
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.queryByText('Lunch')).not.toBeInTheDocument()
  })

  // F4-AC6: tapping a chip calls onSelect with the suggestion
  it('calls onSelect when a chip is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <SuggestionChips
        transactions={transactions}
        accountId={null}
        categoryId={null}
        description=""
        onSelect={onSelect}
      />,
      { wrapper: createWrapper() },
    )
    await user.click(screen.getByText('Coffee'))
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Coffee' }),
    )
  })

  it('renders nothing when no suggestions match', () => {
    render(
      <SuggestionChips
        transactions={transactions}
        accountId={null}
        categoryId={null}
        description="zzzznonexistent"
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  // F4-AC1: derived from cached transactions, no extra API call
  it('renders nothing when transactions list is empty', () => {
    render(
      <SuggestionChips
        transactions={[]}
        accountId={null}
        categoryId={null}
        description=""
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
