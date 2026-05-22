import { get, set } from 'idb-keyval'

// --- Types ---

export type AttemptStatus = 'pending' | 'success' | 'error'

export interface TransactionAttempt {
  id: string
  timestamp: number
  status: AttemptStatus
  requestBody: Record<string, unknown>
  responseStatus?: number
  responseBody?: unknown
  errorMessage?: string
}

export interface TransactionHistoryEntry {
  /** Stable ID to group attempts (mutation submittedAt timestamp or input hash) */
  transactionId: string
  /** Human-readable label (description / category name) */
  label: string
  /** When first submitted */
  createdAt: number
  /** All request attempts (initial + retries) */
  attempts: TransactionAttempt[]
}

// --- Storage ---

const STORAGE_KEY = 'suresnap-tx-history'
const MAX_ENTRIES = 200

let _cache: TransactionHistoryEntry[] | null = null

export async function getHistory(): Promise<TransactionHistoryEntry[]> {
  if (_cache) return _cache
  const data = await get<TransactionHistoryEntry[]>(STORAGE_KEY)
  _cache = data ?? []
  return _cache
}

async function persist() {
  if (_cache) {
    await set(STORAGE_KEY, _cache)
  }
}

export async function addEntry(entry: TransactionHistoryEntry) {
  const history = await getHistory()
  history.unshift(entry)
  if (history.length > MAX_ENTRIES) {
    history.length = MAX_ENTRIES
  }
  _cache = history
  await persist()
}

export async function addAttempt(transactionId: string, attempt: TransactionAttempt) {
  const history = await getHistory()
  const entry = history.find((e) => e.transactionId === transactionId)
  if (entry) {
    entry.attempts.push(attempt)
    await persist()
  }
}

export async function updateAttempt(
  transactionId: string,
  attemptId: string,
  update: Partial<Pick<TransactionAttempt, 'status' | 'responseStatus' | 'responseBody' | 'errorMessage'>>,
) {
  const history = await getHistory()
  const entry = history.find((e) => e.transactionId === transactionId)
  if (!entry) return
  const attempt = entry.attempts.find((a) => a.id === attemptId)
  if (!attempt) return
  Object.assign(attempt, update)
  await persist()
}

export async function clearHistory() {
  _cache = []
  await set(STORAGE_KEY, _cache)
}

/** Force reload from IDB (useful after external writes) */
export function invalidateCache() {
  _cache = null
}
