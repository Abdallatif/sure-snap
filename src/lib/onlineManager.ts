import { onlineManager } from '@tanstack/react-query'

// --- Shared helper ---
// Reads API config from localStorage so this works outside React context.
// Used by mutation defaults (queryClient.ts) and the backend ping below.

export function getApiConfig() {
  try {
    const raw = localStorage.getItem('suresnap-settings')
    if (!raw) return null
    const { backendUrl, apiToken } = JSON.parse(raw)
    const trimmedUrl = (backendUrl ?? '').trim()
    const trimmedToken = (apiToken ?? '').trim()
    if (!trimmedToken) return null
    return { backendUrl: trimmedUrl, apiToken: trimmedToken }
  } catch {
    return null
  }
}

// --- Connection Status ---
// Subscribable store so the UI can distinguish "no network" from
// "server unreachable". Kept in sync with onlineManager below.

export type ConnectionStatus = 'online' | 'offline' | 'server-unreachable'

let _status: ConnectionStatus = 'online'
const _listeners = new Set<() => void>()

export const connectionStatus = {
  get: () => _status,
  subscribe: (cb: () => void) => {
    _listeners.add(cb)
    return () => { _listeners.delete(cb) }
  },
}

function setStatus(next: ConnectionStatus) {
  if (next === _status) return
  _status = next
  _listeners.forEach((cb) => cb())
}

// --- Online Manager ---
// Overrides TanStack Query's default navigator.onLine check so that
// mutations pause when the backend is unreachable (not just when the
// browser has no network). Pings only when the tab is visible.

const PING_INTERVAL = 30_000
const PING_TIMEOUT = 5_000

onlineManager.setEventListener((setOnline) => {
  let backendReachable = true
  let intervalId: ReturnType<typeof setInterval> | undefined

  function update() {
    if (!navigator.onLine) {
      setOnline(false)
      setStatus('offline')
    } else if (getApiConfig() && !backendReachable) {
      setOnline(false)
      setStatus('server-unreachable')
    } else {
      setOnline(true)
      setStatus('online')
    }
  }

  async function ping() {
    const config = getApiConfig()
    if (!config) {
      update()
      return
    }
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT)
      await fetch(
        `${config.backendUrl.replace(/\/+$/, '')}/api/v1/accounts?per_page=1`,
        { headers: { 'X-Api-Key': config.apiToken }, signal: controller.signal },
      )
      clearTimeout(timeout)
      backendReachable = true
    } catch {
      backendReachable = false
    }
    update()
  }

  function manage() {
    clearInterval(intervalId)
    if (navigator.onLine && document.visibilityState === 'visible') {
      ping()
      intervalId = setInterval(ping, PING_INTERVAL)
    } else {
      update()
    }
  }

  window.addEventListener('online', manage)
  window.addEventListener('offline', manage)
  document.addEventListener('visibilitychange', manage)
  manage()

  return () => {
    window.removeEventListener('online', manage)
    window.removeEventListener('offline', manage)
    document.removeEventListener('visibilitychange', manage)
    clearInterval(intervalId)
  }
})
