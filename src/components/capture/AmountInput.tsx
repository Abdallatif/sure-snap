import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'

interface AmountInputProps {
  value: string
  currency: string
  currencies: string[]
  onChangeAmount: (value: string) => void
  onChangeCurrency: (currency: string) => void
  label?: string
  id?: string
  autoFocus?: boolean
  compact?: boolean
}

export function AmountInput({
  value,
  currency,
  currencies,
  onChangeAmount,
  onChangeCurrency,
  label,
  id = 'amount-input',
  autoFocus = true,
  compact = false,
}: AmountInputProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  return (
    <div className="flex flex-col items-center gap-3">
      <label
        htmlFor={id}
        className="text-sm font-medium text-muted-foreground"
      >
        {label ?? t('capture.amount')}
      </label>
      <input
        id={id}
        ref={inputRef}
        type="text"
        inputMode="decimal"
        placeholder={t('capture.amountPlaceholder')}
        value={value}
        onChange={(e) => {
          const v = e.target.value
          if (v === '' || /^\d*\.?\d*$/.test(v)) {
            onChangeAmount(v)
          }
        }}
        className={`w-full border-0 bg-transparent text-center font-light outline-none placeholder:text-muted-foreground/40 ${compact ? 'text-3xl' : 'text-5xl'}`}
      />
      {currencies.length > 0 && (
        <ToggleGroup
          type="single"
          variant="outline"
          value={currency}
          onValueChange={(val) => {
            if (val) onChangeCurrency(val)
          }}
          className="flex flex-wrap justify-center"
        >
          {currencies.map((code) => (
            <ToggleGroupItem
              key={code}
              value={code}
              className="min-h-9 px-3 text-xs"
            >
              {code}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </div>
  )
}
