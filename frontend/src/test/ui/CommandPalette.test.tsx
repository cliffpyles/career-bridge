import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils'
import { CommandPalette, type CommandItem } from '../../components/ui/CommandPalette'

const items: CommandItem[] = [
  { id: '1', label: 'Dashboard', group: 'Navigation', onSelect: vi.fn() },
  { id: '2', label: 'Add Application', group: 'Actions', onSelect: vi.fn() },
  { id: '3', label: 'Generate Resume', group: 'Actions', onSelect: vi.fn() },
]

describe('CommandPalette', () => {
  it('renders when open', () => {
    render(
      <CommandPalette open onClose={() => {}} items={items} />,
    )
    expect(screen.getByTestId('command-palette')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <CommandPalette open={false} onClose={() => {}} items={items} />,
    )
    expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument()
  })

  it('displays all items initially', () => {
    render(<CommandPalette open onClose={() => {}} items={items} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Add Application')).toBeInTheDocument()
    expect(screen.getByText('Generate Resume')).toBeInTheDocument()
  })

  it('filters items by query', () => {
    render(<CommandPalette open onClose={() => {}} items={items} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'resume' } })
    expect(screen.getByText('Generate Resume')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<CommandPalette open onClose={onClose} items={items} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<CommandPalette open onClose={onClose} items={items} />)
    fireEvent.click(screen.getByTestId('command-palette'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls item onSelect when clicked', () => {
    const onSelect = vi.fn()
    const testItems: CommandItem[] = [
      { id: 'x', label: 'Test Action', onSelect },
    ]
    render(<CommandPalette open onClose={() => {}} items={testItems} />)
    fireEvent.click(screen.getByText('Test Action'))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('shows empty state when no results', () => {
    render(<CommandPalette open onClose={() => {}} items={items} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'xyzzy123' } })
    expect(screen.getByText(/No results/i)).toBeInTheDocument()
  })

  it('navigates with arrow keys', () => {
    render(<CommandPalette open onClose={() => {}} items={items} />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    // second item should be active
    expect(screen.getByText('Add Application').closest('li')).toHaveAttribute('data-active', 'true')
  })
})
