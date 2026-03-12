import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils'
import { TagInput } from '../../components/ui/TagInput'

describe('TagInput', () => {
  it('renders with a label', () => {
    render(<TagInput label="Tags" value={[]} onChange={() => {}} />)
    expect(screen.getByLabelText('Tags')).toBeInTheDocument()
  })

  it('renders existing tags as chips', () => {
    render(<TagInput value={['react', 'typescript']} onChange={() => {}} />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
  })

  it('adds a tag on Enter key', () => {
    const onChange = vi.fn()
    render(<TagInput value={[]} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'python' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['python'])
  })

  it('adds a tag on comma key', () => {
    const onChange = vi.fn()
    render(<TagInput value={[]} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'python' } })
    fireEvent.keyDown(input, { key: ',' })
    expect(onChange).toHaveBeenCalledWith(['python'])
  })

  it('removes a tag when the remove button is clicked', () => {
    const onChange = vi.fn()
    render(<TagInput value={['react', 'typescript']} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove tag react' }))
    expect(onChange).toHaveBeenCalledWith(['typescript'])
  })

  it('removes the last tag on Backspace when input is empty', () => {
    const onChange = vi.fn()
    render(<TagInput value={['react', 'typescript']} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).toHaveBeenCalledWith(['react'])
  })

  it('normalizes tags to lowercase', () => {
    const onChange = vi.fn()
    render(<TagInput value={[]} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'React' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['react'])
  })

  it('does not add duplicate tags', () => {
    const onChange = vi.fn()
    render(<TagInput value={['react']} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'react' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows error text and marks input invalid', () => {
    render(<TagInput value={[]} onChange={() => {}} errorText="At least one tag required" />)
    expect(screen.getByRole('alert')).toHaveTextContent('At least one tag required')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows helper text', () => {
    render(<TagInput value={[]} onChange={() => {}} helperText="Press Enter to add" />)
    expect(screen.getByText('Press Enter to add')).toBeInTheDocument()
  })
})
