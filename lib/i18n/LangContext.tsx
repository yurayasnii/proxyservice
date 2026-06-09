'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { uk, en, Lang, Translations } from './translations'

interface LangContextType {
  lang: Lang
  t: Translations
  setLang: (l: Lang) => void
  toggle: () => void
}

const LangContext = createContext<LangContextType>({
  lang: 'uk', t: uk,
  setLang: () => {},
  toggle: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('uk')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved === 'uk' || saved === 'en') setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  function toggle() { setLang(lang === 'uk' ? 'en' : 'uk') }

  const t = lang === 'en' ? en : uk

  return (
    <LangContext.Provider value={{ lang, t, setLang, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() { return useContext(LangContext) }
