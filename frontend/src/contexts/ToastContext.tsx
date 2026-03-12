import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { ToastContainer, type ToastData, type ToastVariant } from '../components/ui/Toast'

interface ToastContextValue {
  toast: (data: Omit<ToastData, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = generateId()
    setToasts((prev) => [...prev, { ...data, id }])
  }, [])

  const createVariantToast = useCallback(
    (variant: ToastVariant) =>
      (title: string, description?: string) =>
        toast({ title, description, variant }),
    [toast],
  )

  const value: ToastContextValue = {
    toast,
    success: createVariantToast('success'),
    error: createVariantToast('error'),
    warning: createVariantToast('warning'),
    info: createVariantToast('info'),
    dismiss,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
