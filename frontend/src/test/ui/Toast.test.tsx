import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '../utils'
import { Toast, ToastContainer } from '../../components/ui/Toast'

describe('Toast', () => {
  it('renders toast with title', () => {
    render(
      <Toast
        id="1"
        title="Saved successfully"
        variant="success"
        duration={0}
        onDismiss={() => {}}
      />,
    )
    expect(screen.getByText('Saved successfully')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(
      <Toast
        id="1"
        title="Error"
        description="Something went wrong"
        variant="error"
        duration={0}
        onDismiss={() => {}}
      />,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('calls onDismiss when close button clicked', () => {
    const onDismiss = vi.fn()
    render(
      <Toast
        id="toast-1"
        title="Dismiss me"
        duration={0}
        onDismiss={onDismiss}
      />,
    )
    screen.getByRole('button', { name: 'Dismiss notification' }).click()
    expect(onDismiss).toHaveBeenCalledWith('toast-1')
  })

  it('auto-dismisses after duration', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(
      <Toast
        id="auto-toast"
        title="Auto dismiss"
        duration={1000}
        onDismiss={onDismiss}
      />,
    )
    act(() => vi.advanceTimersByTime(1100))
    expect(onDismiss).toHaveBeenCalledWith('auto-toast')
    vi.useRealTimers()
  })

  it('does not auto-dismiss when duration is 0', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(
      <Toast
        id="no-dismiss"
        title="Persistent"
        duration={0}
        onDismiss={onDismiss}
      />,
    )
    act(() => vi.advanceTimersByTime(10000))
    expect(onDismiss).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})

describe('ToastContainer', () => {
  it('renders all toasts', () => {
    const toasts = [
      { id: '1', title: 'First toast', variant: 'info' as const },
      { id: '2', title: 'Second toast', variant: 'success' as const },
    ]
    render(<ToastContainer toasts={toasts} onDismiss={() => {}} />)
    expect(screen.getByText('First toast')).toBeInTheDocument()
    expect(screen.getByText('Second toast')).toBeInTheDocument()
  })

  it('renders empty container with no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} onDismiss={() => {}} />)
    expect(container.firstChild).toBeInTheDocument()
    expect(container.querySelectorAll('[data-testid="toast"]')).toHaveLength(0)
  })
})
