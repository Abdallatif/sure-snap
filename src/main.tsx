import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persister } from './lib/queryClient'
import { ThemeProvider } from './components/theme-provider'
import { SettingsProvider } from './context/SettingsContext'
import './i18n'
import App from './App.tsx'
import './index.css'

// Ask the browser to keep our caches (reduces iOS eviction risk)
navigator.storage?.persist?.()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="suresnap-theme">
    <SettingsProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          dehydrateOptions: {
            shouldDehydrateMutation: (mutation) =>
              mutation.state.isPaused || mutation.state.status === 'pending',
          },
        }}
        onSuccess={() => {
          // Resume all pending mutations after persistence restore.
          // resumePausedMutations() only handles isPaused=true, but mutations
          // that were mid-execution when the PWA was killed by iOS are persisted
          // as {status:'pending', isPaused:false}. Without restarting those,
          // they block the scope queue forever ("zombie" mutations).
          const pending = queryClient.getMutationCache().getAll().filter(
            (m) => m.state.status === 'pending',
          )
          pending.reduce(
            (promise, mutation) =>
              promise.then(() => mutation.continue().catch(() => {})),
            Promise.resolve() as Promise<unknown>,
          ).then(() => {
            queryClient.invalidateQueries()
          })
        }}
      >
        <App />
      </PersistQueryClientProvider>
    </SettingsProvider>
    </ThemeProvider>
  </StrictMode>,
)
