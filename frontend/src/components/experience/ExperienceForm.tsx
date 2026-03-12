/**
 * ExperienceForm — create/edit form inside a SlideOver panel.
 * Handles both creation (no initial experience) and editing (pre-fills fields).
 * The parent controls remounting via `key` so form state always matches the entry.
 */
import { type FormEvent, useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { SlideOver } from '../ui/SlideOver'
import { TagInput } from '../ui/TagInput'
import { TextArea } from '../ui/TextArea'
import { useCreateExperience, useUpdateExperience } from '../../queries/experiences'
import type {
  Experience,
  ExperienceCreate,
  ExperienceType,
} from '../../types/experience'
import { EXPERIENCE_TYPES, EXPERIENCE_TYPE_LABELS } from '../../types/experience'
import styles from './ExperienceForm.module.css'

const TYPE_OPTIONS = EXPERIENCE_TYPES.map((t) => ({
  value: t,
  label: EXPERIENCE_TYPE_LABELS[t],
}))

interface FormState {
  type: ExperienceType | ''
  title: string
  organization: string
  start_date: string
  end_date: string
  description: string
  impact_metrics: string
  tags: string[]
}

function emptyForm(): FormState {
  return {
    type: '',
    title: '',
    organization: '',
    start_date: '',
    end_date: '',
    description: '',
    impact_metrics: '',
    tags: [],
  }
}

function fromExperience(exp: Experience): FormState {
  return {
    type: exp.type,
    title: exp.title,
    organization: exp.organization ?? '',
    start_date: exp.start_date ?? '',
    end_date: exp.end_date ?? '',
    description: exp.description ?? '',
    impact_metrics: exp.impact_metrics ?? '',
    tags: exp.tags,
  }
}

interface FormErrors {
  type?: string
  title?: string
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.type) errors.type = 'Entry type is required.'
  if (!form.title.trim()) errors.title = 'Title is required.'
  return errors
}

export interface ExperienceFormProps {
  open: boolean
  onClose: () => void
  experience?: Experience
}

export function ExperienceForm({ open, onClose, experience }: ExperienceFormProps) {
  const isEditing = !!experience
  // Lazy initializer — the parent passes a new `key` when open/experience changes,
  // so this always runs fresh and we avoid setState inside an effect.
  const [form, setForm] = useState<FormState>(() =>
    isEditing ? fromExperience(experience) : emptyForm(),
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createMutation = useCreateExperience()
  const updateMutation = useUpdateExperience()
  const isPending = createMutation.isPending || updateMutation.isPending

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const payload: ExperienceCreate = {
      type: form.type as ExperienceType,
      title: form.title.trim(),
      organization: form.organization.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      description: form.description.trim() || null,
      impact_metrics: form.impact_metrics.trim() || null,
      tags: form.tags,
    }

    try {
      setSubmitError(null)
      if (isEditing) {
        await updateMutation.mutateAsync({ id: experience.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch {
      setSubmitError("We couldn't save your entry. Your edits are still here — try again.")
    }
  }

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit entry' : 'Add entry'}
      description={
        isEditing
          ? 'Update this career history entry.'
          : 'Add a project, role, skill, achievement, or certification to your library.'
      }
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="experience-form"
            loading={isPending}
          >
            {isEditing ? 'Save changes' : 'Add entry'}
          </Button>
        </div>
      }
    >
      <form
        id="experience-form"
        onSubmit={handleSubmit}
        className={styles.form}
        noValidate
        aria-label="experience-form"
      >
        {submitError && (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        )}

        <Select
          label="Type"
          value={form.type}
          onChange={(e) => setField('type', e.target.value as ExperienceType | '')}
          errorText={errors.type}
          placeholder="Select a type…"
          options={TYPE_OPTIONS}
          required
        />

        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          errorText={errors.title}
          placeholder="e.g. Senior Frontend Engineer, Built recommendation engine…"
          required
        />

        <Input
          label="Organization"
          value={form.organization}
          onChange={(e) => setField('organization', e.target.value)}
          placeholder="Company, institution, or personal project"
          helperText="Optional — where or for whom this was done."
        />

        <div className={styles.dateRow}>
          <Input
            label="Start date"
            type="date"
            value={form.start_date}
            onChange={(e) => setField('start_date', e.target.value)}
          />
          <Input
            label="End date"
            type="date"
            value={form.end_date}
            onChange={(e) => setField('end_date', e.target.value)}
            helperText="Leave blank if ongoing."
          />
        </div>

        <TextArea
          label="Description"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={4}
          placeholder="Describe what you did, the context, and your contributions…"
          helperText="The more detail, the more effectively AI can tailor your resumes."
        />

        <Input
          label="Impact metrics"
          value={form.impact_metrics}
          onChange={(e) => setField('impact_metrics', e.target.value)}
          placeholder="e.g. Reduced load time by 60%, +$2M ARR, team of 5"
          helperText="Optional — quantify your impact where possible."
        />

        <TagInput
          label="Tags"
          value={form.tags}
          onChange={(tags) => setField('tags', tags)}
          placeholder="Add a skill or topic…"
          helperText="Press Enter or comma to add. Used for filtering and AI matching."
        />
      </form>
    </SlideOver>
  )
}
