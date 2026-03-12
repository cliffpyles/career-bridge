import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils'
import { SlideOver } from '../../components/ui/SlideOver'

describe('SlideOver', () => {
  it('renders panel with title when open', () => {
    render(
      <SlideOver open title="Edit Entry" onClose={() => {}}>
        <p>Content here</p>
      </SlideOver>,
    )
    expect(screen.getByText('Edit Entry')).toBeInTheDocument()
    expect(screen.getByText('Content here')).toBeInTheDocument()
  })

  it('has data-open="true" when open', () => {
    render(
      <SlideOver open title="Panel" onClose={() => {}}>
        Content
      </SlideOver>,
    )
    expect(screen.getByTestId('slideover')).toHaveAttribute('data-open', 'true')
  })

  it('has data-open="false" when closed', () => {
    render(
      <SlideOver open={false} title="Panel" onClose={() => {}}>
        Content
      </SlideOver>,
    )
    expect(screen.getByTestId('slideover')).toHaveAttribute('data-open', 'false')
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(
      <SlideOver open title="Panel" onClose={onClose}>
        Content
      </SlideOver>,
    )
    fireEvent.click(screen.getByTestId('slideover-backdrop'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <SlideOver open title="Panel" onClose={onClose}>
        Content
      </SlideOver>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close panel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(
      <SlideOver open title="Panel" onClose={onClose}>
        Content
      </SlideOver>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders footer when provided', () => {
    render(
      <SlideOver open onClose={() => {}} footer={<button>Save</button>}>
        Content
      </SlideOver>,
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })
})
