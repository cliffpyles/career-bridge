/**
 * SectionWrapper — shared accordion-style container for each resume section editor.
 */
import { type ReactNode, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import styles from './SectionWrapper.module.css'

export interface SectionWrapperProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function SectionWrapper({ title, children, defaultOpen = true }: SectionWrapperProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.toggleTitle}>{title}</span>
        {open ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
      </button>
      {open && <div className={styles.body}>{children}</div>}
    </div>
  )
}
