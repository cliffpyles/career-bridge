import { ContextBar } from '../components/layout/ContextBar'
import { EmptyState } from '../components/ui/EmptyState'
import { FileText } from 'lucide-react'
import styles from './PageStyles.module.css'

export function ResumesPage() {
  return (
    <div className={styles.page}>
      <ContextBar breadcrumbs={[{ label: 'Resumes' }]} />
      <div className={styles.pageContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.greeting}>Resumes</h1>
        </header>
        <EmptyState
          icon={<FileText size={48} />}
          title="Your resume library is a blank canvas"
          description="Start with one resume and evolve it as you discover what works. Build tailored versions with AI. Coming in Phase 3."
        />
      </div>
    </div>
  )
}
