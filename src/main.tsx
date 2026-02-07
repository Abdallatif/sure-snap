import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persister } from './lib/queryClient'
import { SettingsProvider } from './context/SettingsContext'
import './i18n'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
          queryClient.resumePausedMutations().then(() => {
            queryClient.invalidateQueries()
          })
        }}
      >
        <App />
      </PersistQueryClientProvider>
    </SettingsProvider>
  </StrictMode>,
)
