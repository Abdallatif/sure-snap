// --- Shared / Embedded ---

export interface Pagination {
  page: number
  per_page: number
  total_count: number
  total_pages: number
}

export interface Account {
  id: string
  name: string
  account_type: string
}

export interface AccountDetail {
  id: string
  name: string
  balance: string
  currency: string
  classification: string
  account_type: string
}

export interface CategoryParent {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
  classification: 'income' | 'expense'
  color: string
  icon: string
}

export interface CategoryDetail {
  id: string
  name: string
  classification: 'income' | 'expense'
  color: string
  icon: string
  parent: CategoryParent | null
  subcategories_count: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface TagDetail {
  id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface Merchant {
  id: string
  name: string
}

export interface Transfer {
  id: string
  amount: string
  currency: string
  other_account: Account | null
}

export interface Transaction {
  id: string
  date: string
  amount: string
  currency: string
  name: string
  notes: string | null
  classification: string
  account: Account
  category: Category | null
  merchant: Merchant | null
  tags: Tag[]
  transfer: Transfer | null
  created_at: string
  updated_at: string
}

// --- API Collections ---

export interface AccountCollection {
  accounts: AccountDetail[]
  pagination: Pagination
}

export interface CategoryCollection {
  categories: CategoryDetail[]
  pagination: Pagination
}

export interface TransactionCollection {
  transactions: Transaction[]
  pagination: Pagination
}

// --- Mutation Inputs ---

export interface CreateTransactionInput {
  account_id: string
  date: string
  amount: number
  name: string
  nature?: 'income' | 'expense' | 'inflow' | 'outflow'
  category_id?: string
  merchant_id?: string
  notes?: string
  currency?: string
  tag_ids?: string[]
}

// --- Error ---

export interface ApiError {
  error: string
  message?: string | null
  details?: string[] | Record<string, unknown> | null
}
