/**
 * ApplicationForm — create/edit form inside a SlideOver panel.
 * Handles both creation and editing. Links to resume library.
 */
import { type FormEvent, useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { SlideOver } from '../ui/SlideOver'
import { TextArea } from '../ui/TextArea'
import { useCreateApplication, useUpdateApplication } from '../../queries/applications'
import { useResumes } from '../../queries/resumes'
import type { Application, ApplicationCreate, ApplicationStatus } from '../../types/application'
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUSES } from '../../types/application'
import styles from './ApplicationForm.module.css'

const STATUS_OPTIONS = APPLICATION_STATUSES.map((s) => ({
  value: s,
  label: APPLICATION_STATUS_LABELS[s],
}))

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

interface FormState {
  company: string
  role: string
  url: string
  status: ApplicationStatus
  applied_date: string
  next_action: string
  next_action_date: string
  resume_id: string
  notes: string
}

function emptyForm(): FormState {
  return {
    company: '',
    role: '',
    url: '',
    status: 'APPLIED',
    applied_date: todayStr(),
    next_action: '',
    next_action_date: '',
    resume_id: '',
    notes: '',
  }
}

function fromApplication(app: Application): FormState {
  return {
    company: app.company,
    role: app.role,
    url: app.url ?? '',
    status: app.status,
    applied_date: app.applied_date,
    next_action: app.next_action ?? '',
    next_action_date: app.next_action_date ?? '',
    resume_id: app.resume_id ?? '',
    notes: app.notes ?? '',
  }
}

interface FormErrors {
  company?: string
  role?: string
  applied_date?: string
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.company.trim()) errors.company = 'Company name is required.'
  if (!form.role.trim()) errors.role = 'Role title is required.'
  if (!form.applied_date) errors.applied_date = 'Application date is required.'
  return errors
}

export interface ApplicationPrefill {
  company?: string
  role?: string
  url?: string
}

export interface ApplicationFormProps {
  open: boolean
  onClose: () => void
  application?: Application
  prefill?: ApplicationPrefill
}

export function ApplicationForm({ open, onClose, application, prefill }: ApplicationFormProps) {
  const isEditing = !!application
  const [form, setForm] = useState<FormState>(() => {
    if (isEditing) return fromApplication(application)
    const base = emptyForm()
    if (prefill) {
      return {
        ...base,
        company: prefill.company ?? base.company,
        role: prefill.role ?? base.role,
        url: prefill.url ?? base.url,
      }
    }
    return base
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createMutation = useCreateApplication()
  const updateMutation = useUpdateApplication()
  const { data: resumes } = useResumes()
  const isPending = createMutation.isPending || updateMutation.isPending

  const resumeOptions = [
    { value: '', label: 'No resume linked' },
    ...(resumes ?? []).map((r) => ({ value: r.id, label: `${r.name} (v${r.version})` })),
  ]

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

    const payload: ApplicationCreate = {
      company: form.company.trim(),
      role: form.role.trim(),
      url: form.url.trim() || null,
      status: form.status,
      applied_date: form.applied_date,
      next_action: form.next_action.trim() || null,
      next_action_date: form.next_action_date || null,
      resume_id: form.resume_id || null,
      notes: form.notes.trim() || null,
    }

    try {
      setSubmitError(null)
      if (isEditing) {
        await updateMutation.mutateAsync({ id: application.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch {
      setSubmitError("We couldn't save your application. Your edits are still here — try again.")
    }
  }

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit application' : 'Add application'}
      description={
        isEditing
          ? 'Update this application.'
          : 'Track a new job application through your pipeline.'
      }
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="application-form"
            loading={isPending}
          >
            {isEditing ? 'Save changes' : 'Add application'}
          </Button>
        </div>
      }
    >
      <form
        id="application-form"
        onSubmit={handleSubmit}
        className={styles.form}
        noValidate
        aria-label="application-form"
      >
        {submitError && (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        )}

        <Input
          label="Company"
          value={form.company}
          onChange={(e) => setField('company', e.target.value)}
          errorText={errors.company}
          placeholder="e.g. Stripe, Figma, Linear"
          required
        />

        <Input
          label="Role"
          value={form.role}
          onChange={(e) => setField('role', e.target.value)}
          errorText={errors.role}
          placeholder="e.g. Senior Frontend Engineer"
          required
        />

        <Input
          label="Job posting URL"
          type="url"
          value={form.url}
          onChange={(e) => setField('url', e.target.value)}
          placeholder="https://..."
          helperText="Optional — link to the original posting."
        />

        <div className={styles.row}>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setField('status', e.target.value as ApplicationStatus)}
            options={STATUS_OPTIONS}
          />
          <Input
            label="Applied date"
            type="date"
            value={form.applied_date}
            onChange={(e) => setField('applied_date', e.target.value)}
            errorText={errors.applied_date}
            required
          />
        </div>

        <Input
          label="Next action"
          value={form.next_action}
          onChange={(e) => setField('next_action', e.target.value)}
          placeholder="e.g. Technical interview, Follow up, Send thank-you"
          helperText="What do you need to do next?"
        />

        <Input
          label="Next action date"
          type="date"
          value={form.next_action_date}
          onChange={(e) => setField('next_action_date', e.target.value)}
          helperText="Leave blank if not yet scheduled."
        />

        <Select
          label="Linked resume"
          value={form.resume_id}
          onChange={(e) => setField('resume_id', e.target.value)}
          options={resumeOptions}
          helperText="Which resume did you use for this application?"
        />

        <TextArea
          label="Notes"
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          rows={3}
          placeholder="Context about this role, recruiter name, compensation range…"
          helperText="Optional — any notes about this application."
        />
      </form>
    </SlideOver>
  )
}
