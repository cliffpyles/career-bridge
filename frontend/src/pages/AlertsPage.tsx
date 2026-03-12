import { ContextBar } from '../components/layout/ContextBar'
import { EmptyState } from '../components/ui/EmptyState'
import { Bell } from 'lucide-react'
import styles from './PageStyles.module.css'

export function AlertsPage() {
  return (
    <div className={styles.page}>
      <ContextBar breadcrumbs={[{ label: 'Alerts' }]} />
      <div className={styles.pageContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.greeting}>Alerts</h1>
        </header>
        <EmptyState
          icon={<Bell size={48} />}
          title="No job alerts configured"
          description="Set up saved searches to get notified when new jobs match your criteria. Coming in Phase 10."
        />
      </div>
    </div>
  )
}
