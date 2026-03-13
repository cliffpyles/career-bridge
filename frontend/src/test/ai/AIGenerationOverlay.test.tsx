/**
 * Tests for AIGenerationOverlay and AISuggestionDiff components.
 *
 * Covers:
 *  AIGenerationOverlay:
 *    - Does not render when open=false
 *    - Renders title, thinking dots, and cancel button when open=true
 *    - Displays streaming text in log area
 *    - Cancel button calls onCancel
 *
 *  AISuggestionDiff:
 *    - Renders AI label and ✦ icon
 *    - Shows original and suggested content
 *    - Accept calls onAccept with current text
 *    - Dismiss calls onDismiss
 *    - Pressing Escape calls onDismiss
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils'
import { AIGenerationOverlay } from '../../components/ui/AIGenerationOverlay'
import { AISuggestionDiff } from '../../components/ui/AISuggestionDiff'

// ── AIGenerationOverlay ───────────────────────────────────────────────────────

describe('AIGenerationOverlay', () => {
  it('does not render anything when open=false', () => {
    render(
      <AIGenerationOverlay open={false} streamText="" onCancel={vi.fn()} />,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders dialog with title when open=true', () => {
    render(
      <AIGenerationOverlay
        open
        streamText=""
        onCancel={vi.fn()}
        title="Generating your resume…"
      />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Generating your resume…')).toBeInTheDocument()
  })

  it('renders the thinking animation dots', () => {
    render(<AIGenerationOverlay open streamText="" onCancel={vi.fn()} />)
    // The "Thinking" label should be present
    expect(screen.getByText('Thinking')).toBeInTheDocument()
  })

  it('renders a cancel button', () => {
    render(<AIGenerationOverlay open streamText="" onCancel={vi.fn()} />)
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('displays streaming text in the log', () => {
    render(
      <AIGenerationOverlay
        open
        streamText="Analyzing your experience library…\nSelecting relevant experiences…"
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText(/Analyzing your experience library/)).toBeInTheDocument()
  })

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<AIGenerationOverlay open streamText="" onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel generation/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel when the footer Cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<AIGenerationOverlay open streamText="" onCancel={onCancel} />)
    // Footer button has text "Cancel"
    const buttons = screen.getAllByRole('button', { name: /cancel/i })
    fireEvent.click(buttons[buttons.length - 1])
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows the ✦ sparkle icon', () => {
    render(<AIGenerationOverlay open streamText="" onCancel={vi.fn()} />)
    expect(screen.getByText('✦')).toBeInTheDocument()
  })
})

// ── AISuggestionDiff ─────────────────────────────────────────────────────────

describe('AISuggestionDiff', () => {
  const defaultProps = {
    original: 'Original text content here.',
    suggestion: 'AI-improved text content here.',
    onAccept: vi.fn(),
    onDismiss: vi.fn(),
  }

  it('renders the AI Suggestion label and sparkle', () => {
    render(<AISuggestionDiff {...defaultProps} />)
    expect(screen.getByText('AI Suggestion')).toBeInTheDocument()
    expect(screen.getByText('✦')).toBeInTheDocument()
  })

  it('renders with a custom label', () => {
    render(<AISuggestionDiff {...defaultProps} label="Rewritten for clarity" />)
    expect(screen.getByText('Rewritten for clarity')).toBeInTheDocument()
  })

  it('shows original text', () => {
    render(<AISuggestionDiff {...defaultProps} />)
    expect(screen.getByText('Original text content here.')).toBeInTheDocument()
  })

  it('shows suggested text', () => {
    render(<AISuggestionDiff {...defaultProps} />)
    expect(screen.getByText('AI-improved text content here.')).toBeInTheDocument()
  })

  it('renders Accept and Dismiss buttons', () => {
    render(<AISuggestionDiff {...defaultProps} />)
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
  })

  it('calls onAccept when Accept is clicked', () => {
    const onAccept = vi.fn()
    render(<AISuggestionDiff {...defaultProps} onAccept={onAccept} />)
    fireEvent.click(screen.getByRole('button', { name: /accept/i }))
    expect(onAccept).toHaveBeenCalledWith('AI-improved text content here.')
  })

  it('calls onDismiss when Dismiss is clicked', () => {
    const onDismiss = vi.fn()
    render(<AISuggestionDiff {...defaultProps} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('calls onDismiss when Escape is pressed in the editable area', () => {
    const onDismiss = vi.fn()
    render(<AISuggestionDiff {...defaultProps} onDismiss={onDismiss} />)
    const editable = screen.getByRole('textbox', { name: /edit suggestion/i })
    fireEvent.keyDown(editable, { key: 'Escape' })
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('hides original text when showOriginal=false', () => {
    render(<AISuggestionDiff {...defaultProps} showOriginal={false} />)
    expect(screen.queryByText('Original text content here.')).toBeNull()
  })

  it('shows hint text to click and edit', () => {
    render(<AISuggestionDiff {...defaultProps} />)
    expect(screen.getByText(/click to edit/i)).toBeInTheDocument()
  })
})
