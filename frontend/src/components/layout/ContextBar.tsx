import { type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import styles from './ContextBar.module.css'

export interface Breadcrumb {
  label: string
  to?: string
}

export interface ContextBarProps {
  breadcrumbs?: Breadcrumb[]
  title?: string
  actions?: ReactNode
}

export function ContextBar({ breadcrumbs, title, actions }: ContextBarProps) {
  const navigate = useNavigate()

  return (
    <div className={styles.contextBar} role="banner">
      <div className={styles.left}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className={styles.breadcrumbItem}>
                {i > 0 && (
                  <ChevronRight
                    size={14}
                    className={styles.separator}
                    aria-hidden="true"
                  />
                )}
                {crumb.to ? (
                  <button
                    className={styles.breadcrumbLink}
                    onClick={() => navigate(crumb.to!)}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span
                    className={styles.breadcrumbCurrent}
                    aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        {title && !breadcrumbs && (
          <h1 className={styles.title}>{title}</h1>
        )}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
