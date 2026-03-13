/**
 * JobBoardPage — split-view job search with filters.
 * Left: scrollable list of job results.
 * Right: selected job's full detail.
 * Mobile (<1024px): single column with tab toggle.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ContextBar } from '../components/layout/ContextBar'
import { JobCard } from '../components/job/JobCard'
import { JobDetail, JobDetailSkeleton } from '../components/job/JobDetail'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Select } from '../components/ui/Select'
import { Skeleton } from '../components/ui/Skeleton'
import { useJobs, useSaveJob, useUnsaveJob } from '../queries/jobs'
import type { Job, JobFilters, RemoteType } from '../types/job'
import { REMOTE_TYPE_LABELS } from '../types/job'
import styles from './JobBoardPage.module.css'

const REMOTE_TYPE_OPTIONS = [
  { value: '', label: 'Any work type' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

type MobileView = 'list' | 'detail'

export function JobBoardPage() {
  const [searchInput, setSearchInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [remoteType, setRemoteType] = useState<RemoteType | ''>('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [mobileView, setMobileView] = useState<MobileView>('list')

  const debouncedSearch = useDebounce(searchInput, 300)
  const debouncedLocation = useDebounce(locationInput, 300)

  const filters: JobFilters = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      location: debouncedLocation || undefined,
      remote_type: remoteType || undefined,
    }),
    [debouncedSearch, debouncedLocation, remoteType],
  )

  const { data: jobs, isLoading, isError } = useJobs(filters)
  const saveJob = useSaveJob()
  const unsaveJob = useUnsaveJob()

  const activeFilterCount = [
    debouncedSearch,
    debouncedLocation,
    remoteType,
  ].filter(Boolean).length

  // Keep selected job in sync when jobs list refreshes (e.g. after save/unsave)
  useEffect(() => {
    if (selectedJob && jobs) {
      const refreshed = jobs.find((j) => j.id === selectedJob.id)
      if (refreshed) setSelectedJob(refreshed)
    }
  }, [jobs]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first job when list loads and nothing selected
  useEffect(() => {
    if (!selectedJob && jobs && jobs.length > 0) {
      setSelectedJob(jobs[0])
    }
  }, [jobs]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectJob = useCallback(
    (job: Job) => {
      setSelectedJob(job)
      setMobileView('detail')
    },
    [],
  )

  function handleSave(job: Job) {
    saveJob.mutate({ job_id: job.id })
  }

  function handleUnsave(job: Job) {
    unsaveJob.mutate(job.id)
  }

  function clearFilters() {
    setSearchInput('')
    setLocationInput('')
    setRemoteType('')
  }

  const isSavePending = saveJob.isPending || unsaveJob.isPending

  return (
    <div className={styles.page}>
      <ContextBar breadcrumbs={[{ label: 'Job Board' }]} />

      <div className={styles.layout}>
        {/* ─── Left panel: search + results list ─── */}
        <div
          className={[styles.listPanel, mobileView === 'detail' ? styles.listPanelHidden : '']
            .filter(Boolean)
            .join(' ')}
          aria-label="Job results"
        >
          {/* Search bar */}
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrapper}>
              <Search size={16} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search roles, companies…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search jobs"
              />
              {searchInput && (
                <button
                  className={styles.clearBtn}
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              className={[styles.filterToggle, showFilters ? styles.filterToggleActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal size={15} />
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className={styles.filterPanel} role="region" aria-label="Filter options">
              <div className={styles.filterRow}>
                <div className={styles.filterField}>
                  <label htmlFor="location-filter" className={styles.filterLabel}>
                    Location
                  </label>
                  <input
                    id="location-filter"
                    type="text"
                    className={styles.filterInput}
                    placeholder="City, state, or country"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                  />
                </div>

                <div className={styles.filterField}>
                  <label htmlFor="remote-filter" className={styles.filterLabel}>
                    Work type
                  </label>
                  <Select
                    id="remote-filter"
                    value={remoteType}
                    onChange={(e) => setRemoteType(e.target.value as RemoteType | '')}
                    options={REMOTE_TYPE_OPTIONS}
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          {!isLoading && jobs && (
            <p className={styles.resultsCount} aria-live="polite">
              {jobs.length === 0
                ? 'No jobs found'
                : `${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
              {activeFilterCount > 0 && ' matching your filters'}
            </p>
          )}

          {/* Job list */}
          <div className={styles.jobList} role="list">
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={styles.cardSkeleton} role="listitem" aria-hidden="true">
                    <Skeleton height={14} width="60%" />
                    <Skeleton height={13} width="40%" style={{ marginTop: 6 }} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <Skeleton height={20} width={70} />
                      <Skeleton height={20} width={90} />
                    </div>
                  </div>
                ))}
              </>
            ) : isError ? (
              <EmptyState
                title="Couldn't load jobs"
                description="Something went wrong on our end. Try refreshing the page."
                action={
                  <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                    Refresh
                  </Button>
                }
              />
            ) : jobs && jobs.length === 0 ? (
              <EmptyState
                title={activeFilterCount > 0 ? 'No matches found' : 'No jobs yet'}
                description={
                  activeFilterCount > 0
                    ? 'Try adjusting your search or filters to find more opportunities.'
                    : 'Job listings will appear here as they are added. Check back soon.'
                }
                action={
                  activeFilterCount > 0 ? (
                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              jobs?.map((job) => (
                <div key={job.id} role="listitem">
                  <JobCard
                    job={job}
                    isSelected={selectedJob?.id === job.id}
                    onSelect={handleSelectJob}
                    onSave={handleSave}
                    onUnsave={handleUnsave}
                    isSavePending={isSavePending}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── Right panel: job detail ─── */}
        <div
          className={[styles.detailPanel, mobileView === 'list' ? styles.detailPanelHidden : '']
            .filter(Boolean)
            .join(' ')}
          aria-label="Job detail"
        >
          {/* Mobile back button */}
          <button
            className={styles.mobileBack}
            onClick={() => setMobileView('list')}
            aria-label="Back to job list"
          >
            ← Back to results
          </button>

          {isLoading ? (
            <JobDetailSkeleton />
          ) : selectedJob ? (
            <JobDetail
              job={selectedJob}
              onSave={handleSave}
              onUnsave={handleUnsave}
              isSavePending={isSavePending}
            />
          ) : (
            <div className={styles.detailEmpty}>
              <p className={styles.detailEmptyText}>Select a job to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
