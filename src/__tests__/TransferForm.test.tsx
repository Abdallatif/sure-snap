import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransferForm } from '../components/capture/TransferForm'
import { createWrapper } from '@/__tests__/helpers'
import type { AccountDetail } from '@/types'

const mockAccounts: AccountDetail[] = [
  { id: 'a1', name: 'Cash', balance: '100', currency: 'USD', classification: 'asset', account_type: 'depository' },
  { id: 'a2', name: 'Bank', balance: '500', currency: 'USD', classification: 'asset', account_type: 'depository' },
  { id: 'a3', name: 'Euro Wallet', balance: '300', currency: 'EUR', classification: 'asset', account_type: 'depository' },
]

const mockMutate = vi.fn()

vi.mock('@/hooks/useAccounts', () => ({
  useAccounts: () => ({ data: mockAccounts }),
}))

vi.mock('@/hooks/useCreateTransfer', () => ({
  useCreateTransfer: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
  PartialTransferError: class PartialTransferError extends Error {
    outflow: unknown
    constructor(outflow: unknown) {
      super('Outflow saved but inflow failed')
      this.name = 'PartialTransferError'
      this.outflow = outflow
    }
  },
}))

const defaultSettings = {
  backendUrl: 'https://sure.test',
  apiToken: 'tok',
  enabledAccountIds: ['a1', 'a2', 'a3'],
  currencies: ['USD', 'EUR'],
}

beforeEach(() => {
  mockMutate.mockClear()
})

/** The submit button — not the toggle which also matches "Transfer" */
function getSubmitButton() {
  return screen.getAllByRole('button', { name: /^transfer$/i })
    .find((btn) => btn.getAttribute('data-slot') === 'button')!
}

describe('TransferForm', () => {
  it('renders From and To account selectors', () => {
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
  })

  it('renders amount input and note field', () => {
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    expect(screen.getByText('Note')).toBeInTheDocument()
  })

  it('renders transfer submit button', () => {
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    expect(getSubmitButton()).toBeInTheDocument()
  })

  it('disables submit when no accounts are selected', () => {
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    expect(getSubmitButton()).toBeDisabled()
  })

  it('disables submit when only source account is selected', async () => {
    const user = userEvent.setup()
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    const cashButtons = screen.getAllByText('Cash')
    await user.click(cashButtons[0])
    await user.type(screen.getByPlaceholderText('0.00'), '100')
    expect(getSubmitButton()).toBeDisabled()
  })

  it('enables submit when both accounts and amount are set (same currency)', async () => {
    const user = userEvent.setup()
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    const cashButtons = screen.getAllByText('Cash')
    await user.click(cashButtons[0])
    const bankButtons = screen.getAllByText('Bank')
    await user.click(bankButtons[1])
    await user.type(screen.getByPlaceholderText('0.00'), '50')
    expect(getSubmitButton()).toBeEnabled()
  })

  it('calls mutate with correct transfer input on submit', async () => {
    const user = userEvent.setup()
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    const cashButtons = screen.getAllByText('Cash')
    await user.click(cashButtons[0])
    const bankButtons = screen.getAllByText('Bank')
    await user.click(bankButtons[1])
    await user.type(screen.getByPlaceholderText('0.00'), '50')
    await user.click(getSubmitButton())

    expect(mockMutate).toHaveBeenCalledOnce()
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAccountId: 'a1',
        sourceAccountName: 'Cash',
        destinationAccountId: 'a2',
        destinationAccountName: 'Bank',
        amount: 50,
        sourceCurrency: 'USD',
      }),
      expect.any(Object),
    )
  })

  it('shows destination amount input when currencies differ', async () => {
    const user = userEvent.setup()
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    const cashButtons = screen.getAllByText('Cash')
    await user.click(cashButtons[0])
    const euroButtons = screen.getAllByText('Euro Wallet')
    await user.click(euroButtons[1])

    expect(screen.getByText('Destination amount')).toBeInTheDocument()
  })

  it('disables submit for cross-currency without destination amount', async () => {
    const user = userEvent.setup()
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    const cashButtons = screen.getAllByText('Cash')
    await user.click(cashButtons[0])
    const euroButtons = screen.getAllByText('Euro Wallet')
    await user.click(euroButtons[1])
    await user.type(screen.getByLabelText('Amount'), '100')

    expect(getSubmitButton()).toBeDisabled()
  })

  it('enables submit for cross-currency when both amounts are set', async () => {
    const user = userEvent.setup()
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    const cashButtons = screen.getAllByText('Cash')
    await user.click(cashButtons[0])
    const euroButtons = screen.getAllByText('Euro Wallet')
    await user.click(euroButtons[1])
    await user.type(screen.getByLabelText('Amount'), '100')
    await user.type(screen.getByLabelText('Destination amount'), '92')

    expect(getSubmitButton()).toBeEnabled()
  })

  it('shows exchange rate when both cross-currency amounts are entered', async () => {
    const user = userEvent.setup()
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    const cashButtons = screen.getAllByText('Cash')
    await user.click(cashButtons[0])
    const euroButtons = screen.getAllByText('Euro Wallet')
    await user.click(euroButtons[1])
    await user.type(screen.getByLabelText('Amount'), '100')
    await user.type(screen.getByLabelText('Destination amount'), '92')

    expect(screen.getByText(/1 USD = 0.9200 EUR/)).toBeInTheDocument()
  })

  it('passes cross-currency amounts in mutation', async () => {
    const user = userEvent.setup()
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    const cashButtons = screen.getAllByText('Cash')
    await user.click(cashButtons[0])
    const euroButtons = screen.getAllByText('Euro Wallet')
    await user.click(euroButtons[1])
    await user.type(screen.getByLabelText('Amount'), '100')
    await user.type(screen.getByLabelText('Destination amount'), '92')
    await user.click(getSubmitButton())

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 100,
        sourceCurrency: 'USD',
        destinationAmount: 92,
        destinationCurrency: 'EUR',
      }),
      expect.any(Object),
    )
  })

  it('disables the source account in the destination selector', async () => {
    const user = userEvent.setup()
    render(<TransferForm onToggleTransfer={() => {}} />, {
      wrapper: createWrapper({ settings: defaultSettings }),
    })
    const cashButtons = screen.getAllByText('Cash')
    await user.click(cashButtons[0])

    const toCashButton = cashButtons[1].closest('button')!
    expect(toCashButton).toBeDisabled()
  })
})
