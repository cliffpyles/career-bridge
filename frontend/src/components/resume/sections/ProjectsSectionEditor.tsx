/**
 * ProjectsSectionEditor — list of project entries with add/edit/remove.
 */
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { TextArea } from '../../ui/TextArea'
import type { ProjectEntry, ProjectsSection } from '../../../types/resume'
import { SectionWrapper } from './SectionWrapper'
import styles from './EntryList.module.css'

function generateId() {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyEntry(): ProjectEntry {
  return {
    id: generateId(),
    name: '',
    description: '',
    technologies: [],
    url: '',
    bullets: [''],
  }
}

interface ProjectEntryEditorProps {
  entry: ProjectEntry
  index: number
  total: number
  onChange: (updated: ProjectEntry) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onImport: () => void
}

function ProjectEntryEditor({
  entry,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onImport,
}: ProjectEntryEditorProps) {
  function set<K extends keyof ProjectEntry>(key: K, value: ProjectEntry[K]) {
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

  function parseTechs(raw: string) {
    set('technologies', raw.split(',').map((t) => t.trim()).filter(Boolean))
  }

  return (
    <div className={styles.entryCard} data-testid="project-entry">
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
          label="Project name"
          value={entry.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Career Bridge"
          required
        />
        <Input
          label="URL (optional)"
          value={entry.url ?? ''}
          onChange={(e) => set('url', e.target.value || undefined)}
          placeholder="github.com/user/project"
        />
      </div>

      <Input
        label="Technologies"
        value={entry.technologies.join(', ')}
        onChange={(e) => parseTechs(e.target.value)}
        placeholder="React, TypeScript, FastAPI"
        helperText="Comma-separated list."
      />

      <TextArea
        label="Description"
        value={entry.description}
        onChange={(e) => set('description', e.target.value)}
        rows={2}
        placeholder="A brief description of what the project does and your role…"
      />

      <div className={styles.bulletsArea}>
        <p className={styles.bulletsLabel}>Key highlights</p>
        {entry.bullets.map((bullet, i) => (
          <div key={i} className={styles.bulletRow}>
            <TextArea
              value={bullet}
              onChange={(e) => setBullet(i, e.target.value)}
              rows={2}
              placeholder="Built X using Y, resulting in Z…"
              aria-label={`Highlight ${i + 1}`}
            />
            {entry.bullets.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 size={13} />}
                onClick={() => removeBullet(i)}
                aria-label={`Remove highlight ${i + 1}`}
                style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '22px' }}
              />
            )}
          </div>
        ))}
        <div className={styles.bulletActions}>
          <Button variant="ghost" size="sm" icon={<Plus size={13} />} onClick={addBullet}>
            Add highlight
          </Button>
          <Button variant="ghost" size="sm" onClick={onImport} style={{ color: 'var(--accent-primary)' }}>
            Import from library
          </Button>
        </div>
      </div>
    </div>
  )
}

export interface ProjectsSectionEditorProps {
  section: ProjectsSection
  onChange: (updated: ProjectsSection) => void
  onImport: (entryId: string) => void
}

export function ProjectsSectionEditor({
  section,
  onChange,
  onImport,
}: ProjectsSectionEditorProps) {
  function updateEntry(index: number, updated: ProjectEntry) {
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
    <SectionWrapper title="Projects">
      {section.entries.length === 0 && (
        <p className={styles.emptyHint}>
          Showcase personal or open-source projects that demonstrate your skills.
        </p>
      )}
      {section.entries.map((entry, i) => (
        <ProjectEntryEditor
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
        Add project
      </Button>
    </SectionWrapper>
  )
}
