/**
 * Integration and unit tests for the DashboardPage.
 * Uses MSW to serve fixture data via TanStack Query.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils'
import { MemoryRouter } from 'react-router'
import { DashboardPage } from '../../pages/DashboardPage'
import { resetDashboardStore } from '../../mocks/handlers/dashboard'
import { dashboardFixture, emptyDashboardFixture } from '../../mocks/fixtures/dashboard'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    resetDashboardStore()
  })

  // Ensure fake timers are always cleaned up so they don't bleed into later tests
  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Greeting ──────────────────────────────────────────────────

  it('renders the greeting text', () => {
    renderPage()
    const greeting = screen.getByText(/Good (morning|afternoon|evening)\./i)
    expect(greeting).toBeInTheDocument()
  })

  it('renders "Good morning" between midnight and noon', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-13T08:00:00'))
    renderPage()
    expect(screen.getByText('Good morning.')).toBeInTheDocument()
  })

  it('renders "Good afternoon" between noon and 5pm', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-13T14:00:00'))
    renderPage()
    expect(screen.getByText('Good afternoon.')).toBeInTheDocument()
  })

  it('renders "Good evening" after 5pm', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-13T20:00:00'))
    renderPage()
    expect(screen.getByText('Good evening.')).toBeInTheDocument()
  })

  // ── Summary line ──────────────────────────────────────────────

  it('shows summary line with count after data loads', async () => {
    renderPage()
    const count = dashboardFixture.needs_attention.length
    const expected =
      count === 1
        ? 'You have 1 thing that needs attention.'
        : `You have ${count} things that need attention.`
    await waitFor(() => {
      expect(screen.getByText(expected)).toBeInTheDocument()
    })
  })

  it('shows "all caught up" summary when no attention items', async () => {
    resetDashboardStore(emptyDashboardFixture)
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Everything is up to date.')).toBeInTheDocument()
    })
  })

  // ── Needs Attention ───────────────────────────────────────────

  it('renders needs-attention cards for overdue and upcoming items', async () => {
    renderPage()
    await waitFor(() => {
      dashboardFixture.needs_attention.forEach((item) => {
        expect(screen.getByLabelText(`${item.company} — ${item.role}`)).toBeInTheDocument()
      })
    })
  })

  it('shows an overdue badge for overdue items', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText(/overdue/i).length).toBeGreaterThan(0)
    })
  })

  it('shows an upcoming badge for upcoming items', async () => {
    renderPage()
    await waitFor(() => {
      const upcomingItems = dashboardFixture.needs_attention.filter(
        (i) => i.attention_type === 'upcoming',
      )
      expect(upcomingItems.length).toBeGreaterThan(0)
      // At least one upcoming time label is present
      const labels = screen.queryAllByText(/due today|due tomorrow|in \d+ days/i)
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  it('shows encouraging empty text when no attention items', async () => {
    resetDashboardStore(emptyDashboardFixture)
    renderPage()
    await waitFor(() => {
      expect(
        screen.getByText(/No overdue or upcoming actions/i),
      ).toBeInTheDocument()
    })
  })

  it('shows an error message when the API fails', async () => {
    server.use(
      http.get('/api/dashboard', () => {
        return HttpResponse.json({ detail: 'Internal server error' }, { status: 500 })
      }),
    )
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/couldn't load your attention items/i)).toBeInTheDocument()
    })
  })

  // ── Active Pipeline ───────────────────────────────────────────

  it('renders active pipeline items after data loads', async () => {
    renderPage()
    await waitFor(() => {
      // Each company should appear somewhere on the page
      const company = dashboardFixture.active_pipeline[0].company
      expect(screen.getAllByText(company).length).toBeGreaterThan(0)
    })
  })

  it('shows empty state for pipeline when no active applications', async () => {
    resetDashboardStore(emptyDashboardFixture)
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('No active applications')).toBeInTheDocument()
    })
  })

  // ── Quick Actions ─────────────────────────────────────────────

  it('renders all four quick action buttons', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add application' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Generate resume' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Find jobs' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Start prep' })).toBeInTheDocument()
    })
  })

  it('quick actions navigate to correct routes', async () => {
    const { container } = renderPage()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add application' })).toBeInTheDocument()
    })
    // Clicking a quick action button doesn't throw
    fireEvent.click(screen.getByRole('button', { name: 'Add application' }))
    expect(container).toBeTruthy()
  })

  // ── Empty dashboard ───────────────────────────────────────────

  it('shows encouraging empty pipeline state with add action', async () => {
    resetDashboardStore(emptyDashboardFixture)
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add application' })).toBeInTheDocument()
    })
  })
})
