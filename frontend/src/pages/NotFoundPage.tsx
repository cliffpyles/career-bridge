import { useNavigate } from 'react-router'
import { EmptyState } from '../components/ui/EmptyState'
import { SearchX } from 'lucide-react'
import styles from './PageStyles.module.css'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.pageContent}>
        <EmptyState
          icon={<SearchX size={48} />}
          title="Page not found"
          description="The page you're looking for doesn't exist or has been moved."
          action={{ label: 'Go to Dashboard', onClick: () => navigate('/') }}
        />
      </div>
    </div>
  )
}
