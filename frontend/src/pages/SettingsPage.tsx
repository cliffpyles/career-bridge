import { useNavigate } from 'react-router'
import { ContextBar } from '../components/layout/ContextBar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { useTheme, type Theme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { LogOut, Moon, Monitor, Sun } from 'lucide-react'
import styles from './PageStyles.module.css'
import settingsStyles from './SettingsPage.module.css'

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={18} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={18} /> },
  { value: 'system', label: 'System', icon: <Monitor size={18} /> },
]

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { success } = useToast()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    success('Theme updated', `Switched to ${newTheme} mode.`)
  }

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.page}>
      <ContextBar breadcrumbs={[{ label: 'Settings' }]} />
      <div className={styles.pageContent}>
        <header className={styles.pageHeader} style={{ animationDelay: '0ms' }}>
          <h1 className={styles.greeting}>Settings</h1>
          <p className={styles.subline}>Configure your Career Bridge experience.</p>
        </header>

        <section className={styles.section} style={{ animationDelay: '100ms' }}>
          <Card>
            <h2 className={settingsStyles.sectionTitle}>Appearance</h2>
            <p className={settingsStyles.sectionDesc}>Choose how Career Bridge looks to you.</p>

            <div className={settingsStyles.themeOptions}>
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`${settingsStyles.themeOption} ${theme === opt.value ? settingsStyles.themeOptionActive : ''}`}
                  onClick={() => handleThemeChange(opt.value)}
                  aria-pressed={theme === opt.value}
                >
                  <span className={settingsStyles.themeIcon} aria-hidden="true">
                    {opt.icon}
                  </span>
                  <span className={settingsStyles.themeLabel}>{opt.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </section>

        <section className={styles.section} style={{ animationDelay: '150ms' }}>
          <Card>
            <h2 className={settingsStyles.sectionTitle}>Account</h2>
            <p className={settingsStyles.sectionDesc}>
              Signed in as <strong>{user?.email}</strong>
              {user?.name ? ` (${user.name})` : ''}
            </p>
            <Button
              variant="secondary"
              icon={<LogOut size={16} />}
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </Card>
        </section>
      </div>
    </div>
  )
}
