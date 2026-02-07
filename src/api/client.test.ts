import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAccounts,
  getCategories,
  getTransactions,
  getTags,
  createTransaction,
  ApiRequestError,
} from './client'

const config = { backendUrl: 'https://sure.test', apiToken: 'test-token' }

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('API client', () => {
  it('sends X-Api-Key header with requests', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ accounts: [], pagination: {} }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await getAccounts(config)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/accounts'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Api-Key': 'test-token',
        }),
      }),
    )
  })

  it('strips trailing slashes from backend URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ accounts: [], pagination: {} }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await getAccounts({ ...config, backendUrl: 'https://sure.test///' })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/sure\.test\/api\//),
      expect.anything(),
    )
  })

  it('throws ApiRequestError on non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      }),
    )

    await expect(getAccounts(config)).rejects.toThrow(ApiRequestError)
  })

  // F3-AC5: only expense categories fetched
  it('getCategories passes classification=expense param', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ categories: [], pagination: {} }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await getCategories(config, { classification: 'expense' })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('classification=expense'),
      expect.anything(),
    )
  })

  it('getTransactions fetches with per_page', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ transactions: [], pagination: {} }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await getTransactions(config, { per_page: 50 })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('per_page=50'),
      expect.anything(),
    )
  })

  it('getTags fetches from /api/v1/tags', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })
    vi.stubGlobal('fetch', mockFetch)

    await getTags(config)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://sure.test/api/v1/tags',
      expect.anything(),
    )
  })

  // F9-AC5: tag_ids sent in create payload
  it('createTransaction sends transaction payload with tag_ids', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const input = {
      account_id: 'a1',
      date: '2025-01-01',
      amount: 42,
      name: 'Coffee',
      nature: 'expense' as const,
      category_id: 'c1',
      tag_ids: ['t1', 't2'],
    }

    await createTransaction(config, input)

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(callBody).toEqual({ transaction: input })
    expect(callBody.transaction.tag_ids).toEqual(['t1', 't2'])
  })

  // F1-AC4: nature defaults to expense
  it('createTransaction sends nature field', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await createTransaction(config, {
      account_id: 'a1',
      date: '2025-01-01',
      amount: 10,
      name: 'Test',
      nature: 'expense',
    })

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(callBody.transaction.nature).toBe('expense')
  })
})
