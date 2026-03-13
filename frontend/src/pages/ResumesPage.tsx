/**
 * ResumesPage — the Resume Library.
 * Displays all resumes in a card grid with create/delete actions.
 * Includes an AI generation section to build tailored resumes from job descriptions.
 */
import { useRef, useState } from 'react'
import { Plus, FileText, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ContextBar } from '../components/layout/ContextBar'
import { ResumeCard } from '../components/resume/ResumeCard'
import { AIGenerationOverlay } from '../components/ui/AIGenerationOverlay'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { useAIStream } from '../hooks/useAIStream'
import { useCreateResume, useDeleteResume, useResumes } from '../queries/resumes'
import type { Resume, ResumeCreate } from '../types/resume'
import { defaultSections } from '../types/resume'
import styles from './ResumesPage.module.css'

function GridSkeleton() {
  return (
    <div className={styles.grid} aria-label="Loading resumes…">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <Skeleton variant="rect" style={{ width: 56, height: 56, borderRadius: 12 }} />
          <Skeleton variant="text" style={{ width: '70%', marginTop: 'var(--space-4)' }} />
          <Skeleton variant="text" style={{ width: '40%', marginTop: 'var(--space-2)' }} />
          <Skeleton variant="text" style={{ width: '50%', marginTop: 'var(--space-5)' }} />
        </div>
      ))}
    </div>
  )
}

export function ResumesPage() {
  const navigate = useNavigate()

  // Manual create state
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [nameError, setNameError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Resume | undefined>()

  // AI generation state
  const [jobDescription, setJobDescription] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')
  const jobDescRef = useRef<HTMLTextAreaElement>(null)

  const { data: resumes, isLoading, isError } = useResumes()
  const createMutation = useCreateResume()
  const deleteMutation = useDeleteResume()

  const { streamText, start: startStream, cancel: cancelStream } = useAIStream<{
    resume: ResumeCreate
  }>({
    onComplete: async (result) => {
      try {
        const generated = result.resume
        const created = await createMutation.mutateAsync({
          name: generated.name ?? 'AI-Generated Resume',
          sections: generated.sections ?? defaultSections(),
        })
        setAiGenerating(false)
        setJobDescription('')
        navigate(`/resumes/${created.id}`, { state: { aiGenerated: true } })
      } catch {
        setAiGenerating(false)
        setAiError("We couldn't save the generated resume. Please try again.")
      }
    },
    onError: (err) => {
      setAiGenerating(false)
      setAiError(err.message || 'Generation failed. Please try again.')
    },
  })

  async function handleGenerate() {
    const trimmed = jobDescription.trim()
    if (!trimmed) {
      setAiError('Paste a job description to generate a tailored resume.')
      jobDescRef.current?.focus()
      return
    }
    if (trimmed.length < 10) {
      setAiError('The job description is too short. Paste the full posting for best results.')
      return
    }
    setAiError('')
    setAiGenerating(true)
    await startStream('/ai/generate-resume', { job_description: trimmed })
  }

  function handleCancelGeneration() {
    cancelStream()
    setAiGenerating(false)
  }

  async function handleCreate() {
    const trimmed = newName.trim()
    if (!trimmed) {
      setNameError('Give your resume a name.')
      return
    }
    try {
      const created = await createMutation.mutateAsync({
        name: trimmed,
        sections: defaultSections(),
      })
      setCreateOpen(false)
      setNewName('')
      setNameError('')
      navigate(`/resumes/${created.id}`)
    } catch {
      setNameError("We couldn't create the resume. Try again.")
    }
  }

  function handleOpenCreate() {
    setNewName('')
    setNameError('')
    setCreateOpen(true)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(undefined)
  }

  const totalCount = resumes?.length ?? 0
  const versionCount = resumes?.reduce((sum, r) => sum + r.version, 0) ?? 0

  return (
    <div className={styles.page}>
      <ContextBar
        breadcrumbs={[{ label: 'Resumes' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={handleOpenCreate}
          >
            New Resume
          </Button>
        }
      />

      <div className={styles.pageContent}>
        {/* Page header */}
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Resumes</h1>
            {!isLoading && totalCount > 0 && (
              <p className={styles.subtitle}>
                <span className={styles.count}>{totalCount} {totalCount === 1 ? 'resume' : 'resumes'}</span>
                {' · '}
                <span className={styles.count}>{versionCount} {versionCount === 1 ? 'version' : 'versions'}</span>
              </p>
            )}
          </div>
        </header>

        {/* Content */}
        <main className={styles.content}>
          {isLoading && <GridSkeleton />}

          {isError && (
            <p className={styles.errorMessage} role="alert">
              We couldn't load your resumes. Check your connection and try again.
            </p>
          )}

          {!isLoading && !isError && resumes?.length === 0 && (
            <EmptyState
              icon={<FileText size={40} />}
              title="Your resume library is a blank canvas"
              description="Start with one resume and evolve it as you discover what works. Build tailored versions for different roles."
              action={{
                label: 'Create your first resume',
                onClick: handleOpenCreate,
              }}
            />
          )}

          {!isLoading && !isError && resumes && resumes.length > 0 && (
            <div
              className={styles.grid}
              role="list"
              aria-label="Resume library"
            >
              {resumes.map((resume, i) => (
                <div
                  key={resume.id}
                  role="listitem"
                  className={styles.gridItem}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <ResumeCard
                    resume={resume}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── AI Resume Generation ──────────────────────────── */}
          {!isLoading && !isError && (
            <section
              className={styles.aiSection}
              aria-labelledby="ai-generation-heading"
            >
              <div className={styles.aiDivider} aria-hidden="true" />

              <div className={styles.aiHeader}>
                <Sparkles size={18} className={styles.aiIcon} aria-hidden="true" />
                <div>
                  <h2 id="ai-generation-heading" className={styles.aiTitle}>
                    AI Resume Generation
                  </h2>
                  <p className={styles.aiDescription}>
                    Paste a job posting and we'll select the most relevant entries
                    from your experience library to build a tailored resume.
                  </p>
                </div>
              </div>

              <div className={styles.aiForm}>
                <label htmlFor="job-description" className={styles.aiLabel}>
                  Job posting or description
                </label>
                <textarea
                  id="job-description"
                  ref={jobDescRef}
                  className={styles.aiTextarea}
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value)
                    if (aiError) setAiError('')
                  }}
                  placeholder="Paste the full job description here — the more detail, the better the tailoring…"
                  rows={6}
                  aria-describedby={aiError ? 'ai-error' : undefined}
                />
                {aiError && (
                  <p id="ai-error" className={styles.aiError} role="alert">
                    {aiError}
                  </p>
                )}
                <div className={styles.aiActions}>
                  <Button
                    variant="primary"
                    icon={<Sparkles size={15} />}
                    onClick={handleGenerate}
                    disabled={aiGenerating || !jobDescription.trim()}
                    loading={aiGenerating}
                  >
                    Generate resume
                  </Button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* AI generation overlay */}
      <AIGenerationOverlay
        open={aiGenerating}
        streamText={streamText}
        onCancel={handleCancelGeneration}
        title="Generating your tailored resume…"
      />

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New resume"
        description="Give this resume a name. You can always rename it later."
        size="sm"
      >
        <Input
          label="Resume name"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value)
            if (nameError) setNameError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate()
          }}
          placeholder="Full-Stack Generalist, Frontend Specialist…"
          errorText={nameError}
          required
          autoFocus
        />
        <div className={styles.modalFooter}>
          <Button
            variant="secondary"
            onClick={() => setCreateOpen(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            loading={createMutation.isPending}
          >
            Create resume
          </Button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        title="Delete resume"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}" and all its versions? This cannot be undone.`
            : ''
        }
        size="sm"
      >
        <div className={styles.modalFooter}>
          <Button
            variant="secondary"
            onClick={() => setDeleteTarget(undefined)}
            disabled={deleteMutation.isPending}
          >
            Keep it
          </Button>
          <Button
            variant="primary"
            onClick={confirmDelete}
            loading={deleteMutation.isPending}
            style={{ background: 'var(--accent-danger)' }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
