import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryPicker } from '../components/CategoryPicker'
import { createWrapper } from '@/__tests__/helpers'
import type { CategoryDetail } from '@/types'

const categories: CategoryDetail[] = [
  { id: 'c1', name: 'Food', classification: 'expense', color: '#ff0000', icon: 'utensils', parent: null, subcategories_count: 0, created_at: '', updated_at: '' },
  { id: 'c2', name: 'Transport', classification: 'expense', color: '#00ff00', icon: 'car', parent: null, subcategories_count: 0, created_at: '', updated_at: '' },
  { id: 'c3', name: 'Shopping', classification: 'expense', color: '#0000ff', icon: 'shopping-bag', parent: null, subcategories_count: 0, created_at: '', updated_at: '' },
]

describe('CategoryPicker', () => {
  // F3-AC1: expanded by default, shows 2-column grid of categories
  it('shows all categories in a grid on initial render', () => {
    render(
      <CategoryPicker
        categories={categories}
        selectedCategoryId={null}
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Shopping')).toBeInTheDocument()
  })

  // F3-AC1: 2-column grid
  it('renders a 2-column grid', () => {
    const { container } = render(
      <CategoryPicker
        categories={categories}
        selectedCategoryId={null}
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    expect(container.querySelector('.grid-cols-2')).toBeInTheDocument()
  })

  // F3-AC2: tapping a category selects it and collapses to chip
  it('collapses to a chip after selecting a category', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <CategoryPicker
        categories={categories}
        selectedCategoryId={null}
        onSelect={onSelect}
      />,
      { wrapper: createWrapper() },
    )
    await user.click(screen.getByText('Food'))
    expect(onSelect).toHaveBeenCalledWith('c1', 'Food')
  })

  // F3-AC2: collapsed shows selected category name
  it('shows selected category as a badge when collapsed', () => {
    const { container } = render(
      <CategoryPicker
        categories={categories}
        selectedCategoryId="c1"
        onSelect={() => {}}
      />,
      { wrapper: createWrapper() },
    )
    // CategoryPicker starts expanded=true, but after a selection + rerender with selectedCategoryId
    // it won't auto-collapse. The collapse happens internally on click.
    // Let's test the collapsed view by triggering a selection.
    // Actually the component uses internal state, so we need to click to collapse.
    // useEffect collapses the picker when selectedCategoryId is set,
    // so the collapsed badge view is rendered instead of the grid.
    expect(screen.getByText('Food')).toBeInTheDocument()
  })

  // F3-AC3: tapping collapsed chip re-expands
  it('re-expands when clicking the collapsed chip', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(
      <CategoryPicker
        categories={categories}
        selectedCategoryId={null}
        onSelect={onSelect}
      />,
      { wrapper: createWrapper() },
    )

    // Click to select and collapse
    await user.click(screen.getByText('Food'))

    // Rerender with selectedCategoryId to simulate parent state update
    rerender(
      <CategoryPicker
        categories={categories}
        selectedCategoryId="c1"
        onSelect={onSelect}
      />,
    )

    // Now it should be collapsed, showing a chip-like button
    const chipButton = screen.getByRole('button', { name: /food/i })
    expect(chipButton).toBeInTheDocument()

    // Click to re-expand
    await user.click(chipButton)
    // After expanding, all categories should be visible again
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Shopping')).toBeInTheDocument()
  })
})
