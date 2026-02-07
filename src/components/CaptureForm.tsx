import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@/context/SettingsContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { useTransactions } from '@/hooks/useTransactions'
import { useCreateTransaction } from '@/hooks/useCreateTransaction'
import { AccountSelector } from './AccountSelector'
import { AmountInput } from './AmountInput'
import { CategoryPicker } from './CategoryPicker'
import { DescriptionInput } from './DescriptionInput'
import { SuggestionChips, type Suggestion } from './SuggestionChips'
import { Button } from './ui/button'

export function CaptureForm() {
  const { t } = useTranslation()
  const { enabledAccountIds, lastUsedAccountId, currencies, updateSettings } =
    useSettings()

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: transactions = [] } = useTransactions()
  const createTransaction = useCreateTransaction()

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    lastUsedAccountId,
  )
  const [amount, setAmount] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )
  const [selectedCategoryName, setSelectedCategoryName] = useState('')
  const [description, setDescription] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Pre-select lastUsedAccountId when accounts load
  useEffect(() => {
    if (!selectedAccountId && lastUsedAccountId && accounts.length > 0) {
      const exists = accounts.some(
        (a) => a.id === lastUsedAccountId && enabledAccountIds.includes(a.id),
      )
      if (exists) setSelectedAccountId(lastUsedAccountId)
    }
  }, [accounts, lastUsedAccountId, enabledAccountIds, selectedAccountId])

  // Update currency when account changes
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)
  useEffect(() => {
    if (selectedAccount) {
      setSelectedCurrency(selectedAccount.currency)
    }
  }, [selectedAccount])

  const canSubmit =
    selectedAccountId !== null &&
    amount !== '' &&
    parseFloat(amount) > 0 &&
    selectedCategoryId !== null

  const resetForm = useCallback(() => {
    setAmount('')
    setSelectedCategoryId(null)
    setSelectedCategoryName('')
    setDescription('')
  }, [])

  function handleSuggestionSelect({ name, transaction }: Suggestion) {
    setDescription(name)

    if (!selectedCategoryId && transaction.category) {
      setSelectedCategoryId(transaction.category.id)
      setSelectedCategoryName(transaction.category.name)
    }

    if (!selectedAccountId && transaction.account) {
      setSelectedAccountId(transaction.account.id)
    }

    if (!amount && transaction.amount) {
      // Strip currency symbols, commas, whitespace — keep digits and decimal
      const raw = transaction.amount.replace(/[^0-9.]/g, '')
      if (raw) setAmount(raw)
    }

    if (!selectedCurrency && transaction.currency) {
      setSelectedCurrency(transaction.currency)
    }
  }

  function handleSubmit() {
    if (!canSubmit || !selectedAccountId || !selectedCategoryId) return

    const today = new Date().toISOString().split('T')[0]

    const input = {
      account_id: selectedAccountId,
      date: today,
      amount: parseFloat(amount),
      name: description || selectedCategoryName,
      nature: 'expense' as const,
      category_id: selectedCategoryId,
      currency: selectedCurrency || undefined,
    }

    updateSettings({ lastUsedAccountId: selectedAccountId })
    resetForm()
    setShowSuccess(true)

    createTransaction.mutate(input)
  }

  // Auto-hide success message
  useEffect(() => {
    if (!showSuccess) return
    const timer = setTimeout(() => setShowSuccess(false), 2000)
    return () => clearTimeout(timer)
  }, [showSuccess])

  return (
    <div className="flex flex-col gap-6">
      <AccountSelector
        accounts={accounts}
        enabledAccountIds={enabledAccountIds}
        selectedAccountId={selectedAccountId}
        onSelect={setSelectedAccountId}
      />

      <AmountInput
        value={amount}
        currency={selectedCurrency}
        currencies={currencies}
        onChangeAmount={setAmount}
        onChangeCurrency={setSelectedCurrency}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{t('capture.category')}</label>
        <CategoryPicker
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelect={(id, name) => {
            setSelectedCategoryId(id)
            setSelectedCategoryName(name)
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {t('capture.description')}
        </label>
        <DescriptionInput value={description} onChange={setDescription} />
        <SuggestionChips
          transactions={transactions}
          accountId={selectedAccountId}
          categoryId={selectedCategoryId}
          description={description}
          onSelect={handleSuggestionSelect}
        />
      </div>

      {showSuccess && (
        <p className="text-center text-sm font-medium text-green-600">
          {t('capture.success')}
        </p>
      )}

      <Button
        size="lg"
        className="min-h-[48px] w-full text-base"
        disabled={!canSubmit || createTransaction.isPending}
        onClick={handleSubmit}
      >
        {createTransaction.isPending
          ? t('common.loading')
          : t('capture.submit')}
      </Button>
    </div>
  )
}
