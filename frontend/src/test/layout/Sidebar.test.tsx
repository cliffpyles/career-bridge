import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../utils'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { Sidebar } from '../../components/layout/Sidebar'
import { SidebarProvider } from '../../contexts/SidebarContext'

function SidebarWrapper() {
  return (
    <SidebarProvider>
      <Sidebar />
    </SidebarProvider>
  )
}

function renderWithRouter(initialEntry = '/') {
  const router = createMemoryRouter(
    [{ path: '*', Component: SidebarWrapper }],
    { initialEntries: [initialEntry] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  it('renders navigation', () => {
    renderWithRouter()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('renders all nav items', () => {
    renderWithRouter()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Job Board')).toBeInTheDocument()
    expect(screen.getByText('Applications')).toBeInTheDocument()
    expect(screen.getByText('Resumes')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Interviews')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('shows Career Bridge wordmark', () => {
    renderWithRouter()
    expect(screen.getByText('Career Bridge')).toBeInTheDocument()
  })

  it('collapses when toggle button is clicked', () => {
    renderWithRouter()
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' })
    fireEvent.click(toggle)
    expect((screen.getByTestId('sidebar') as HTMLElement).className).toMatch(/collapsed/)
  })

  it('expands when toggle is clicked again', () => {
    renderWithRouter()
    // First collapse
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect((screen.getByTestId('sidebar') as HTMLElement).className).toMatch(/collapsed/)
    // Then expand
    fireEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    // After expanding, the sidebar should not have the collapsed class
    // The button label should now be 'Collapse sidebar' again
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument()
  })

  it('marks active route', () => {
    renderWithRouter('/settings')
    const settingsLink = screen.getByRole('link', { name: 'Settings' })
    expect((settingsLink as HTMLElement).className).toMatch(/active/)
  })
})
