import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const STORAGE_KEY = 'career-bridge-sidebar-collapsed'

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const setCollapsed = (v: boolean) => {
    setCollapsedState(v)
    try {
      localStorage.setItem(STORAGE_KEY, String(v))
    } catch {
      // ignore
    }
  }

  const toggle = () => setCollapsed(!collapsed)

  // Auto-collapse on medium screens (1024–1279px)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1279px) and (min-width: 1024px)')
    if (mq.matches) setCollapsed(true)
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setCollapsed(true)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
