import { ContextBar } from '../components/layout/ContextBar'
import { EmptyState } from '../components/ui/EmptyState'
import { Library } from 'lucide-react'
import styles from './PageStyles.module.css'

export function ExperiencePage() {
  return (
    <div className={styles.page}>
      <ContextBar breadcrumbs={[{ label: 'Experience' }]} />
      <div className={styles.pageContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.greeting}>Experience Library</h1>
        </header>
        <EmptyState
          icon={<Library size={48} />}
          title="Build your career database"
          description="Document your projects, roles, skills, and achievements. The more detail you add, the better AI can tailor your resumes. Coming in Phase 2."
        />
      </div>
    </div>
  )
}
