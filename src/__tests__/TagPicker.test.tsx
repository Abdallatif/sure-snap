import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagPicker } from '../components/capture/TagPicker'
import { createWrapper } from '@/__tests__/helpers'
import type { TagDetail } from '@/types'

const tags: TagDetail[] = [
  { id: 't1', name: 'Urgent', color: '#ff0000', created_at: '', updated_at: '' },
  { id: 't2', name: 'Personal', color: '#00ff00', created_at: '', updated_at: '' },
  { id: 't3', name: 'Business', color: '#0000ff', created_at: '', updated_at: '' },
]

describe('TagPicker', () => {
  // F9-AC2: each tag shows name and color dot
  it('renders all tags with their names', () => {
    render(
      <TagPicker tags={tags} selectedTagIds={[]} onToggle={() => {}} />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText('Urgent')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
  })

  // F9-AC3: tapping toggles on/off
  it('calls onToggle with the tag id when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <TagPicker tags={tags} selectedTagIds={[]} onToggle={onToggle} />,
      { wrapper: createWrapper() },
    )
    await user.click(screen.getByText('Urgent'))
    expect(onToggle).toHaveBeenCalledWith('t1')
  })

  // F9-AC4: multiple tags can be selected
  it('shows multiple tags as selected', () => {
    const { container } = render(
      <TagPicker tags={tags} selectedTagIds={['t1', 't3']} onToggle={() => {}} />,
      { wrapper: createWrapper() },
    )
    // Selected tags have backgroundColor style set
    const urgentBtn = screen.getByText('Urgent').closest('button')!
    const businessBtn = screen.getByText('Business').closest('button')!
    expect(urgentBtn.style.backgroundColor).toBe('rgb(255, 0, 0)')
    expect(businessBtn.style.backgroundColor).toBe('rgb(0, 0, 255)')

    // Personal should not have background set
    const personalBtn = screen.getByText('Personal').closest('button')!
    expect(personalBtn.style.backgroundColor).toBe('')
  })

  // F9-AC8: hidden when no tags
  it('renders nothing when tags array is empty', () => {
    const { container } = render(
      <TagPicker tags={[]} selectedTagIds={[]} onToggle={() => {}} />,
      { wrapper: createWrapper() },
    )
    expect(container.innerHTML).toBe('')
  })
})
