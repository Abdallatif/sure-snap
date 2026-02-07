import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DescriptionInput } from '../components/DescriptionInput'
import { createWrapper } from '@/__tests__/helpers'

describe('DescriptionInput', () => {
  it('renders with placeholder text', () => {
    render(<DescriptionInput value="" onChange={() => {}} />, {
      wrapper: createWrapper(),
    })
    expect(
      screen.getByPlaceholderText(/what was this for/i),
    ).toBeInTheDocument()
  })

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DescriptionInput value="" onChange={onChange} />, {
      wrapper: createWrapper(),
    })
    await user.type(screen.getByPlaceholderText(/what was this for/i), 'test')
    expect(onChange).toHaveBeenCalled()
  })

  it('displays the provided value', () => {
    render(<DescriptionInput value="Coffee" onChange={() => {}} />, {
      wrapper: createWrapper(),
    })
    expect(screen.getByDisplayValue('Coffee')).toBeInTheDocument()
  })
})
