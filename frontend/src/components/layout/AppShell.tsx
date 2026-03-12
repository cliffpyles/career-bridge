import { Outlet, useNavigation } from 'react-router'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useSidebar } from '../../contexts/SidebarContext'
import styles from './AppShell.module.css'

export function AppShell() {
  const { collapsed } = useSidebar()
  const navigation = useNavigation()
  const isNavigating = navigation.state !== 'idle'

  return (
    <div className={`${styles.shell} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <Sidebar />

      <main
        className={styles.main}
        data-testid="app-main"
        aria-busy={isNavigating}
      >
        {isNavigating && (
          <div className={styles.progressBar} aria-hidden="true" />
        )}
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
