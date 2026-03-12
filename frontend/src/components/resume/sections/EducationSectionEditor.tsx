/**
 * EducationSectionEditor — education entries with add/edit/remove.
 */
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import type { EducationEntry, EducationSection } from '../../../types/resume'
import { SectionWrapper } from './SectionWrapper'
import styles from './EntryList.module.css'

function generateId() {
  return `edu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyEntry(): EducationEntry {
  return {
    id: generateId(),
    institution: '',
    degree: '',
    field: '',
    start_date: '',
    end_date: '',
    gpa: '',
    notes: '',
  }
}

interface EducationEntryEditorProps {
  entry: EducationEntry
  index: number
  total: number
  onChange: (updated: EducationEntry) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function EducationEntryEditor({
  entry,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: EducationEntryEditorProps) {
  function set<K extends keyof EducationEntry>(key: K, value: EducationEntry[K]) {
    onChange({ ...entry, [key]: value })
  }

  return (
    <div className={styles.entryCard} data-testid="education-entry">
      <div className={styles.entryHeader}>
        <span className={styles.entryIndex}>#{index + 1}</span>
        <div className={styles.entryControls}>
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronUp size={14} />}
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move up"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronDown size={14} />}
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Move down"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={onRemove}
            aria-label="Remove entry"
            style={{ color: 'var(--accent-danger)' }}
          />
        </div>
      </div>

      <Input
        label="Institution"
        value={entry.institution}
        onChange={(e) => set('institution', e.target.value)}
        placeholder="University of California, Berkeley"
        required
      />

      <div className={styles.fieldGrid2}>
        <Input
          label="Degree"
          value={entry.degree}
          onChange={(e) => set('degree', e.target.value)}
          placeholder="B.S., M.S., Ph.D."
        />
        <Input
          label="Field of study"
          value={entry.field}
          onChange={(e) => set('field', e.target.value)}
          placeholder="Computer Science"
        />
      </div>

      <div className={styles.fieldGrid3}>
        <Input
          label="Start year"
          value={entry.start_date ?? ''}
          onChange={(e) => set('start_date', e.target.value || undefined)}
          placeholder="2013"
        />
        <Input
          label="End year"
          value={entry.end_date ?? ''}
          onChange={(e) => set('end_date', e.target.value || undefined)}
          placeholder="2017"
        />
        <Input
          label="GPA (optional)"
          value={entry.gpa ?? ''}
          onChange={(e) => set('gpa', e.target.value || undefined)}
          placeholder="3.8"
        />
      </div>
    </div>
  )
}

export interface EducationSectionEditorProps {
  section: EducationSection
  onChange: (updated: EducationSection) => void
}

export function EducationSectionEditor({ section, onChange }: EducationSectionEditorProps) {
  function updateEntry(index: number, updated: EducationEntry) {
    const entries = [...section.entries]
    entries[index] = updated
    onChange({ ...section, entries })
  }

  function removeEntry(index: number) {
    onChange({ ...section, entries: section.entries.filter((_, i) => i !== index) })
  }

  function addEntry() {
    onChange({ ...section, entries: [...section.entries, emptyEntry()] })
  }

  function moveEntry(from: number, to: number) {
    const entries = [...section.entries]
    const [item] = entries.splice(from, 1)
    entries.splice(to, 0, item)
    onChange({ ...section, entries })
  }

  return (
    <SectionWrapper title="Education">
      {section.entries.length === 0 && (
        <p className={styles.emptyHint}>Add your educational background.</p>
      )}
      {section.entries.map((entry, i) => (
        <EducationEntryEditor
          key={entry.id}
          entry={entry}
          index={i}
          total={section.entries.length}
          onChange={(updated) => updateEntry(i, updated)}
          onRemove={() => removeEntry(i)}
          onMoveUp={() => moveEntry(i, i - 1)}
          onMoveDown={() => moveEntry(i, i + 1)}
        />
      ))}
      <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addEntry}>
        Add education
      </Button>
    </SectionWrapper>
  )
}
