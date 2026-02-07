import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CaptureForm } from './CaptureForm'
import { createWrapper, seedSettings } from '@/test/helpers'
import type { AccountDetail, CategoryDetail, Transaction, TagDetail } from '@/types'

// Mock hooks to return controlled data
const mockAccounts: AccountDetail[] = [
  { id: 'a1', name: 'Cash', balance: '100', currency: 'USD', classification: 'asset', account_type: 'depository' },
  { id: 'a2', name: 'Bank', balance: '500', currency: 'EUR', classification: 'asset', account_type: 'depository' },
]

const mockCategories: CategoryDetail[] = [
  { id: 'c1', name: 'Food', classification: 'expense', color: '#ff0000', icon: 'utensils', parent: null, subcategories_count: 0, created_at: '', updated_at: '' },
  { id: 'c2', name: 'Transport', classification: 'expense', color: '#00ff00', icon: 'car', parent: null, subcategories_count: 0, created_at: '', updated_at: '' },
]

const mockTransactions: Transaction[] = []
const mockTags: TagDetail[] = [
  { id: 't1', name: 'Urgent', color: '#ff0000', created_at: '', updated_at: '' },
]

const mockMutate = vi.fn()

vi.mock('@/hooks/useAccounts', () => ({
  useAccounts: () => ({ data: mockAccounts }),
}))
vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ data: mockCategories }),
}))
vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({ data: mockTransactions }),
}))
vi.mock('@/hooks/useTags', () => ({
  useTags: () => ({ data: mockTags }),
}))
vi.mock('@/hooks/useCreateTransaction', () => ({
  useCreateTransaction: () => ({
    mutate: mockMutate,
    isPending: false,
    isPaused: false,
  }),
}))

beforeEach(() => {
  mockMutate.mockClear()
})

const defaultSettings = {
  backendUrl: 'https://sure.test',
  apiToken: 'tok',
  enabledAccountIds: ['a1', 'a2'],
  currencies: ['USD', 'EUR'],
}

describe('CaptureForm', () => {
  // F1-AC2: form includes account selector, amount, category, description
  it('renders all form fields', () => {
    render(<CaptureForm />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    // Account buttons
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Bank')).toBeInTheDocument()
    // Amount input
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    // Category picker
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
    // Description input
    expect(screen.getByPlaceholderText(/what was this for/i)).toBeInTheDocument()
    // Submit button
    expect(screen.getByRole('button', { name: /save transaction/i })).toBeInTheDocument()
  })

  // F1-AC7: all fields except description are required before submit is enabled
  it('disables submit when no account is selected', () => {
    render(<CaptureForm />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    expect(screen.getByRole('button', { name: /save transaction/i })).toBeDisabled()
  })

  it('disables submit when no amount is entered', async () => {
    const user = userEvent.setup()
    render(<CaptureForm />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    // Select account
    await user.click(screen.getByText('Cash'))
    // Select category
    await user.click(screen.getByText('Food'))
    // Don't enter amount
    expect(screen.getByRole('button', { name: /save transaction/i })).toBeDisabled()
  })

  it('disables submit when no category is selected', async () => {
    const user = userEvent.setup()
    render(<CaptureForm />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    // Select account
    await user.click(screen.getByText('Cash'))
    // Enter amount
    await user.type(screen.getByPlaceholderText('0.00'), '42')
    // Don't select category
    expect(screen.getByRole('button', { name: /save transaction/i })).toBeDisabled()
  })

  it('enables submit when account, amount, and category are set', async () => {
    const user = userEvent.setup()
    render(<CaptureForm />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    await user.click(screen.getByText('Cash'))
    await user.type(screen.getByPlaceholderText('0.00'), '42')
    await user.click(screen.getByText('Food'))
    expect(screen.getByRole('button', { name: /save transaction/i })).toBeEnabled()
  })

  // F1-AC5: submitting clears form and shows success
  it('clears form and shows success on submit', async () => {
    const user = userEvent.setup()
    render(<CaptureForm />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    await user.click(screen.getByText('Cash'))
    await user.type(screen.getByPlaceholderText('0.00'), '42')
    await user.click(screen.getByText('Food'))
    await user.click(screen.getByRole('button', { name: /save transaction/i }))

    // Success message shown
    expect(screen.getByText(/transaction saved/i)).toBeInTheDocument()
    // Form is reset
    expect(screen.getByPlaceholderText('0.00')).toHaveValue('')
    // Mutation was called
    expect(mockMutate).toHaveBeenCalledOnce()
  })

  // F1-AC4: transaction nature defaults to expense
  it('submits with nature=expense', async () => {
    const user = userEvent.setup()
    render(<CaptureForm />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    await user.click(screen.getByText('Cash'))
    await user.type(screen.getByPlaceholderText('0.00'), '42')
    await user.click(screen.getByText('Food'))
    await user.click(screen.getByRole('button', { name: /save transaction/i }))

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        nature: 'expense',
        account_id: 'a1',
        amount: 42,
        category_id: 'c1',
      }),
    )
  })

  // F1-AC3: date auto-set to current date
  it('submits with today\'s date', async () => {
    const user = userEvent.setup()
    render(<CaptureForm />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    await user.click(screen.getByText('Cash'))
    await user.type(screen.getByPlaceholderText('0.00'), '10')
    await user.click(screen.getByText('Food'))
    await user.click(screen.getByRole('button', { name: /save transaction/i }))

    const today = new Date().toISOString().split('T')[0]
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ date: today }),
    )
  })

  // F2-AC6: changing account updates default currency
  it('updates currency when account is selected', async () => {
    const user = userEvent.setup()
    render(<CaptureForm />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    // Select Bank (EUR)
    await user.click(screen.getByText('Bank'))
    // EUR should now be the selected currency
    // We verify by submitting and checking the payload
    await user.type(screen.getByPlaceholderText('0.00'), '10')
    await user.click(screen.getByText('Food'))
    await user.click(screen.getByRole('button', { name: /save transaction/i }))
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ currency: 'EUR' }),
    )
  })

  // F9-AC7: tag picker hidden when showTags is false
  it('hides tag picker when showTags is false', () => {
    render(<CaptureForm />, {
      wrapper: createWrapper({
        settings: { ...defaultSettings, showTags: false },
      }),
    })
    expect(screen.queryByText('Urgent')).not.toBeInTheDocument()
  })

  // F9-AC7: tag picker shown when showTags is true
  it('shows tag picker when showTags is true', () => {
    render(<CaptureForm />, {
      wrapper: createWrapper({
        settings: { ...defaultSettings, showTags: true },
      }),
    })
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  // F9-AC9: tags cleared on form reset
  it('clears tags on submit', async () => {
    const user = userEvent.setup()
    render(<CaptureForm />, {
      wrapper: createWrapper({
        settings: { ...defaultSettings, showTags: true },
      }),
    })
    // Select tag
    await user.click(screen.getByText('Urgent'))
    // Fill form
    await user.click(screen.getByText('Cash'))
    await user.type(screen.getByPlaceholderText('0.00'), '10')
    await user.click(screen.getByText('Food'))
    await user.click(screen.getByRole('button', { name: /save transaction/i }))

    // First call should have tag_ids
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ tag_ids: ['t1'] }),
    )

    // After reset, the tag should not be visually selected (bg set)
    const urgentBtn = screen.getByText('Urgent').closest('button')!
    expect(urgentBtn.style.backgroundColor).toBe('')
  })
})
