/**
 * SkillsSectionEditor — skill categories with add/remove/edit.
 */
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import type { SkillCategory, SkillsSection } from '../../../types/resume'
import { SectionWrapper } from './SectionWrapper'
import styles from './EntryList.module.css'

interface CategoryEditorProps {
  category: SkillCategory
  index: number
  onChange: (updated: SkillCategory) => void
  onRemove: () => void
}

function CategoryEditor({ category, index, onChange, onRemove }: CategoryEditorProps) {
  return (
    <div className={styles.entryCard} data-testid="skill-category">
      <div className={styles.entryHeader}>
        <span className={styles.entryIndex}>Category {index + 1}</span>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={onRemove}
          aria-label={`Remove ${category.name}`}
          style={{ color: 'var(--accent-danger)' }}
        />
      </div>
      <Input
        label="Category name"
        value={category.name}
        onChange={(e) => onChange({ ...category, name: e.target.value })}
        placeholder="Frontend, Backend, Infrastructure…"
        required
      />
      <Input
        label="Skills"
        value={category.skills.join(', ')}
        onChange={(e) =>
          onChange({
            ...category,
            skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
          })
        }
        placeholder="React, TypeScript, CSS…"
        helperText="Comma-separated list."
      />
    </div>
  )
}

export interface SkillsSectionEditorProps {
  section: SkillsSection
  onChange: (updated: SkillsSection) => void
}

export function SkillsSectionEditor({ section, onChange }: SkillsSectionEditorProps) {
  function updateCategory(index: number, updated: SkillCategory) {
    const categories = [...section.categories]
    categories[index] = updated
    onChange({ ...section, categories })
  }

  function removeCategory(index: number) {
    onChange({ ...section, categories: section.categories.filter((_, i) => i !== index) })
  }

  function addCategory() {
    onChange({
      ...section,
      categories: [...section.categories, { name: '', skills: [] }],
    })
  }

  return (
    <SectionWrapper title="Skills">
      {section.categories.length === 0 && (
        <p className={styles.emptyHint}>
          Group your skills by category (e.g. Frontend, Backend, Infrastructure).
        </p>
      )}
      {section.categories.map((cat, i) => (
        <CategoryEditor
          key={i}
          category={cat}
          index={i}
          onChange={(updated) => updateCategory(i, updated)}
          onRemove={() => removeCategory(i)}
        />
      ))}
      <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addCategory}>
        Add category
      </Button>
    </SectionWrapper>
  )
}
