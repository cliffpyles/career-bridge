/**
 * Integration tests for the ExperiencePage.
 * Uses MSW to serve fixture data via TanStack Query.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '../utils'
import { MemoryRouter } from 'react-router'
import { ExperiencePage } from '../../pages/ExperiencePage'
import { resetExperienceStore } from '../../mocks/handlers/experiences'
import { experienceFixtures } from '../../mocks/fixtures/experiences'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'

function renderPage() {
  return render(
    <MemoryRouter>
      <ExperiencePage />
    </MemoryRouter>,
  )
}

describe('ExperiencePage', () => {
  beforeEach(() => {
    resetExperienceStore()
  })

  it('shows the page title', () => {
    renderPage()
    expect(screen.getByText('Experience Library')).toBeInTheDocument()
  })

  it('renders experience cards after data loads', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByTestId('experience-card')).toHaveLength(experienceFixtures.length)
    })
  })

  it('renders each experience title', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Redesigned checkout flow')).toBeInTheDocument()
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument()
    })
  })

  it('shows the empty state when there are no entries', async () => {
    resetExperienceStore([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Build your career database')).toBeInTheDocument()
    })
  })

  it('shows the empty state action button for new entries', async () => {
    resetExperienceStore([])
    renderPage()
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Add your first entry' })).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('opens the create form when top-level Add entry button is clicked', async () => {
    renderPage()
    await waitFor(() => screen.getAllByTestId('experience-card'))
    // The ContextBar action button (not the form submit button)
    const addBtns = screen.getAllByRole('button', { name: 'Add entry' })
    // Click the first one (the ContextBar action)
    fireEvent.click(addBtns[0])
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Add entry' })).toBeInTheDocument()
    })
  })

  it('opens the edit form when the Edit button on a card is clicked', async () => {
    renderPage()
    await waitFor(() => screen.getAllByTestId('experience-card'))
    const editBtns = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editBtns[0])
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Edit entry' })).toBeInTheDocument()
    })
  })

  it('shows delete confirmation modal when delete button is clicked', async () => {
    renderPage()
    await waitFor(() => screen.getAllByTestId('experience-card'))
    const deleteBtns = screen.getAllByTestId('experience-delete-btn')
    fireEvent.click(deleteBtns[0])
    await waitFor(() => {
      expect(screen.getByText('Remove entry')).toBeInTheDocument()
    })
  })

  it('removes the entry after confirming delete', async () => {
    renderPage()
    await waitFor(() => screen.getAllByTestId('experience-card'))
    const initialCount = screen.getAllByTestId('experience-card').length

    const deleteBtns = screen.getAllByTestId('experience-delete-btn')
    fireEvent.click(deleteBtns[0])

    await waitFor(() => screen.getByText('Remove entry'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

    await waitFor(() => {
      expect(screen.getAllByTestId('experience-card')).toHaveLength(initialCount - 1)
    })
  })

  it('filters entries by type when type filter is changed', async () => {
    renderPage()
    await waitFor(() => screen.getAllByTestId('experience-card'))

    // The type filter Select is the one outside the (closed) SlideOver
    // The page content area has aria-label="Filter experiences"
    const filterBar = screen.getByRole('search', { name: 'Filter experiences' })
    const typeSelect = within(filterBar).getByRole('combobox')
    fireEvent.change(typeSelect, { target: { value: 'PROJECT' } })

    await waitFor(() => {
      const cards = screen.getAllByTestId('experience-card')
      expect(cards.length).toBeLessThan(experienceFixtures.length)
    })
  })

  it('shows empty state with "Clear filters" when filter yields no results', async () => {
    server.use(
      http.get('/api/experiences', ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('type') === 'CERTIFICATION') {
          return HttpResponse.json([])
        }
        return HttpResponse.json(experienceFixtures)
      }),
    )

    renderPage()
    await waitFor(() => screen.getAllByTestId('experience-card'))

    const filterBar = screen.getByRole('search', { name: 'Filter experiences' })
    const typeSelect = within(filterBar).getByRole('combobox')
    fireEvent.change(typeSelect, { target: { value: 'CERTIFICATION' } })

    await waitFor(() => {
      expect(screen.getByText('No entries match your filters')).toBeInTheDocument()
    })
  })

  it('shows an error message when the API fails', async () => {
    server.use(
      http.get('/api/experiences', () => {
        return HttpResponse.json({ detail: 'Internal server error' }, { status: 500 })
      }),
    )

    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent("couldn't load your experience library")
    })
  })

  it('clears filters when Clear filters button is clicked', async () => {
    renderPage()
    await waitFor(() => screen.getAllByTestId('experience-card'))

    const filterBar = screen.getByRole('search', { name: 'Filter experiences' })
    const typeSelect = within(filterBar).getByRole('combobox')
    fireEvent.change(typeSelect, { target: { value: 'PROJECT' } })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    await waitFor(() => {
      expect(typeSelect).toHaveValue('')
    })
  })
})
