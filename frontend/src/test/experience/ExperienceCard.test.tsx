import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils'
import { ExperienceCard } from '../../components/experience/ExperienceCard'
import { createExperience } from '../../mocks/fixtures/experiences'

describe('ExperienceCard', () => {
  const baseExp = createExperience({
    id: 'card-test-1',
    type: 'PROJECT',
    title: 'Redesigned checkout flow',
    organization: 'Acme Corp',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    description: 'Reduced cart abandonment by 23%.',
    impact_metrics: '23% reduction in cart abandonment',
    tags: ['react', 'typescript'],
  })

  it('renders the entry title', () => {
    render(<ExperienceCard experience={baseExp} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Redesigned checkout flow')).toBeInTheDocument()
  })

  it('renders the organization', () => {
    render(<ExperienceCard experience={baseExp} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders the type badge', () => {
    render(<ExperienceCard experience={baseExp} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Project')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<ExperienceCard experience={baseExp} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Reduced cart abandonment by 23%.')).toBeInTheDocument()
  })

  it('renders the impact metrics', () => {
    render(<ExperienceCard experience={baseExp} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('23% reduction in cart abandonment')).toBeInTheDocument()
  })

  it('renders all tags', () => {
    render(<ExperienceCard experience={baseExp} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
  })

  it('calls onEdit when the edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<ExperienceCard experience={baseExp} onEdit={onEdit} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(baseExp)
  })

  it('calls onDelete when the delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<ExperienceCard experience={baseExp} onEdit={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByTestId('experience-delete-btn'))
    expect(onDelete).toHaveBeenCalledWith(baseExp)
  })

  it('renders a SKILL entry without organization', () => {
    const skillExp = createExperience({
      id: 'card-test-skill',
      type: 'SKILL',
      title: 'System Design',
      organization: null,
    })
    render(<ExperienceCard experience={skillExp} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Skill')).toBeInTheDocument()
    expect(screen.getByText('System Design')).toBeInTheDocument()
  })
})
