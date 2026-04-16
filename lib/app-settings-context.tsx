'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Layout = 'pill' | 'vertical'

interface AppSettings {
  showSidebarToggles: boolean
  setShowSidebarToggles: (v: boolean) => void
  layout: Layout
  setLayout: (v: Layout) => void
}

const AppSettingsContext = createContext<AppSettings>({
  showSidebarToggles: true,
  setShowSidebarToggles: () => {},
  layout: 'pill',
  setLayout: () => {},
})

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [showSidebarToggles, setRawToggles] = useState(true)
  const [layout, setRawLayout] = useState<Layout>('pill')

  useEffect(() => {
    const t = localStorage.getItem('showSidebarToggles')
    if (t !== null) setRawToggles(t === 'true')
    const l = localStorage.getItem('layout')
    if (l === 'pill' || l === 'vertical') setRawLayout(l)
  }, [])

  function setShowSidebarToggles(v: boolean) {
    setRawToggles(v)
    localStorage.setItem('showSidebarToggles', String(v))
  }

  function setLayout(v: Layout) {
    setRawLayout(v)
    localStorage.setItem('layout', v)
  }

  return (
    <AppSettingsContext.Provider value={{ showSidebarToggles, setShowSidebarToggles, layout, setLayout }}>
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  return useContext(AppSettingsContext)
}
