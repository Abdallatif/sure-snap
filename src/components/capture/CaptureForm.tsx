import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'
import { useSettings } from '@/context/SettingsContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { useTransactions } from '@/hooks/useTransactions'
import { useCreateTransaction } from '@/hooks/useCreateTransaction'
import { useTags } from '@/hooks/useTags'
import { AccountsHeader } from './AccountsHeader'
import { AccountSelector } from './AccountSelector'
import { AmountInput } from './AmountInput'
import { CategoryPicker } from './CategoryPicker'
import { DescriptionInput } from './DescriptionInput'
import { SuggestionChips, type Suggestion } from './SuggestionChips'
import { TagPicker } from './TagPicker'
import { Button } from '../ui/button'

interface CaptureFormProps {
  onToggleTransfer: (pressed: boolean) => void
}

export function CaptureForm({ onToggleTransfer }: CaptureFormProps) {
  const { t } = useTranslation()
  const { enabledAccountIds, lastUsedAccountId, currencies, showTags, showNotes, sortCategoriesByUsage, updateSettings } =
    useSettings()

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: transactions = [] } = useTransactions()
  const { data: tags = [] } = useTags()
  const createTransaction = useCreateTransaction()

  const sortedCategories = useMemo(() => {
    if (!sortCategoriesByUsage || transactions.length === 0) return categories
    const freq = new Map<string, number>()
    for (const tx of transactions) {
      if (tx.category) {
        freq.set(tx.category.id, (freq.get(tx.category.id) ?? 0) + 1)
      }
    }
    return [...categories].sort(
      (a, b) => (freq.get(b.id) ?? 0) - (freq.get(a.id) ?? 0),
    )
  }, [categories, transactions, sortCategoriesByUsage])

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
  const [note, setNote] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [suggestionPicked, setSuggestionPicked] = useState(false)
  const [accountClickedByUser, setAccountClickedByUser] = useState(false)

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
    setNote('')
    setSelectedTagIds([])
    setSuggestionPicked(false)
    setAccountClickedByUser(false)
  }, [])

  function handleTagToggle(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    )
  }

  function handleSuggestionSelect({ name, transaction }: Suggestion) {
    setDescription(name)
    setSuggestionPicked(true)

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

    if (selectedTagIds.length === 0 && transaction.tags.length > 0) {
      setSelectedTagIds(transaction.tags.map((t) => t.id))
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
      notes: note || undefined,
      currency: selectedCurrency || undefined,
      tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    }

    updateSettings({ lastUsedAccountId: selectedAccountId })
    resetForm()

    sileo.promise(createTransaction.mutateAsync(input), {
      loading: { title: t('common.loading') },
      success: { title: t('capture.success') },
      error: { title: t('common.error'), duration: 5000 },
    }).catch(() => {})
  }

  return (
    <div className="flex flex-col gap-6">
      <AccountsHeader
        transferMode={false}
        onToggleTransfer={onToggleTransfer}
      />

      <AccountSelector
        accounts={accounts}
        enabledAccountIds={enabledAccountIds}
        selectedAccountId={selectedAccountId}
        onSelect={(id) => {
          setSelectedAccountId(id)
          setAccountClickedByUser(true)
        }}
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
          categories={sortedCategories}
          selectedCategoryId={selectedCategoryId}
          onSelect={(id, name) => {
            setSelectedCategoryId(id)
            setSelectedCategoryName(name)
          }}
        />
      </div>

      {showTags && tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('capture.tags')}</label>
          <TagPicker
            tags={tags}
            selectedTagIds={selectedTagIds}
            onToggle={handleTagToggle}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {t('capture.description')}
        </label>
        <DescriptionInput value={description} onChange={(v) => { setDescription(v); setSuggestionPicked(false) }} />
        {!suggestionPicked && (
          <SuggestionChips
            transactions={transactions}
            accountId={accountClickedByUser ? selectedAccountId : null}
            categoryId={selectedCategoryId}
            description={description}
            onSelect={handleSuggestionSelect}
          />
        )}
      </div>

      {showNotes && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('capture.note')}</label>
          <DescriptionInput value={note} onChange={setNote} placeholder={t('capture.notePlaceholder')} />
        </div>
      )}

      <Button
        size="lg"
        className="min-h-12 w-full text-base"
        disabled={!canSubmit || (createTransaction.isPending && !createTransaction.isPaused)}
        onClick={handleSubmit}
      >
        {createTransaction.isPending && !createTransaction.isPaused
          ? t('common.loading')
          : t('capture.submit')}
      </Button>
    </div>
  )
}
