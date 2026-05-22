import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'
import { ArrowLeft, Check, ChevronDown, ChevronUp, CircleAlert, Clock, Copy, Loader2, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'
import { useTransactionHistory } from '@/hooks/useTransactionHistory'
import { useCreateTransaction } from '@/hooks/useCreateTransaction'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import type { TransactionAttempt, TransactionHistoryEntry } from '@/lib/transactionHistory'
import type { CreateTransactionInput } from '@/types'

interface TransactionHistoryPageProps {
  onBack: () => void
}

export function TransactionHistoryPage({ onBack }: TransactionHistoryPageProps) {
  const { t } = useTranslation()
  const { entries, loading, refresh, clear } = useTransactionHistory()

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label={t('capture.back')}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="flex-1 text-lg font-semibold">{t('history.title')}</h1>
        <Button variant="ghost" size="icon" onClick={refresh} aria-label={t('history.refresh')}>
          <RefreshCw className="size-4" />
        </Button>
        {entries.length > 0 && (
          <Button variant="ghost" size="icon" onClick={clear} aria-label={t('history.clear')}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </header>

      <main className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && entries.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">{t('history.empty')}</p>
        )}
        {entries.map((entry) => (
          <HistoryCard key={entry.transactionId} entry={entry} />
        ))}
      </main>
    </div>
  )
}

function HistoryCard({ entry }: { entry: TransactionHistoryEntry }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const latestAttempt = entry.attempts[entry.attempts.length - 1]
  const status = latestAttempt?.status ?? 'pending'

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-3 text-start"
        onClick={() => setExpanded(!expanded)}
      >
        <StatusIcon status={status} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{entry.label}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(entry.createdAt).toLocaleString()} · {entry.attempts.length} {t('history.attempts', { count: entry.attempts.length })}
          </p>
        </div>
        {expanded ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 border-t px-3 pb-3 pt-2">
          {entry.attempts.map((attempt, i) => (
            <AttemptDetail key={attempt.id} attempt={attempt} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function AttemptDetail({ attempt, index }: { attempt: TransactionAttempt; index: number }) {
  const { t } = useTranslation()
  const createTransaction = useCreateTransaction()
  const [showRequest, setShowRequest] = useState(false)
  const [showResponse, setShowResponse] = useState(false)

  function copyJson(data: unknown) {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    sileo.show({ title: t('history.copied') })
  }

  function handleResend() {
    const body = attempt.requestBody as { transaction?: CreateTransactionInput }
    const input = body?.transaction
    if (!input) return
    createTransaction.mutate(input)
    sileo.show({ title: t('history.resent') })
  }

  return (
    <div className="rounded-md border bg-muted/30 p-2 text-xs">
      <div className="flex items-center gap-2">
        <StatusIcon status={attempt.status} size="sm" />
        <span className="flex-1 font-medium">
          #{index + 1} — {new Date(attempt.timestamp).toLocaleTimeString()}
        </span>
        {attempt.responseStatus && (
          <Badge variant="outline" className="text-[10px]">
            {attempt.responseStatus}
          </Badge>
        )}
      </div>

      {attempt.errorMessage && (
        <p className="mt-1 text-destructive">{attempt.errorMessage}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-1">
        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => setShowRequest(!showRequest)}>
          {t('history.request')}
        </Button>
        {attempt.responseBody != null && (
          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => setShowResponse(!showResponse)}>
            {t('history.response')}
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 gap-1" onClick={() => copyJson(attempt.requestBody)}>
          <Copy className="size-3" /> {t('history.copyRequest')}
        </Button>
        {attempt.responseBody != null && (
          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 gap-1" onClick={() => copyJson(attempt.responseBody)}>
            <Copy className="size-3" /> {t('history.copyResponse')}
          </Button>
        )}
        {attempt.status === 'error' && (
          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 gap-1" onClick={handleResend}>
            <RotateCcw className="size-3" /> {t('history.resend')}
          </Button>
        )}
      </div>

      {showRequest && (
        <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-[10px] leading-relaxed whitespace-pre-wrap break-all">
          {JSON.stringify(attempt.requestBody, null, 2)}
        </pre>
      )}
      {showResponse && attempt.responseBody != null && (
        <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-[10px] leading-relaxed whitespace-pre-wrap break-all">
          {JSON.stringify(attempt.responseBody, null, 2)}
        </pre>
      )}
    </div>
  )
}

function StatusIcon({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'size-3.5' : 'size-5'
  switch (status) {
    case 'success':
      return <Check className={`${cls} text-green-600`} />
    case 'error':
      return <CircleAlert className={`${cls} text-destructive`} />
    default:
      return <Clock className={`${cls} text-amber-500`} />
  }
}
