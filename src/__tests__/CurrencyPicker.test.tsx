import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencyPicker } from '../components/CurrencyPicker'
import { createWrapper } from '@/__tests__/helpers'

describe('CurrencyPicker', () => {
  // F5-AC5: manage a list of currencies, stored uppercase, deduplicated
  it('displays selected currencies as chips', () => {
    render(
      <CurrencyPicker
        selected={['USD', 'EUR', 'ILS']}
        onChange={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText(/USD/)).toBeInTheDocument()
    expect(screen.getByText(/EUR/)).toBeInTheDocument()
    expect(screen.getByText(/ILS/)).toBeInTheDocument()
  })

  it('can remove a currency', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <CurrencyPicker selected={['USD', 'EUR']} onChange={onChange} />,
      { wrapper: createWrapper() },
    )
    // Each currency has an X button next to it
    const removeButtons = screen.getAllByRole('button')
    // Find the X button within the USD chip
    const usdChip = screen.getByText(/\$ USD/).closest('span')!
    const removeBtn = usdChip.querySelector('button')!
    await user.click(removeBtn)
    expect(onChange).toHaveBeenCalledWith(['EUR'])
  })

  it('has a search input for currencies', () => {
    render(
      <CurrencyPicker selected={['USD']} onChange={() => {}} />,
      { wrapper: createWrapper() },
    )
    expect(
      screen.getByPlaceholderText(/search currencies/i),
    ).toBeInTheDocument()
  })
})
