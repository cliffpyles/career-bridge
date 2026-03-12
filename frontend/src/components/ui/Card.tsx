import { forwardRef, type HTMLAttributes } from 'react'
import styles from './Card.module.css'

export type CardStatus = 'default' | 'success' | 'warning' | 'danger' | 'accent'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  status?: CardStatus
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ status = 'default', hoverable = false, padding = 'md', children, className, ...props }, ref) => {
    const classes = [
      styles.card,
      styles[`status_${status}`],
      hoverable && styles.hoverable,
      styles[`padding_${padding}`],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'
