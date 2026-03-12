/**
 * ExperiencePage — the Experience Library.
 * Displays all career history entries with filtering and search.
 * Replaced the Phase 1 placeholder entirely.
 */
import { useState } from 'react'
import { Library, Plus, Search } from 'lucide-react'
import { ContextBar } from '../components/layout/ContextBar'
import { ExperienceCard } from '../components/experience/ExperienceCard'
import { ExperienceForm } from '../components/experience/ExperienceForm'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { Skeleton } from '../components/ui/Skeleton'
import {
  useDeleteExperience,
  useExperiences,
} from '../queries/experiences'
import type { Experience, ExperienceFilters, ExperienceType } from '../types/experience'
import { EXPERIENCE_TYPE_LABELS, EXPERIENCE_TYPES } from '../types/experience'
import styles from './ExperiencePage.module.css'

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All types' },
  ...EXPERIENCE_TYPES.map((t) => ({ value: t, label: EXPERIENCE_TYPE_LABELS[t] })),
]

function ExperienceListSkeleton() {
  return (
    <div className={styles.list} aria-label="Loading entries…">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <Skeleton variant="text" style={{ width: '30%', marginBottom: '8px' }} />
          <Skeleton variant="text" style={{ width: '65%', marginBottom: '6px' }} />
          <Skeleton variant="text" style={{ width: '45%', marginBottom: '12px' }} />
          <Skeleton variant="text" style={{ width: '90%' }} />
          <Skeleton variant="text" style={{ width: '80%', marginTop: '4px' }} />
        </div>
      ))}
    </div>
  )
}

export function ExperiencePage() {
  const [filters, setFilters] = useState<ExperienceFilters>({})
  const [searchInput, setSearchInput] = useState('')
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Experience | undefined>()

  const { data: experiences, isLoading, isError } = useExperiences({
    ...filters,
    q: searchInput.trim() || undefined,
  })

  const deleteMutation = useDeleteExperience()

  function openCreate() {
    setEditingExperience(undefined)
    setSlideOverOpen(true)
  }

  function openEdit(experience: Experience) {
    setEditingExperience(experience)
    setSlideOverOpen(true)
  }

  function handleCloseSlideOver() {
    setSlideOverOpen(false)
    setEditingExperience(undefined)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(undefined)
  }

  const totalCount = experiences?.length ?? 0
  const hasFilters = !!(filters.type || searchInput.trim())

  return (
    <div className={styles.page}>
      <ContextBar
        breadcrumbs={[{ label: 'Experience' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={openCreate}
          >
            Add entry
          </Button>
        }
      />

      <div className={styles.pageContent}>
        {/* Page header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Experience Library</h1>
            <p className={styles.subtitle}>
              Your career history, ready for any resume.
              {!isLoading && experiences && (
                <span className={styles.count}> {totalCount} {totalCount === 1 ? 'entry' : 'entries'}</span>
              )}
            </p>
          </div>
        </header>

        {/* Filter bar */}
        <div className={styles.filterBar} role="search" aria-label="Filter experiences">
          <Input
            className={styles.searchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search entries…"
            aria-label="Search experiences"
            leadingIcon={<Search size={15} />}
          />

          <Select
            className={styles.typeFilter}
            value={filters.type ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                type: (e.target.value as ExperienceType) || undefined,
              }))
            }
            options={TYPE_FILTER_OPTIONS}
            aria-label="Filter by type"
          />

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({})
                setSearchInput('')
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Active filter indicators */}
        {hasFilters && (
          <div className={styles.activeFilters} aria-live="polite">
            {filters.type && (
              <Badge variant="accent" size="sm">
                {EXPERIENCE_TYPE_LABELS[filters.type]}
              </Badge>
            )}
            {searchInput.trim() && (
              <Badge variant="default" size="sm">
                "{searchInput.trim()}"
              </Badge>
            )}
          </div>
        )}

        {/* Content area */}
        <main className={styles.content}>
          {isLoading && <ExperienceListSkeleton />}

          {isError && (
            <p className={styles.errorMessage} role="alert">
              We couldn't load your experience library. Check your connection and try again.
            </p>
          )}

          {!isLoading && !isError && experiences?.length === 0 && (
            <>
              {hasFilters ? (
                <EmptyState
                  icon={<Search size={40} />}
                  title="No entries match your filters"
                  description="Try adjusting your search or filter criteria."
                  action={{
                    label: 'Clear filters',
                    onClick: () => {
                      setFilters({})
                      setSearchInput('')
                    },
                  }}
                />
              ) : (
                <EmptyState
                  icon={<Library size={40} />}
                  title="Build your career database"
                  description="Document your projects, roles, skills, and achievements. The more detail you add, the better AI can tailor your resumes."
                  action={{
                    label: 'Add your first entry',
                    onClick: openCreate,
                  }}
                />
              )}
            </>
          )}

          {!isLoading && !isError && experiences && experiences.length > 0 && (
            <div className={styles.list} role="list" aria-label="Experience entries">
              {experiences.map((exp, i) => (
                <div
                  key={exp.id}
                  role="listitem"
                  className={styles.listItem}
                  style={{ animationDelay: `${100 + i * 40}ms` }}
                >
                  <ExperienceCard
                    experience={exp}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Footer hint */}
        {!isLoading && experiences && experiences.length > 0 && (
          <p className={styles.hint}>
            AI can pull from these entries when generating tailored resumes. The more detail, the better.
          </p>
        )}
      </div>

      {/* Create / Edit slide-over — key forces remount when open state or target changes */}
      <ExperienceForm
        key={`${editingExperience?.id ?? 'create'}-${slideOverOpen}`}
        open={slideOverOpen}
        onClose={handleCloseSlideOver}
        experience={editingExperience}
      />

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        title="Remove entry"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.title}" from your experience library? This cannot be undone.`
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
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  )
}
