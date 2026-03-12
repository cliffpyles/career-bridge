import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from './utils'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
import { DashboardPage } from '../pages/DashboardPage'
import { SettingsPage } from '../pages/SettingsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ErrorPage } from '../pages/ErrorPage'

function createTestRouter(initialEntries: string[] = ['/']) {
  return createMemoryRouter(
    [
      {
        path: '/',
        Component: AppShell,
        errorElement: <ErrorPage />,
        children: [
          { index: true, Component: DashboardPage },
          { path: 'settings', Component: SettingsPage },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
    { initialEntries },
  )
}

describe('Router', () => {
  it('renders Dashboard at root path', () => {
    const router = createTestRouter(['/'])
    render(<RouterProvider router={router} />)
    expect(screen.getByText('Good morning.')).toBeInTheDocument()
  })

  it('renders Settings page at /settings', () => {
    const router = createTestRouter(['/settings'])
    render(<RouterProvider router={router} />)
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Configure your Career Bridge experience.')).toBeInTheDocument()
  })

  it('renders 404 page for unknown routes', () => {
    const router = createTestRouter(['/this-does-not-exist'])
    render(<RouterProvider router={router} />)
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('renders AppShell with sidebar', () => {
    const router = createTestRouter(['/'])
    render(<RouterProvider router={router} />)
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('app-main')).toBeInTheDocument()
  })

  it('error boundary renders for component errors', () => {
    function BrokenComponent(): React.ReactElement {
      throw new Error('Test error in component')
    }

    const router = createMemoryRouter(
      [
        {
          path: '/',
          Component: BrokenComponent,
          errorElement: <ErrorPage />,
        },
      ],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={router} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
