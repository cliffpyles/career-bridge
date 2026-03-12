import { ContextBar } from '../components/layout/ContextBar'
import styles from './PageStyles.module.css'

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <ContextBar title="Dashboard" />
      <div className={styles.pageContent}>
        <header className={styles.pageHeader} style={{ animationDelay: '0ms' }}>
          <h1 className={styles.greeting}>Good morning.</h1>
          <p className={styles.subline}>Your career command center.</p>
        </header>
        <section className={styles.section} style={{ animationDelay: '100ms' }}>
          <p className={styles.placeholder}>Dashboard content coming in Phase 5.</p>
        </section>
      </div>
    </div>
  )
}
