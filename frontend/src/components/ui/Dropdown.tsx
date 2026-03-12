import {
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type MouseEvent,
} from 'react'
import styles from './Dropdown.module.css'

export interface DropdownItem {
  id: string
  label: string
  icon?: ReactNode
  variant?: 'default' | 'danger'
  disabled?: boolean
  onClick?: () => void
}

export interface DropdownSeparator {
  id: string
  type: 'separator'
}

export interface DropdownProps {
  trigger: ReactNode
  items: (DropdownItem | DropdownSeparator)[]
  align?: 'left' | 'right'
}

function isSeparator(item: DropdownItem | DropdownSeparator): item is DropdownSeparator {
  return (item as DropdownSeparator).type === 'separator'
}

export function Dropdown({ trigger, items, align = 'left' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleOutside = (e: globalThis.MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  const handleItemClick = (item: DropdownItem, e: MouseEvent) => {
    e.stopPropagation()
    if (item.disabled) return
    item.onClick?.()
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <div onClick={() => setOpen((v) => !v)} className={styles.trigger}>
        {trigger}
      </div>
      {open && (
        <div
          className={`${styles.menu} ${align === 'right' ? styles.alignRight : ''}`}
          role="menu"
          data-testid="dropdown-menu"
        >
          {items.map((item) =>
            isSeparator(item) ? (
              <hr key={item.id} className={styles.separator} role="separator" />
            ) : (
              <button
                key={item.id}
                className={`${styles.item} ${item.variant === 'danger' ? styles.danger : ''}`}
                role="menuitem"
                disabled={item.disabled}
                onClick={(e) => handleItemClick(item, e)}
              >
                {item.icon && (
                  <span className={styles.icon} aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
