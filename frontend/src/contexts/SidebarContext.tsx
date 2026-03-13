import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const STORAGE_KEY = 'career-bridge-sidebar-collapsed'

function getInitialCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  // Viewport rules take priority over localStorage
  if (window.matchMedia('(max-width: 1279px) and (min-width: 1025px)').matches) return true
  if (window.matchMedia('(min-width: 1280px)').matches) return false
  // Mobile (<1025px): sidebar is hidden anyway, use localStorage
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState<boolean>(getInitialCollapsed)

  const setCollapsed = (v: boolean) => {
    setCollapsedState(v)
    try {
      localStorage.setItem(STORAGE_KEY, String(v))
    } catch {
      // ignore
    }
  }

  const toggle = () => setCollapsed(!collapsed)

  // Responsive sidebar: auto-collapse at tablet, auto-expand at desktop
  useEffect(() => {
    const tablet = window.matchMedia('(max-width: 1279px) and (min-width: 1025px)')
    const desktop = window.matchMedia('(min-width: 1280px)')

    // Apply initial state based on current viewport
    if (tablet.matches) setCollapsed(true)
    if (desktop.matches) setCollapsed(false)

    const onTablet = (e: MediaQueryListEvent) => { if (e.matches) setCollapsed(true) }
    const onDesktop = (e: MediaQueryListEvent) => { if (e.matches) setCollapsed(false) }

    tablet.addEventListener('change', onTablet)
    desktop.addEventListener('change', onDesktop)
    return () => {
      tablet.removeEventListener('change', onTablet)
      desktop.removeEventListener('change', onDesktop)
    }
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
