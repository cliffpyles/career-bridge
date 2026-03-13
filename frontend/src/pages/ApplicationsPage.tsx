/**
 * ApplicationsPage — pipeline-based application tracking.
 * Shows a list of applications with status filters and sort controls.
 * Clicking a row opens the detail slide-over.
 */
import { useState } from 'react'
import { ArrowUpRight, ChevronRight, ClipboardList, Plus, Search } from 'lucide-react'
import { ContextBar } from '../components/layout/ContextBar'
import { ApplicationDetail } from '../components/application/ApplicationDetail'
import { ApplicationForm } from '../components/application/ApplicationForm'
import { PipelineIndicator } from '../components/application/PipelineIndicator'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { Skeleton } from '../components/ui/Skeleton'
import {
  useApplications,
  useDeleteApplication,
} from '../queries/applications'
import type { Application, ApplicationFilters, ApplicationStatus } from '../types/application'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  ACTIVE_STATUSES,
} from '../types/application'
import styles from './ApplicationsPage.module.css'

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...APPLICATION_STATUSES.map((s) => ({ value: s, label: APPLICATION_STATUS_LABELS[s] })),
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently updated' },
  { value: 'next_action', label: 'Next action date' },
]

function isOverdue(app: Application): boolean {
  if (!app.next_action_date) return false
  const today = new Date().toISOString().slice(0, 10)
  return app.next_action_date < today
}

function isUpcoming(app: Application): boolean {
  if (!app.next_action_date) return false
  const today = new Date().toISOString().slice(0, 10)
  const threeDaysOut = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return app.next_action_date >= today && app.next_action_date <= threeDaysOut
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function StatusDot({ app }: { app: Application }) {
  const active = ACTIVE_STATUSES.includes(app.status)
  const hasAction = !!app.next_action_date
  return (
    <span
      className={[styles.statusDot, active && hasAction ? styles.statusDotActive : styles.statusDotIdle].join(' ')}
      aria-hidden="true"
    />
  )
}

function ApplicationListSkeleton() {
  return (
    <div className={styles.list} aria-label="Loading applications…">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <div className={styles.skeletonLeft}>
            <Skeleton variant="text" style={{ width: '45%', marginBottom: '6px' }} />
            <Skeleton variant="text" style={{ width: '30%' }} />
          </div>
          <Skeleton variant="text" style={{ width: '80px' }} />
        </div>
      ))}
    </div>
  )
}

export function ApplicationsPage() {
  const [filters, setFilters] = useState<ApplicationFilters>({ sort: 'recent' })
  const [formOpen, setFormOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | undefined>()
  const [detailApp, setDetailApp] = useState<Application | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Application | undefined>()

  const { data: applications, isLoading, isError } = useApplications(filters)
  const deleteMutation = useDeleteApplication()

  const totalCount = applications?.length ?? 0
  const activeCount = applications?.filter((a) => ACTIVE_STATUSES.includes(a.status)).length ?? 0
  const archivedCount = totalCount - activeCount

  function openCreate() {
    setEditingApp(undefined)
    setFormOpen(true)
  }

  function openEdit(app: Application) {
    setDetailApp(null)
    setEditingApp(app)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditingApp(undefined)
  }

  function openDetail(app: Application) {
    setDetailApp(app)
  }

  function handleDetailClose() {
    setDetailApp(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(undefined)
    if (detailApp?.id === deleteTarget.id) {
      setDetailApp(null)
    }
  }

  const hasFilters = !!(filters.status)

  return (
    <div className={styles.page}>
      <ContextBar
        breadcrumbs={[{ label: 'Applications' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={openCreate}
          >
            New application
          </Button>
        }
      />

      <div className={styles.pageContent}>
        {/* Page header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Applications</h1>
            {!isLoading && applications && (
              <p className={styles.subtitle}>
                <span className={styles.countPrimary}>{activeCount} active</span>
                {archivedCount > 0 && (
                  <span className={styles.countSecondary}> · {archivedCount} archived</span>
                )}
              </p>
            )}
          </div>
        </header>

        {/* Filter + sort bar */}
        <div className={styles.filterBar} role="toolbar" aria-label="Filter applications">
          <Select
            className={styles.statusFilter}
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: (e.target.value as ApplicationStatus) || undefined,
              }))
            }
            options={STATUS_FILTER_OPTIONS}
            aria-label="Filter by status"
          />

          <Select
            className={styles.sortFilter}
            value={filters.sort ?? 'recent'}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sort: e.target.value as 'recent' | 'next_action',
              }))
            }
            options={SORT_OPTIONS}
            aria-label="Sort order"
          />

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ sort: filters.sort })}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Main content */}
        <main className={styles.content}>
          {isLoading && <ApplicationListSkeleton />}

          {isError && (
            <p className={styles.errorMessage} role="alert">
              We couldn't load your applications. Check your connection and try again.
            </p>
          )}

          {!isLoading && !isError && applications?.length === 0 && (
            <>
              {hasFilters ? (
                <EmptyState
                  icon={<Search size={40} />}
                  title="No applications match your filters"
                  description="Try adjusting the status filter or clearing it to see all applications."
                  action={{
                    label: 'Clear filters',
                    onClick: () => setFilters({ sort: filters.sort }),
                  }}
                />
              ) : (
                <EmptyState
                  icon={<ClipboardList size={40} />}
                  title="Your pipeline is empty"
                  description="Track every application — from first application to final decision. Add notes, link resumes, and log every conversation."
                  action={{
                    label: 'Add your first application',
                    onClick: openCreate,
                  }}
                />
              )}
            </>
          )}

          {!isLoading && !isError && applications && applications.length > 0 && (
            <div
              className={styles.list}
              role="list"
              aria-label="Applications"
            >
              {applications.map((app, i) => {
                const overdue = isOverdue(app)
                const upcoming = isUpcoming(app)
                const isSelected = detailApp?.id === app.id

                return (
                  <div
                    key={app.id}
                    role="listitem"
                    className={styles.listItemWrapper}
                    style={{ animationDelay: `${100 + i * 40}ms` }}
                  >
                    <button
                      className={[
                        styles.row,
                        isSelected ? styles.rowSelected : '',
                        overdue ? styles.rowOverdue : '',
                      ].join(' ')}
                      onClick={() => openDetail(app)}
                      aria-label={`${app.role} at ${app.company} — ${APPLICATION_STATUS_LABELS[app.status]}`}
                      aria-pressed={isSelected}
                    >
                      <div className={styles.rowLeft}>
                        <StatusDot app={app} />
                        <div className={styles.rowMain}>
                          <div className={styles.rowTitle}>
                            <span className={styles.rowRole}>{app.role}</span>
                            {app.url && (
                              <a
                                href={app.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.rowExternalLink}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Open ${app.company} posting`}
                              >
                                <ArrowUpRight size={12} />
                              </a>
                            )}
                          </div>
                          <div className={styles.rowMeta}>
                            <span className={styles.rowCompany}>{app.company}</span>
                            <span className={styles.rowSep}>·</span>
                            <span className={styles.rowApplied}>
                              Applied {formatDateShort(app.applied_date)}
                            </span>
                            <span className={styles.rowSep}>·</span>
                            <Badge
                              variant="default"
                              size="sm"
                              className={styles.statusBadge}
                              data-status={app.status}
                            >
                              {APPLICATION_STATUS_LABELS[app.status]}
                            </Badge>
                          </div>
                          {app.next_action && (
                            <p
                              className={[
                                styles.nextActionLine,
                                overdue ? styles.nextActionOverdue : '',
                                upcoming ? styles.nextActionUpcoming : '',
                              ].join(' ')}
                            >
                              {overdue ? 'Overdue: ' : upcoming ? 'Soon: ' : 'Next: '}
                              {app.next_action}
                              {app.next_action_date && (
                                <time
                                  className={styles.nextActionDateInline}
                                  dateTime={app.next_action_date}
                                >
                                  {' · '}
                                  {formatDateShort(app.next_action_date)}
                                </time>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={styles.rowRight}>
                        <PipelineIndicator status={app.status} compact />
                        <ChevronRight
                          size={16}
                          className={styles.chevron}
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit form slide-over */}
      <ApplicationForm
        key={`${editingApp?.id ?? 'create'}-${formOpen}`}
        open={formOpen}
        onClose={handleFormClose}
        application={editingApp}
      />

      {/* Application detail slide-over */}
      <ApplicationDetail
        key={`detail-${detailApp?.id ?? 'none'}`}
        open={!!detailApp}
        onClose={handleDetailClose}
        application={detailApp}
        onEdit={openEdit}
      />

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        title="Remove application"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.role} at ${deleteTarget.company}"? This cannot be undone.`
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
