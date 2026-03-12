import { type FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { ApiError, NetworkError } from '../lib/api-client'
import styles from './LoginPage.module.css'

type Mode = 'login' | 'register'

export function LoginPage() {
  const { isAuthenticated, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, name.trim())
      }
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isUnauthorized()) {
          setError('Incorrect email or password.')
        } else if (err.status === 409) {
          setError('An account with this email already exists.')
        } else {
          setError('Something went wrong on our end. Please try again.')
        }
      } else if (err instanceof NetworkError) {
        setError("Couldn't reach the server. Check your connection and try again.")
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Brand panel */}
      <aside className={styles.brand} aria-hidden="true">
        <div className={styles.brandContent}>
          <span className={styles.brandMark}>◆</span>
          <h1 className={styles.brandName}>Career Bridge</h1>
          <p className={styles.brandTagline}>
            Your career transition,<br />managed with clarity.
          </p>
        </div>
        <div className={styles.brandDecor} />
      </aside>

      {/* Form panel */}
      <main className={styles.formSide}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className={styles.formSubtitle}>
              {mode === 'login'
                ? 'Sign in to continue to Career Bridge.'
                : 'Get started on your career transition.'}
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <Input
                label="Your name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                autoComplete="name"
              />
            )}
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete={mode === 'login' ? 'email' : 'username'}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Choose a strong password' : '••••••••'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />

            {error && (
              <p className={styles.errorMessage} role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className={styles.toggle}>
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  className={styles.toggleLink}
                  onClick={() => switchMode('register')}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className={styles.toggleLink}
                  onClick={() => switchMode('login')}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  )
}
