import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import styles from './CommandPalette.module.css'

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  group?: string
  onSelect: () => void
}

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  items: CommandItem[]
  placeholder?: string
}

export function CommandPalette({
  open,
  onClose,
  items,
  placeholder = 'Search anything...',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = query.trim()
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : items

  // Group items
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const g = item.group ?? 'Results'
    acc[g] = acc[g] ?? []
    acc[g].push(item)
    return acc
  }, {})

  const flatFiltered = Object.values(grouped).flat()

  const handleSelect = useCallback(
    (item: CommandItem) => {
      item.onSelect()
      onClose()
      setQuery('')
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        const item = flatFiltered[activeIndex]
        if (item) handleSelect(item)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, activeIndex, flatFiltered, handleSelect, onClose])

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const active = list.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose} data-testid="command-palette">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <div className={styles.searchRow}>
          <Search size={18} className={styles.searchIcon} aria-hidden="true" />
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder={placeholder}
            aria-label={placeholder}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={
              flatFiltered[activeIndex] ? `cmd-item-${flatFiltered[activeIndex].id}` : undefined
            }
          />
          <kbd className={styles.kbd}>ESC</kbd>
        </div>

        {flatFiltered.length > 0 ? (
          <ul
            ref={listRef}
            id="command-list"
            className={styles.list}
            role="listbox"
          >
            {Object.entries(grouped).map(([group, groupItems]) => (
              <li key={group} className={styles.group} role="presentation">
                <span className={styles.groupLabel}>{group}</span>
                <ul role="group">
                  {groupItems.map((item) => {
                    const globalIndex = flatFiltered.indexOf(item)
                    return (
                      <li
                        key={item.id}
                        id={`cmd-item-${item.id}`}
                        className={`${styles.item} ${globalIndex === activeIndex ? styles.active : ''}`}
                        role="option"
                        aria-selected={globalIndex === activeIndex}
                        data-active={globalIndex === activeIndex}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                        onClick={() => handleSelect(item)}
                      >
                        {item.icon && (
                          <span className={styles.icon} aria-hidden="true">
                            {item.icon}
                          </span>
                        )}
                        <span className={styles.itemContent}>
                          <span className={styles.itemLabel}>{item.label}</span>
                          {item.description && (
                            <span className={styles.itemDescription}>{item.description}</span>
                          )}
                        </span>
                        <ArrowRight size={14} className={styles.arrowIcon} aria-hidden="true" />
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>No results for &ldquo;{query}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  )
}
