import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

interface AmountInputProps {
  value: string
  currency: string
  currencies: string[]
  onChangeAmount: (value: string) => void
  onChangeCurrency: (currency: string) => void
}

export function AmountInput({
  value,
  currency,
  currencies,
  onChangeAmount,
  onChangeCurrency,
}: AmountInputProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <label
        htmlFor="amount-input"
        className="text-sm font-medium text-muted-foreground"
      >
        {t('capture.amount')}
      </label>
      <input
        id="amount-input"
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
        className="w-full border-0 bg-transparent text-center text-5xl font-light outline-none placeholder:text-muted-foreground/40"
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
