import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import ar from './ar.json'

const storedLang = (() => {
  try {
    const raw = localStorage.getItem('suresnap-settings')
    if (raw) return JSON.parse(raw).language as string | undefined
  } catch {
    // ignore
  }
  return undefined
})()

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: storedLang || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
