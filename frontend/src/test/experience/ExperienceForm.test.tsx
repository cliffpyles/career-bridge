import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils'
import { ExperienceForm } from '../../components/experience/ExperienceForm'
import { createExperience } from '../../mocks/fixtures/experiences'

describe('ExperienceForm', () => {
  it('renders the create title when no experience is passed', () => {
    render(<ExperienceForm open onClose={vi.fn()} />)
    // The SlideOver title and submit button both say "Add entry"
    // Check for the SlideOver heading specifically
    expect(screen.getByRole('heading', { name: 'Add entry' })).toBeInTheDocument()
  })

  it('renders the edit title when an experience is passed', () => {
    const exp = createExperience({ title: 'My Project' })
    render(<ExperienceForm open onClose={vi.fn()} experience={exp} />)
    expect(screen.getByRole('heading', { name: 'Edit entry' })).toBeInTheDocument()
  })

  it('pre-fills title when editing', () => {
    const exp = createExperience({ title: 'My Existing Project' })
    render(<ExperienceForm open onClose={vi.fn()} experience={exp} />)
    expect(screen.getByDisplayValue('My Existing Project')).toBeInTheDocument()
  })

  it('pre-fills tags when editing', () => {
    const exp = createExperience({ tags: ['react', 'node'] })
    render(<ExperienceForm open onClose={vi.fn()} experience={exp} />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('node')).toBeInTheDocument()
  })

  it('shows validation error when title is empty on submit', async () => {
    render(<ExperienceForm open onClose={vi.fn()} />)
    // Select a type to satisfy that validation
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PROJECT' } })
    // Submit without a title via the submit button
    fireEvent.click(screen.getByRole('button', { name: 'Add entry' }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Title is required.')
    })
  })

  it('shows validation error when type is not selected', async () => {
    render(<ExperienceForm open onClose={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My Entry' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add entry' }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Entry type is required.')
    })
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<ExperienceForm open onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not render when closed', () => {
    render(<ExperienceForm open={false} onClose={vi.fn()} />)
    const slideover = screen.getByTestId('slideover')
    expect(slideover).toHaveAttribute('data-open', 'false')
  })
})
