import { describe, it, expect } from 'vitest'
import { render, screen } from '../utils'
import { Card } from '../../components/ui/Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies hoverable class when hoverable prop is set', () => {
    const { container } = render(<Card hoverable>Hoverable</Card>)
    expect((container.firstChild as HTMLElement).className).toMatch(/hoverable/)
  })

  it('applies status border class', () => {
    const { container } = render(<Card status="warning">Warning card</Card>)
    expect((container.firstChild as HTMLElement).className).toMatch(/status_warning/)
  })

  it('applies default padding by default', () => {
    const { container } = render(<Card>Default</Card>)
    expect((container.firstChild as HTMLElement).className).toMatch(/padding_md/)
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom">Content</Card>)
    expect(container.firstChild).toHaveClass('custom')
  })
})
