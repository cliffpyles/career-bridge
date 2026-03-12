import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router'
import { EmptyState } from '../components/ui/EmptyState'
import { AlertCircle } from 'lucide-react'
import styles from './PageStyles.module.css'

export function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  let message = "Something went wrong on our end. Your work is safe — please try again."

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      message = "This page doesn't exist."
    } else {
      message = error.statusText || message
    }
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageContent}>
        <EmptyState
          icon={<AlertCircle size={48} />}
          title="Something went wrong"
          description={message}
          action={{ label: 'Go to Dashboard', onClick: () => navigate('/') }}
        />
      </div>
    </div>
  )
}
