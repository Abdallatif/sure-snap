import { cn } from '@/lib/utils'
import type { TagDetail } from '@/types'

interface TagPickerProps {
  tags: TagDetail[]
  selectedTagIds: string[]
  onToggle: (tagId: string) => void
}

export function TagPicker({ tags, selectedTagIds, onToggle }: TagPickerProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const selected = selectedTagIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
              selected
                ? 'border-transparent text-white'
                : 'border-border bg-background text-foreground hover:bg-accent',
            )}
            style={
              selected ? { backgroundColor: tag.color } : undefined
            }
          >
            <span
              className={cn(
                'size-2 shrink-0 rounded-full',
                selected && 'bg-white/40',
              )}
              style={!selected ? { backgroundColor: tag.color } : undefined}
            />
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}
