/**
 * ExperiencePicker — modal for selecting experience library entries to import
 * into a resume section. Opens when the user clicks "Import from library".
 */
import { useState } from 'react'
import { Search, Check } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Skeleton } from '../ui/Skeleton'
import { useExperiences } from '../../queries/experiences'
import type { Experience, ExperienceType } from '../../types/experience'
import { EXPERIENCE_TYPE_LABELS, EXPERIENCE_TYPES } from '../../types/experience'
import styles from './ExperiencePicker.module.css'

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...EXPERIENCE_TYPES.map((t) => ({ value: t, label: EXPERIENCE_TYPE_LABELS[t] })),
]

interface ExperienceItemProps {
  experience: Experience
  selected: boolean
  onToggle: () => void
}

function ExperienceItem({ experience, selected, onToggle }: ExperienceItemProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${selected ? styles.itemSelected : ''}`}
      onClick={onToggle}
      aria-pressed={selected}
    >
      <div className={styles.itemCheck}>
        {selected && <Check size={14} aria-hidden />}
      </div>
      <div className={styles.itemBody}>
        <div className={styles.itemHeader}>
          <span className={styles.itemType}>
            {EXPERIENCE_TYPE_LABELS[experience.type]}
          </span>
          {experience.organization && (
            <span className={styles.itemOrg}>{experience.organization}</span>
          )}
        </div>
        <p className={styles.itemTitle}>{experience.title}</p>
        {experience.description && (
          <p className={styles.itemDescription}>{experience.description}</p>
        )}
        {experience.tags.length > 0 && (
          <div className={styles.itemTags}>
            {experience.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="default" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

export interface ExperiencePickerProps {
  open: boolean
  onClose: () => void
  /** Called with the selected Experience objects when the user confirms. */
  onSelect: (experiences: Experience[]) => void
  /** Pre-select entries already linked to the resume. */
  preSelected?: string[]
  /** If set, limits the type filter to relevant types. */
  filterTypes?: ExperienceType[]
  title?: string
}

export function ExperiencePicker({
  open,
  onClose,
  onSelect,
  preSelected = [],
  filterTypes,
  title = 'Import from Experience Library',
}: ExperiencePickerProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ExperienceType | ''>('')
  const [selected, setSelected] = useState<Set<string>>(new Set(preSelected))

  const { data: experiences, isLoading } = useExperiences({
    q: search.trim() || undefined,
    type: typeFilter || undefined,
  })

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const chosen = (experiences ?? []).filter((e) => selected.has(e.id))
    onSelect(chosen)
    onClose()
  }

  const typeOptions = filterTypes
    ? [
        { value: '', label: 'All types' },
        ...filterTypes.map((t) => ({ value: t, label: EXPERIENCE_TYPE_LABELS[t] })),
      ]
    : TYPE_OPTIONS

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Select one or more entries to import into this section."
      size="lg"
    >
      <div className={styles.filters}>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries…"
          leadingIcon={<Search size={15} />}
          aria-label="Search experience library"
          className={styles.searchInput}
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ExperienceType | '')}
          options={typeOptions}
          aria-label="Filter by type"
          className={styles.typeSelect}
        />
      </div>

      <div className={styles.list} role="list" aria-label="Experience entries">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <Skeleton variant="text" style={{ width: '30%' }} />
              <Skeleton variant="text" style={{ width: '70%', marginTop: '6px' }} />
              <Skeleton variant="text" style={{ width: '90%', marginTop: '4px' }} />
            </div>
          ))}

        {!isLoading && experiences?.length === 0 && (
          <p className={styles.empty}>No entries match your filters.</p>
        )}

        {!isLoading &&
          experiences?.map((exp) => (
            <ExperienceItem
              key={exp.id}
              experience={exp}
              selected={selected.has(exp.id)}
              onToggle={() => toggle(exp.id)}
            />
          ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.selectedCount}>
          {selected.size > 0
            ? `${selected.size} selected`
            : 'Select entries to import'}
        </p>
        <div className={styles.footerActions}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={selected.size === 0}
          >
            Import selected
          </Button>
        </div>
      </div>
    </Modal>
  )
}
