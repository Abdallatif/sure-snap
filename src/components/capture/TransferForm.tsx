import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useCreateTransfer, PartialTransferError } from '@/hooks/useCreateTransfer'
import { AccountsHeader } from './AccountsHeader'
import { AccountSelector } from './AccountSelector'
import { AmountInput } from './AmountInput'
import { DescriptionInput } from './DescriptionInput'
import { Button } from '../ui/button'

interface TransferFormProps {
  onToggleTransfer: (pressed: boolean) => void
}

export function TransferForm({ onToggleTransfer }: TransferFormProps) {
  const { t } = useTranslation()
  const { enabledAccountIds, lastUsedAccountId, updateSettings } = useSettings()
  const { data: accounts = [] } = useAccounts()
  const transfer = useCreateTransfer()

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    lastUsedAccountId,
  )
  const [destinationAccountId, setDestinationAccountId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [destinationAmount, setDestinationAmount] = useState('')
  const [description, setDescription] = useState('')

  // Pre-select lastUsedAccountId when accounts load
  useEffect(() => {
    if (!selectedAccountId && lastUsedAccountId && accounts.length > 0) {
      const exists = accounts.some(
        (a) => a.id === lastUsedAccountId && enabledAccountIds.includes(a.id),
      )
      if (exists) setSelectedAccountId(lastUsedAccountId)
    }
  }, [accounts, lastUsedAccountId, enabledAccountIds, selectedAccountId])

  // Update currency when source account changes
  const sourceAccount = accounts.find((a) => a.id === selectedAccountId)
  const destAccount = accounts.find((a) => a.id === destinationAccountId)

  useEffect(() => {
    if (sourceAccount) {
      setSelectedCurrency(sourceAccount.currency)
    }
  }, [sourceAccount])

  const isCrossCurrency =
    sourceAccount && destAccount && sourceAccount.currency !== destAccount.currency

  const srcNum = parseFloat(amount)
  const dstNum = parseFloat(destinationAmount)
  const exchangeRate =
    isCrossCurrency && srcNum > 0 && dstNum > 0
      ? (dstNum / srcNum).toFixed(4)
      : null

  const canSubmit =
    selectedAccountId !== null &&
    destinationAccountId !== null &&
    selectedAccountId !== destinationAccountId &&
    amount !== '' &&
    parseFloat(amount) > 0 &&
    (!isCrossCurrency || (destinationAmount !== '' && parseFloat(destinationAmount) > 0))

  const resetForm = useCallback(() => {
    setAmount('')
    setDestinationAccountId(null)
    setDestinationAmount('')
    setDescription('')
  }, [])

  function handleSubmit() {
    if (!canSubmit || !selectedAccountId || !destinationAccountId || !sourceAccount || !destAccount)
      return

    updateSettings({ lastUsedAccountId: selectedAccountId })

    const input = {
      sourceAccountId: selectedAccountId,
      sourceAccountName: sourceAccount.name,
      destinationAccountId,
      destinationAccountName: destAccount.name,
      amount: parseFloat(amount),
      sourceCurrency: selectedCurrency,
      destinationAmount: isCrossCurrency ? parseFloat(destinationAmount) : undefined,
      destinationCurrency: isCrossCurrency ? destAccount.currency : undefined,
      description: description || undefined,
    }

    sileo.promise(transfer.mutateAsync(input), {
      loading: { title: t('common.loading') },
      success: { title: t('capture.transferSuccess') },
      error: (err) => {
        if (err instanceof PartialTransferError) {
          return { title: t('capture.transferPartialError'), duration: null }
        }
        return { title: t('capture.transferError'), duration: 5000 }
      },
    }).then(() => resetForm()).catch(() => {})
  }

  return (
    <div className="flex flex-col gap-6">
      <AccountsHeader transferMode onToggleTransfer={onToggleTransfer} />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{t('capture.from')}</label>
        <AccountSelector
          accounts={accounts}
          enabledAccountIds={enabledAccountIds}
          selectedAccountId={selectedAccountId}
          disabledAccountId={destinationAccountId}
          onSelect={setSelectedAccountId}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{t('capture.to')}</label>
        <AccountSelector
          accounts={accounts}
          enabledAccountIds={enabledAccountIds}
          selectedAccountId={destinationAccountId}
          disabledAccountId={selectedAccountId}
          onSelect={setDestinationAccountId}
        />
      </div>

      {isCrossCurrency ? (
        <>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <AmountInput
                value={amount}
                currency={selectedCurrency}
                currencies={[]}
                onChangeAmount={setAmount}
                onChangeCurrency={setSelectedCurrency}
                compact
              />
            </div>
            <ArrowRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" />
            <div className="min-w-0 flex-1">
              <AmountInput
                value={destinationAmount}
                currency={destAccount.currency}
                currencies={[]}
                onChangeAmount={setDestinationAmount}
                onChangeCurrency={() => {}}
                label={t('capture.destinationAmount')}
                id="destination-amount-input"
                autoFocus={false}
                compact
              />
            </div>
          </div>
          {exchangeRate && (
            <p className="text-center text-xs text-muted-foreground">
              1 {sourceAccount.currency} = {exchangeRate} {destAccount.currency}
            </p>
          )}
        </>
      ) : (
        <AmountInput
          value={amount}
          currency={selectedCurrency}
          currencies={[]}
          onChangeAmount={setAmount}
          onChangeCurrency={setSelectedCurrency}
        />
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{t('capture.note')}</label>
        <DescriptionInput value={description} onChange={setDescription} />
      </div>

      <Button
        size="lg"
        className="min-h-12 w-full text-base"
        disabled={!canSubmit || transfer.isPending}
        onClick={handleSubmit}
      >
        {transfer.isPending ? t('common.loading') : t('capture.submitTransfer')}
      </Button>
    </div>
  )
}
