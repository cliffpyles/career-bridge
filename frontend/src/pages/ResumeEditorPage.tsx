/**
 * ResumeEditorPage — full-page split-view resume editor.
 * Left: structured section forms. Right: live preview.
 * Supports drag-handle resize, version history, and PDF/TXT export.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ChevronDown, Download, RotateCcw, Save } from 'lucide-react'
import { ContextBar } from '../components/layout/ContextBar'
import { ExperiencePicker } from '../components/resume/ExperiencePicker'
import { ResumePreview } from '../components/resume/ResumePreview'
import { HeaderSectionEditor } from '../components/resume/sections/HeaderSectionEditor'
import { SummarySectionEditor } from '../components/resume/sections/SummarySectionEditor'
import { ExperienceSectionEditor } from '../components/resume/sections/ExperienceSectionEditor'
import { ProjectsSectionEditor } from '../components/resume/sections/ProjectsSectionEditor'
import { SkillsSectionEditor } from '../components/resume/sections/SkillsSectionEditor'
import { EducationSectionEditor } from '../components/resume/sections/EducationSectionEditor'
import { Button } from '../components/ui/Button'
import { Dropdown } from '../components/ui/Dropdown'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import {
  useResume,
  useUpdateResume,
  useResumeVersions,
  useRestoreResumeVersion,
  useExportResume,
} from '../queries/resumes'
import type {
  EducationSection,
  ExperienceSection,
  HeaderSection,
  ProjectsSection,
  Resume,
  ResumeSection,
  SkillsSection,
  SummarySection,
} from '../types/resume'
import { findSection, replaceSection } from '../types/resume'
import type { Experience } from '../types/experience'
import styles from './ResumeEditorPage.module.css'

// ── Export helpers ────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Import-from-library helpers ───────────────────────────────────────────────

function importExperienceEntries(
  sections: ResumeSection[],
  targetEntryId: string,
  selected: Experience[],
): ResumeSection[] {
  return sections.map((section) => {
    if (section.type === 'experience') {
      const expSection = section as ExperienceSection
      const updatedEntries = expSection.entries.map((entry) => {
        if (entry.id === targetEntryId && selected.length > 0) {
          const first = selected[0]
          return {
            ...entry,
            title: first.title || entry.title,
            company: first.organization || entry.company,
            bullets:
              first.description
                ? [first.description, ...(first.impact_metrics ? [first.impact_metrics] : [])]
                : entry.bullets,
            experience_id: first.id,
          }
        }
        return entry
      })
      return { ...expSection, entries: updatedEntries }
    }
    if (section.type === 'projects') {
      const projSection = section as ProjectsSection
      const updatedEntries = projSection.entries.map((entry) => {
        if (entry.id === targetEntryId && selected.length > 0) {
          const first = selected[0]
          return {
            ...entry,
            name: first.title || entry.name,
            description: first.description || entry.description,
            bullets: first.impact_metrics ? [first.impact_metrics] : entry.bullets,
            technologies: first.tags.length ? first.tags : entry.technologies,
            experience_id: first.id,
          }
        }
        return entry
      })
      return { ...projSection, entries: updatedEntries }
    }
    return section
  })
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function EditorSkeleton() {
  return (
    <div className={styles.splitView} style={{ '--split-ratio': '0.5' } as React.CSSProperties}>
      <div className={styles.editorPane}>
        <div className={styles.skeletonSection}>
          <Skeleton variant="text" style={{ width: '30%' }} />
          <Skeleton variant="text" style={{ width: '100%', marginTop: 'var(--space-4)' }} />
          <Skeleton variant="text" style={{ width: '100%', marginTop: 'var(--space-3)' }} />
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.previewPane}>
        <div className={styles.skeletonPreview}>
          <Skeleton variant="text" style={{ width: '50%', marginBottom: 'var(--space-4)' }} />
          <Skeleton variant="text" style={{ width: '70%' }} />
          <Skeleton variant="text" style={{ width: '90%', marginTop: 'var(--space-3)' }} />
          <Skeleton variant="text" style={{ width: '80%', marginTop: 'var(--space-2)' }} />
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResumeEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: resume, isLoading, isError } = useResume(id!)
  const { data: versions } = useResumeVersions(id!)
  const updateMutation = useUpdateResume()
  const restoreMutation = useRestoreResumeVersion()
  const exportMutation = useExportResume()

  // ── Local editor state ──────────────────────────────────────────────────────
  const [localName, setLocalName] = useState('')
  const [localSections, setLocalSections] = useState<ResumeSection[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Experience picker state ─────────────────────────────────────────────────
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerTargetId, setPickerTargetId] = useState<string | null>(null)

  // ── Split-view drag state ───────────────────────────────────────────────────
  const [splitRatio, setSplitRatio] = useState(0.48)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  // Initialise local state when the resume loads
  useEffect(() => {
    if (resume) {
      setLocalName(resume.name)
      setLocalSections(resume.sections)
      setIsDirty(false)
    }
  }, [resume])

  // ── Drag-handle handlers ────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    setSplitRatio(Math.max(0.25, Math.min(0.75, ratio)))
  }, [])

  const handleMouseUp = useCallback(() => {
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  function startDrag() {
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  // ── Section change handlers ─────────────────────────────────────────────────
  function updateSection(updated: ResumeSection) {
    setLocalSections((prev) => replaceSection(prev, updated))
    setIsDirty(true)
  }

  function handleNameChange(name: string) {
    setLocalName(name)
    setIsDirty(true)
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!id) return
    setSaveError(null)
    try {
      await updateMutation.mutateAsync({
        id,
        data: { name: localName.trim(), sections: localSections },
      })
      setIsDirty(false)
    } catch {
      setSaveError("We couldn't save your changes. Your edits are still here — try again.")
    }
  }

  // ── Restore version ─────────────────────────────────────────────────────────
  async function handleRestore(versionId: string) {
    if (!id) return
    const restored = await restoreMutation.mutateAsync({ resumeId: id, versionId })
    setLocalSections(restored.sections)
    setLocalName(restored.name)
    setIsDirty(false)
  }

  // ── Export ──────────────────────────────────────────────────────────────────
  async function handleExport(format: 'pdf' | 'txt') {
    if (!id || !resume) return
    const blob = await exportMutation.mutateAsync({ id, format })
    const ext = format
    const safeName = (localName || resume.name).replace(/\s+/g, '_')
    triggerDownload(blob, `${safeName}_v${(resume.version + (isDirty ? 0 : 0))}.${ext}`)
  }

  // ── Import experience ───────────────────────────────────────────────────────
  function openPicker(entryId: string) {
    setPickerTargetId(entryId)
    setPickerOpen(true)
  }

  function handlePickerSelect(selected: Experience[]) {
    if (!pickerTargetId) return
    setLocalSections((prev) => importExperienceEntries(prev, pickerTargetId, selected))
    setIsDirty(true)
    setPickerTargetId(null)
  }

  // ── Derived section refs ────────────────────────────────────────────────────
  const headerSection = findSection<HeaderSection>(localSections, 'header')
  const summarySection = findSection<SummarySection>(localSections, 'summary')
  const experienceSection = findSection<ExperienceSection>(localSections, 'experience')
  const projectsSection = findSection<ProjectsSection>(localSections, 'projects')
  const skillsSection = findSection<SkillsSection>(localSections, 'skills')
  const educationSection = findSection<EducationSection>(localSections, 'education')

  // ── Version dropdown items ──────────────────────────────────────────────────
  const versionItems = (versions ?? []).map((v) => ({
    id: v.id,
    label: `v${v.version} — ${new Date(v.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    onClick: () => handleRestore(v.id),
  }))

  // ── Error / loading ─────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className={styles.errorPage}>
        <p>We couldn't load this resume. It may have been deleted.</p>
        <Button variant="secondary" onClick={() => navigate('/resumes')}>
          Back to library
        </Button>
      </div>
    )
  }

  const displayResume: Pick<Resume, 'name' | 'sections'> = {
    name: localName,
    sections: localSections,
  }

  return (
    <div className={styles.page}>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <ContextBar
        breadcrumbs={[
          { label: 'Resumes', to: '/resumes' },
          { label: isLoading ? '…' : localName || 'Untitled' },
        ]}
        actions={
          <div className={styles.topActions}>
            {/* Version history */}
            <Dropdown
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw size={14} />}
                  iconPosition="left"
                  disabled={!versions?.length}
                  aria-label="Version history"
                >
                  <span className={styles.versionLabel}>
                    {resume ? `v${resume.version + (isDirty ? 0 : 0)}` : '…'}
                  </span>
                  <ChevronDown size={13} aria-hidden />
                </Button>
              }
              items={versionItems.length ? versionItems : [{ id: 'no-versions', label: 'No saved versions', onClick: () => {} }]}
            />

            {/* Export */}
            <Dropdown
              trigger={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download size={14} />}
                  loading={exportMutation.isPending}
                  aria-label="Export resume"
                >
                  Export
                  <ChevronDown size={13} aria-hidden style={{ marginLeft: 4 }} />
                </Button>
              }
              items={[
                { id: 'export-pdf', label: 'Export as PDF', onClick: () => handleExport('pdf') },
                { id: 'export-txt', label: 'Export as TXT', onClick: () => handleExport('txt') },
              ]}
            />

            {/* Save */}
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={14} />}
              onClick={handleSave}
              loading={updateMutation.isPending}
              disabled={!isDirty}
              aria-label="Save changes"
            >
              {isDirty ? 'Save' : 'Saved'}
            </Button>
          </div>
        }
      />

      {saveError && (
        <div className={styles.saveError} role="alert">
          {saveError}
        </div>
      )}

      {/* ── Split view ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <EditorSkeleton />
      ) : (
        <div
          ref={containerRef}
          className={styles.splitView}
          style={{ '--split-ratio': splitRatio } as React.CSSProperties}
        >
          {/* ── Editor pane ──────────────────────────────────────────────── */}
          <div className={styles.editorPane} data-testid="editor-pane">
            <div className={styles.editorScroll}>
              {/* Resume name */}
              <div className={styles.resumeName}>
                <Input
                  label="Resume name"
                  value={localName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Untitled resume"
                />
              </div>

              {/* Sections */}
              <div className={styles.sections}>
                {headerSection && (
                  <HeaderSectionEditor
                    section={headerSection}
                    onChange={(s) => updateSection(s)}
                  />
                )}
                {summarySection && (
                  <SummarySectionEditor
                    section={summarySection}
                    onChange={(s) => updateSection(s)}
                  />
                )}
                {experienceSection && (
                  <ExperienceSectionEditor
                    section={experienceSection}
                    onChange={(s) => updateSection(s)}
                    onImport={(entryId) => openPicker(entryId)}
                  />
                )}
                {projectsSection && (
                  <ProjectsSectionEditor
                    section={projectsSection}
                    onChange={(s) => updateSection(s)}
                    onImport={(entryId) => openPicker(entryId)}
                  />
                )}
                {skillsSection && (
                  <SkillsSectionEditor
                    section={skillsSection}
                    onChange={(s) => updateSection(s)}
                  />
                )}
                {educationSection && (
                  <EducationSectionEditor
                    section={educationSection}
                    onChange={(s) => updateSection(s)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Drag handle ──────────────────────────────────────────────── */}
          <div
            className={styles.dragHandle}
            onMouseDown={startDrag}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize editor and preview"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setSplitRatio((r) => Math.max(0.25, r - 0.05))
              if (e.key === 'ArrowRight') setSplitRatio((r) => Math.min(0.75, r + 0.05))
            }}
          >
            <div className={styles.dragHandleBar} />
          </div>

          {/* ── Preview pane ─────────────────────────────────────────────── */}
          <div className={styles.previewPane} data-testid="preview-pane">
            <ResumePreview resume={displayResume} />
          </div>
        </div>
      )}

      {/* ── Experience picker modal ───────────────────────────────────────── */}
      <ExperiencePicker
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false)
          setPickerTargetId(null)
        }}
        onSelect={handlePickerSelect}
      />
    </div>
  )
}
