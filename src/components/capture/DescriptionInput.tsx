import { useTranslation } from 'react-i18next'
import { Input } from '../ui/input'

interface DescriptionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function DescriptionInput({ value, onChange, placeholder }: DescriptionInputProps) {
  const { t } = useTranslation()

  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? t('capture.descriptionPlaceholder')}
      className="min-h-[44px]"
    />
  )
}
