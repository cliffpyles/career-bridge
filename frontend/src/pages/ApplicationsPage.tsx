import { ContextBar } from '../components/layout/ContextBar'
import { EmptyState } from '../components/ui/EmptyState'
import { ClipboardList } from 'lucide-react'
import styles from './PageStyles.module.css'

export function ApplicationsPage() {
  return (
    <div className={styles.page}>
      <ContextBar breadcrumbs={[{ label: 'Applications' }]} />
      <div className={styles.pageContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.greeting}>Applications</h1>
        </header>
        <EmptyState
          icon={<ClipboardList size={48} />}
          title="No applications yet"
          description="Track every application through your pipeline. Add notes, link resumes, and log interview events. Coming in Phase 4."
        />
      </div>
    </div>
  )
}
