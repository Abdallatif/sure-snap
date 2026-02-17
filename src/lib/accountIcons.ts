import type { AccountDetail } from '@/types'

const defaultAccountIcons: Record<string, string> = {
  depository: 'landmark',
  credit: 'credit-card',
  loan: 'hand-coins',
  investment: 'trending-up',
}

export const ACCOUNT_ICON_OPTIONS = [
  'landmark',
  'credit-card',
  'wallet',
  'piggy-bank',
  'building',
  'banknote',
  'coins',
  'hand-coins',
  'trending-up',
  'circle-dollar-sign',
  'receipt',
  'badge-dollar-sign',
  'vault',
  'briefcase',
  'gift',
  'home',
  'car',
  'plane',
  'heart',
  'star',
]

export function getAccountIcon(
  account: AccountDetail,
  overrides: Record<string, string>,
): string {
  return overrides[account.id] || defaultAccountIcons[account.account_type] || 'wallet'
}
