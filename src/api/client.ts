import type {
  AccountCollection,
  ApiError,
  CategoryCollection,
  CreateTransactionInput,
  TagDetail,
  Transaction,
  TransactionCollection,
} from '@/types'

interface ApiClientConfig {
  backendUrl: string
  apiToken: string
}

class ApiRequestError extends Error {
  status: number
  body: ApiError

  constructor(status: number, body: ApiError) {
    super(body.message ?? body.error)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

async function request<T>(
  config: ApiClientConfig,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = config.backendUrl.trim() ? config.backendUrl.replace(/\/+$/, '') : ''
  const url = `${base}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': config.apiToken,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({
      error: res.statusText,
    }))
    throw new ApiRequestError(res.status, body)
  }

  return res.json() as Promise<T>
}

// --- Endpoints ---

export function getAccounts(config: ApiClientConfig) {
  return request<AccountCollection>(config, '/api/v1/accounts?per_page=100')
}

export function getCategories(
  config: ApiClientConfig,
  params?: { classification?: string; parent_id?: string; roots_only?: boolean },
) {
  const search = new URLSearchParams()
  search.set('per_page', '100')
  if (params?.classification) search.set('classification', params.classification)
  if (params?.parent_id) search.set('parent_id', params.parent_id)
  if (params?.roots_only) search.set('roots_only', 'true')
  return request<CategoryCollection>(config, `/api/v1/categories?${search}`)
}

export async function getTransactions(
  config: ApiClientConfig,
  params?: { per_page?: number },
): Promise<TransactionCollection> {
  const API_MAX_PER_PAGE = 100
  const desired = params?.per_page ?? API_MAX_PER_PAGE
  const pageSize = Math.min(desired, API_MAX_PER_PAGE)

  const first = await request<TransactionCollection>(
    config,
    `/api/v1/transactions?per_page=${pageSize}`,
  )

  if (desired <= 100 || first.transactions.length < pageSize) {
    return first
  }

  const allTransactions = [...first.transactions]
  let page = 2
  while (allTransactions.length < desired) {
    const next = await request<TransactionCollection>(
      config,
      `/api/v1/transactions?per_page=${pageSize}&page=${page}`,
    )
    if (next.transactions.length === 0) break
    allTransactions.push(...next.transactions)
    page++
  }

  return {
    transactions: allTransactions.slice(0, desired),
    pagination: first.pagination,
  }
}

export function getTags(config: ApiClientConfig) {
  return request<TagDetail[]>(config, '/api/v1/tags')
}

export function createTransaction(
  config: ApiClientConfig,
  input: CreateTransactionInput,
) {
  return request<Transaction>(config, '/api/v1/transactions', {
    method: 'POST',
    body: JSON.stringify({ transaction: input }),
  })
}

export { ApiRequestError }
export type { ApiClientConfig }
