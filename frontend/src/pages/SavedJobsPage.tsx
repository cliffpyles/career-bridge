import { ContextBar } from '../components/layout/ContextBar'
import { EmptyState } from '../components/ui/EmptyState'
import { Bookmark } from 'lucide-react'
import styles from './PageStyles.module.css'

export function SavedJobsPage() {
  return (
    <div className={styles.page}>
      <ContextBar breadcrumbs={[{ label: 'Saved Jobs' }]} />
      <div className={styles.pageContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.greeting}>Saved Jobs</h1>
        </header>
        <EmptyState
          icon={<Bookmark size={48} />}
          title="No saved jobs yet"
          description="Save jobs from the Job Board to review later. Coming in Phase 8."
        />
      </div>
    </div>
  )
}
