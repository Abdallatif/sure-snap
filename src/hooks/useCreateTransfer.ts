import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTransaction } from '@/api/client'
import { getApiConfig } from '@/lib/onlineManager'
import type { Transaction } from '@/types'

export class PartialTransferError extends Error {
  outflow: Transaction
  constructor(outflow: Transaction) {
    super('Outflow saved but inflow failed')
    this.name = 'PartialTransferError'
    this.outflow = outflow
  }
}

interface TransferInput {
  sourceAccountId: string
  sourceAccountName: string
  destinationAccountId: string
  destinationAccountName: string
  amount: number
  sourceCurrency: string
  destinationAmount?: number
  destinationCurrency?: string
  description?: string
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation<[Transaction, Transaction], Error, TransferInput>({
    mutationFn: async (input) => {
      const config = getApiConfig()
      if (!config) throw new Error('API not configured')

      const today = new Date().toISOString().split('T')[0]

      const outflow = await createTransaction(config, {
        account_id: input.sourceAccountId,
        date: today,
        amount: input.amount,
        name: `Transfer to ${input.destinationAccountName}`,
        nature: 'expense',
        currency: input.sourceCurrency,
        notes: input.description || undefined,
      })

      const dstAmount = input.destinationAmount ?? input.amount
      const dstCurrency = input.destinationCurrency ?? input.sourceCurrency

      let inflow: Transaction
      try {
        inflow = await createTransaction(config, {
          account_id: input.destinationAccountId,
          date: today,
          amount: dstAmount,
          name: `Transfer from ${input.sourceAccountName}`,
          nature: 'income',
          currency: dstCurrency,
          notes: input.description || undefined,
        })
      } catch {
        throw new PartialTransferError(outflow)
      }

      return [outflow, inflow]
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
