/**
 * ExperienceSectionEditor — list of work experience entries with add/edit/remove.
 */
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { TextArea } from '../../ui/TextArea'
import type { ExperienceEntry, ExperienceSection } from '../../../types/resume'
import { SectionWrapper } from './SectionWrapper'
import styles from './EntryList.module.css'

function generateId() {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyEntry(): ExperienceEntry {
  return {
    id: generateId(),
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    current: false,
    bullets: [''],
  }
}

interface EntryEditorProps {
  entry: ExperienceEntry
  index: number
  total: number
  onChange: (updated: ExperienceEntry) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onImport: () => void
}

function ExperienceEntryEditor({
  entry,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onImport,
}: EntryEditorProps) {
  function set<K extends keyof ExperienceEntry>(key: K, value: ExperienceEntry[K]) {
    onChange({ ...entry, [key]: value })
  }

  function setBullet(i: number, value: string) {
    const bullets = [...entry.bullets]
    bullets[i] = value
    onChange({ ...entry, bullets })
  }

  function addBullet() {
    onChange({ ...entry, bullets: [...entry.bullets, ''] })
  }

  function removeBullet(i: number) {
    onChange({ ...entry, bullets: entry.bullets.filter((_, idx) => idx !== i) })
  }

  return (
    <div className={styles.entryCard} data-testid="experience-entry">
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

      <div className={styles.fieldGrid2}>
        <Input
          label="Job title"
          value={entry.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Senior Software Engineer"
          required
        />
        <Input
          label="Company"
          value={entry.company}
          onChange={(e) => set('company', e.target.value)}
          placeholder="Acme Corp"
          required
        />
      </div>

      <div className={styles.fieldGrid3}>
        <Input
          label="Location"
          value={entry.location ?? ''}
          onChange={(e) => set('location', e.target.value || undefined)}
          placeholder="Remote"
        />
        <Input
          label="Start"
          value={entry.start_date ?? ''}
          onChange={(e) => set('start_date', e.target.value || undefined)}
          placeholder="2022-01"
        />
        <Input
          label="End"
          value={entry.current ? '' : (entry.end_date ?? '')}
          onChange={(e) => set('end_date', e.target.value || undefined)}
          placeholder="2024-06"
          disabled={entry.current}
          helperText={entry.current ? 'Current role' : 'Leave blank = Present'}
        />
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={entry.current ?? false}
          onChange={(e) => set('current', e.target.checked)}
        />
        <span>I currently work here</span>
      </label>

      <div className={styles.bulletsArea}>
        <p className={styles.bulletsLabel}>Bullet points</p>
        {entry.bullets.map((bullet, i) => (
          <div key={i} className={styles.bulletRow}>
            <TextArea
              value={bullet}
              onChange={(e) => setBullet(i, e.target.value)}
              rows={2}
              placeholder="Led a team of 4 engineers to ship…"
              aria-label={`Bullet ${i + 1}`}
            />
            {entry.bullets.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 size={13} />}
                onClick={() => removeBullet(i)}
                aria-label={`Remove bullet ${i + 1}`}
                style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '22px' }}
              />
            )}
          </div>
        ))}
        <div className={styles.bulletActions}>
          <Button variant="ghost" size="sm" icon={<Plus size={13} />} onClick={addBullet}>
            Add bullet
          </Button>
          <Button variant="ghost" size="sm" onClick={onImport} style={{ color: 'var(--accent-primary)' }}>
            Import from library
          </Button>
        </div>
      </div>
    </div>
  )
}

export interface ExperienceSectionEditorProps {
  section: ExperienceSection
  onChange: (updated: ExperienceSection) => void
  onImport: (entryId: string) => void
}

export function ExperienceSectionEditor({
  section,
  onChange,
  onImport,
}: ExperienceSectionEditorProps) {
  function updateEntry(index: number, updated: ExperienceEntry) {
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
    <SectionWrapper title="Experience">
      {section.entries.length === 0 && (
        <p className={styles.emptyHint}>
          Add your work history. The most recent role appears first.
        </p>
      )}
      {section.entries.map((entry, i) => (
        <ExperienceEntryEditor
          key={entry.id}
          entry={entry}
          index={i}
          total={section.entries.length}
          onChange={(updated) => updateEntry(i, updated)}
          onRemove={() => removeEntry(i)}
          onMoveUp={() => moveEntry(i, i - 1)}
          onMoveDown={() => moveEntry(i, i + 1)}
          onImport={() => onImport(entry.id)}
        />
      ))}
      <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addEntry}>
        Add experience
      </Button>
    </SectionWrapper>
  )
}
