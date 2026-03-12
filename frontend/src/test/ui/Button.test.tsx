import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils'
import { Button } from '../../components/ui/Button'
import { Plus } from 'lucide-react'

describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('renders primary variant', () => {
    const { container } = render(<Button variant="primary">Save</Button>)
    expect((container.firstChild as HTMLElement).className).toMatch(/primary/)
  })

  it('renders secondary variant by default', () => {
    const { container } = render(<Button>Default</Button>)
    expect((container.firstChild as HTMLElement).className).toMatch(/secondary/)
  })

  it('renders ghost variant', () => {
    const { container } = render(<Button variant="ghost">Cancel</Button>)
    expect((container.firstChild as HTMLElement).className).toMatch(/ghost/)
  })

  it('shows loading spinner and disables when loading', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('calls onClick handler', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('renders with leading icon', () => {
    render(<Button icon={<Plus data-testid="icon" />}>With icon</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders full width', () => {
    const { container } = render(<Button fullWidth>Full width</Button>)
    expect((container.firstChild as HTMLElement).className).toMatch(/fullWidth/)
  })

  it('renders sm size', () => {
    const { container } = render(<Button size="sm">Small</Button>)
    expect((container.firstChild as HTMLElement).className).toMatch(/sm/)
  })
})
