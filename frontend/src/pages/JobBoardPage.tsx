import { ContextBar } from '../components/layout/ContextBar'
import { EmptyState } from '../components/ui/EmptyState'
import { Briefcase } from 'lucide-react'
import styles from './PageStyles.module.css'

export function JobBoardPage() {
  return (
    <div className={styles.page}>
      <ContextBar breadcrumbs={[{ label: 'Job Board' }]} />
      <div className={styles.pageContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.greeting}>Job Board</h1>
        </header>
        <EmptyState
          icon={<Briefcase size={48} />}
          title="Job search coming soon"
          description="Browse and search for jobs, see match scores, and start applications. Coming in Phase 8."
        />
      </div>
    </div>
  )
}
