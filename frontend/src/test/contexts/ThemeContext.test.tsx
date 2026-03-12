import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../utils'
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext'

function ThemeDisplay() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  )
}

describe('ThemeContext', () => {
  it('defaults to light theme', () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(screen.getByTestId('resolved').textContent).toBe('light')
  })

  it('toggles to dark theme', () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByText('Set Dark'))
    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('applies data-theme attribute to html element', () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByText('Set Light'))
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('throws when used outside provider', async () => {
    const consoleError = console.error
    console.error = () => {}
    // Render ThemeDisplay without any ThemeProvider wrapper
    const { render: baseRender } = await import('@testing-library/react')
    expect(() => baseRender(<ThemeDisplay />)).toThrow('useTheme must be used within ThemeProvider')
    console.error = consoleError
  })
})
