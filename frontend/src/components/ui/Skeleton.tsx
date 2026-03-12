import { type HTMLAttributes } from 'react'
import styles from './Skeleton.module.css'

export type SkeletonVariant = 'text' | 'circle' | 'rect'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({
  variant = 'rect',
  width,
  height,
  lines = 1,
  className,
  style,
  ...props
}: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    const lineWidths = ['80%', '100%', '65%', '90%', '75%']
    return (
      <div className={styles.textBlock}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${styles.text} ${className ?? ''}`}
            style={{ width: lineWidths[i % lineWidths.length], ...style }}
            aria-hidden="true"
            {...props}
          />
        ))}
      </div>
    )
  }

  const classes = [
    styles.skeleton,
    variant === 'circle' && styles.circle,
    variant === 'text' && styles.text,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inlineStyle = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    ...style,
  }

  return (
    <div
      className={classes}
      style={inlineStyle}
      aria-hidden="true"
      {...props}
    />
  )
}
