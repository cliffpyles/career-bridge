import { ContextBar } from '../components/layout/ContextBar'
import { EmptyState } from '../components/ui/EmptyState'
import { GraduationCap } from 'lucide-react'
import styles from './PageStyles.module.css'

export function InterviewsPage() {
  return (
    <div className={styles.page}>
      <ContextBar breadcrumbs={[{ label: 'Interviews' }]} />
      <div className={styles.pageContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.greeting}>Interview Prep</h1>
        </header>
        <EmptyState
          icon={<GraduationCap size={48} />}
          title="Be ready for every interview"
          description="Create prep plans with AI-generated study guides, practice quizzes, and structured talking points. Coming in Phase 9."
        />
      </div>
    </div>
  )
}
