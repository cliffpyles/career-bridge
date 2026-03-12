import { ContextBar } from '../components/layout/ContextBar'
import { EmptyState } from '../components/ui/EmptyState'
import { User } from 'lucide-react'
import styles from './PageStyles.module.css'

export function ProfilePage() {
  return (
    <div className={styles.page}>
      <ContextBar breadcrumbs={[{ label: 'Profile' }]} />
      <div className={styles.pageContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.greeting}>Profile</h1>
        </header>
        <EmptyState
          icon={<User size={48} />}
          title="Your professional profile"
          description="Manage your account details and preferences."
        />
      </div>
    </div>
  )
}
