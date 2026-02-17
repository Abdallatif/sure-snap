import { useMemo } from 'react'
import { Button } from '../ui/button'
import type { Transaction } from '@/types'

export interface Suggestion {
  name: string
  /** Most recent transaction with this name (for auto-filling fields) */
  transaction: Transaction
}

interface SuggestionChipsProps {
  transactions: Transaction[]
  accountId: string | null
  categoryId: string | null
  description: string
  tagIds?: string[]
  onSelect: (suggestion: Suggestion) => void
}

export function SuggestionChips({
  transactions,
  accountId,
  categoryId,
  description,
  tagIds = [],
  onSelect,
}: SuggestionChipsProps) {
  const suggestions = useMemo(() => {
    let filtered = transactions

    if (accountId) {
      filtered = filtered.filter((tx) => tx.account.id === accountId)
    }

    if (categoryId) {
      filtered = filtered.filter((tx) => tx.category?.id === categoryId)
    }

    const query = description.trim().toLowerCase()
    if (query) {
      filtered = filtered.filter((tx) =>
        tx.name.toLowerCase().includes(query),
      )
    }

    // Group by name, track weighted frequency and most recent transaction.
    // Transactions sharing a tag with the selected tags get weight 2, others 1.
    const tagSet = new Set(tagIds)
    const groups = new Map<string, { count: number; transaction: Transaction }>()
    for (const tx of filtered) {
      if (!tx.name) continue
      const weight = tagSet.size > 0 && tx.tags.some((t) => tagSet.has(t.id)) ? 2 : 1
      const existing = groups.get(tx.name)
      if (!existing) {
        groups.set(tx.name, { count: weight, transaction: tx })
      } else {
        existing.count += weight
      }
    }

    return [...groups.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, { transaction }]): Suggestion => ({ name, transaction }))
  }, [transactions, accountId, categoryId, description, tagIds])

  if (suggestions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.name}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion.name}
        </Button>
      ))}
    </div>
  )
}
