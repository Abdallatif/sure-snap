import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { searchCurrencies, getCurrency } from '@/lib/currencies'

interface CurrencyPickerProps {
  selected: string[]
  onChange: (currencies: string[]) => void
}

export function CurrencyPicker({ selected, onChange }: CurrencyPickerProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = searchCurrencies(search)
    .filter((c) => !selected.includes(c.code))
    .slice(0, 20)

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setDropdownOpen(true)
          }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
          placeholder={t('settings.currencyPlaceholder')}
        />
        {dropdownOpen && results.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
            {results.map((c) => (
              <Button
                key={c.code}
                variant="ghost"
                className="flex h-auto w-full justify-start gap-2 rounded-none px-3 py-2 text-sm font-normal"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange([...selected, c.code])
                  setSearch('')
                  setDropdownOpen(false)
                  inputRef.current?.blur()
                }}
              >
                <span className="font-medium">{c.code}</span>
                <span className="text-muted-foreground">{c.name}</span>
                <span className="ms-auto text-muted-foreground">{c.symbol}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {selected.map((code) => {
          const info = getCurrency(code)
          return (
            <span
              key={code}
              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm"
            >
              {info ? `${info.symbol} ${code}` : code}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onChange(selected.filter((c) => c !== code))}
              >
                <X className="size-3" />
              </Button>
            </span>
          )
        })}
      </div>
    </div>
  )
}
