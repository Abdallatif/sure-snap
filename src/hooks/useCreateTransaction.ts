import { useMutation } from '@tanstack/react-query'
import type { CreateTransactionInput, Transaction, TransactionCollection } from '@/types'

export function useCreateTransaction() {
  return useMutation<
    Transaction,
    Error,
    CreateTransactionInput,
    { previous: TransactionCollection | undefined }
  >({
    mutationKey: ['transactions', 'create'],
  })
}
