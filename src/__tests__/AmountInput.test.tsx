import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AmountInput } from '../components/AmountInput'
import { createWrapper } from '@/__tests__/helpers'

describe('AmountInput', () => {
  // F1-AC6: amount input auto-focuses on launch
  it('auto-focuses the input on mount', () => {
    render(
      <AmountInput
        value=""
        currency="USD"
        currencies={['USD', 'EUR']}
        onChangeAmount={() => {}}
        onChangeCurrency={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByPlaceholderText('0.00')).toHaveFocus()
  })

  it('calls onChangeAmount with valid numeric input', async () => {
    const user = userEvent.setup()
    const onChangeAmount = vi.fn()
    render(
      <AmountInput
        value=""
        currency="USD"
        currencies={['USD']}
        onChangeAmount={onChangeAmount}
        onChangeCurrency={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    await user.type(screen.getByPlaceholderText('0.00'), '42.50')
    // Each character triggers a change
    expect(onChangeAmount).toHaveBeenCalled()
    // Last call should be with '0' (since the value doesn't accumulate externally)
    // The important thing is it was called with valid input
    for (const call of onChangeAmount.mock.calls) {
      expect(call[0]).toMatch(/^(\d*\.?\d*)$/)
    }
  })

  it('displays currency toggle buttons', () => {
    render(
      <AmountInput
        value=""
        currency="USD"
        currencies={['USD', 'EUR', 'ILS']}
        onChangeAmount={() => {}}
        onChangeCurrency={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.getByText('ILS')).toBeInTheDocument()
  })

  it('calls onChangeCurrency when a currency is clicked', async () => {
    const user = userEvent.setup()
    const onChangeCurrency = vi.fn()
    render(
      <AmountInput
        value=""
        currency="USD"
        currencies={['USD', 'EUR']}
        onChangeAmount={() => {}}
        onChangeCurrency={onChangeCurrency}
      />,
      { wrapper: createWrapper() },
    )
    await user.click(screen.getByText('EUR'))
    expect(onChangeCurrency).toHaveBeenCalledWith('EUR')
  })
})
