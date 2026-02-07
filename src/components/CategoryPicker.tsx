import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { LucideIcon } from './LucideIcon'
import { cn } from '@/lib/utils'
import type { CategoryDetail } from '@/types'

interface CategoryPickerProps {
  categories: CategoryDetail[]
  selectedCategoryId: string | null
  onSelect: (categoryId: string, categoryName: string) => void
}

export function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryPickerProps) {
  const [expanded, setExpanded] = useState(true)

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  if (!expanded && selectedCategoryId) {
    return (
      <Button
        variant="outline"
        onClick={() => setExpanded(true)}
        className="flex h-auto min-h-[44px] w-full justify-start px-3 py-2"
      >
        <Badge variant="secondary" className="text-sm">
          {selectedCategory?.icon && (
            <LucideIcon name={selectedCategory.icon} className="me-1 size-4" style={{ color: selectedCategory.color }} />
          )}
          {selectedCategory?.name}
        </Badge>
      </Button>
    )
  }

  return (
    <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="outline"
          onClick={() => {
            onSelect(category.id, category.name)
            setExpanded(false)
          }}
          className={cn(
            'flex h-auto min-h-[56px] flex-col items-center gap-1 px-2 py-2 text-xs',
            category.id === selectedCategoryId &&
              'border-primary bg-primary/10',
          )}
        >
          {category.icon && <LucideIcon name={category.icon} className="size-7" style={{ color: category.color }} />}
          <span className="w-full truncate text-center">{category.name}</span>
        </Button>
      ))}
    </div>
  )
}
