import { useSyncExternalStore } from 'react'
import { connectionStatus, type ConnectionStatus } from '../lib/onlineManager'

export type { ConnectionStatus }

export function useConnectionStatus(): ConnectionStatus {
  return useSyncExternalStore(connectionStatus.subscribe, connectionStatus.get)
}
