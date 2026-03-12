import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils'
import { Input } from '../../components/ui/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders helper text', () => {
    render(<Input label="Email" helperText="We'll never share your email." />)
    expect(screen.getByText("We'll never share your email.")).toBeInTheDocument()
  })

  it('renders error text with role alert', () => {
    render(<Input label="Email" errorText="Invalid email address" />)
    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent('Invalid email address')
  })

  it('hides helper text when error is shown', () => {
    render(<Input label="Email" helperText="Helper" errorText="Error" />)
    expect(screen.queryByText('Helper')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Error')
  })

  it('calls onChange when typing', () => {
    const handleChange = vi.fn()
    render(<Input label="Name" onChange={handleChange} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Cliff' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('marks input as invalid when error is present', () => {
    render(<Input label="Email" errorText="Required" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders disabled state', () => {
    render(<Input label="Read only" disabled />)
    expect(screen.getByLabelText('Read only')).toBeDisabled()
  })
})
