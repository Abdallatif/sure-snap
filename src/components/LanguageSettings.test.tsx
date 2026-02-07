import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSettings } from './LanguageSettings'
import { createWrapper } from '@/test/helpers'

describe('LanguageSettings', () => {
  // F8-AC2: English is default
  it('shows English and Arabic buttons', () => {
    render(<LanguageSettings />, { wrapper: createWrapper() })
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('العربية')).toBeInTheDocument()
  })

  // F8-AC3: Arabic switches layout to RTL
  it('switches to Arabic and sets RTL', async () => {
    const user = userEvent.setup()
    render(<LanguageSettings />, { wrapper: createWrapper() })
    await user.click(screen.getByText('العربية'))
    // The SettingsContext effect sets dir on documentElement
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')
  })

  it('switches back to English and sets LTR', async () => {
    const user = userEvent.setup()
    render(<LanguageSettings />, {
      wrapper: createWrapper({ settings: { language: 'ar' as const } }),
    })
    await user.click(screen.getByText('English'))
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.documentElement.lang).toBe('en')
  })

  // F8-AC4: language setting persists
  it('persists language to localStorage', async () => {
    const user = userEvent.setup()
    render(<LanguageSettings />, { wrapper: createWrapper() })
    await user.click(screen.getByText('العربية'))
    const stored = JSON.parse(localStorage.getItem('suresnap-settings')!)
    expect(stored.language).toBe('ar')
  })
})
