import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateTransactionInput, Transaction, TransactionCollection } from '@/types'

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation<
    Transaction,
    Error,
    CreateTransactionInput,
    { previous: TransactionCollection | undefined }
  >({
    mutationKey: ['transactions', 'create'],
    scope: { id: 'create-transaction' },

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] })

      const previous = queryClient.getQueryData<TransactionCollection>(['transactions'])

      queryClient.setQueryData<TransactionCollection>(['transactions'], (old) => {
        if (!old) return old

        const optimistic: Transaction = {
          id: `optimistic-${Date.now()}`,
          date: input.date,
          amount: String(input.amount),
          currency: input.currency ?? '',
          name: input.name,
          notes: input.notes ?? null,
          classification: input.nature ?? 'expense',
          account: { id: input.account_id, name: '', account_type: '' },
          category: input.category_id
            ? { id: input.category_id, name: '', classification: 'expense', color: '', icon: '' }
            : null,
          merchant: null,
          tags: [],
          transfer: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        return {
          ...old,
          transactions: [optimistic, ...old.transactions],
        }
      })

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['transactions'], context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
