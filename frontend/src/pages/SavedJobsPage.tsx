/**
 * SavedJobsPage — list of jobs the user has saved for later review.
 * Clicking a job card opens the full detail in a slide-over.
 */
import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ContextBar } from '../components/layout/ContextBar'
import { JobDetail, JobDetailSkeleton } from '../components/job/JobDetail'
import { JobCard } from '../components/job/JobCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { SlideOver } from '../components/ui/SlideOver'
import { Skeleton } from '../components/ui/Skeleton'
import { useSavedJobs, useSaveJob, useUnsaveJob } from '../queries/jobs'
import type { Job } from '../types/job'
import styles from './SavedJobsPage.module.css'

export function SavedJobsPage() {
  const navigate = useNavigate()
  const { data: savedJobs, isLoading, isError } = useSavedJobs()
  const saveJob = useSaveJob()
  const unsaveJob = useUnsaveJob()

  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const isSavePending = saveJob.isPending || unsaveJob.isPending

  function handleSave(job: Job) {
    saveJob.mutate({ job_id: job.id })
  }

  function handleUnsave(job: Job) {
    unsaveJob.mutate(job.id, {
      onSuccess: () => {
        // If the detail panel is open for the unsaved job, close it
        if (selectedJob?.id === job.id) {
          setSelectedJob(null)
        }
      },
    })
  }

  const jobs = savedJobs?.map((sv) => sv.job) ?? []

  return (
    <div className={styles.page}>
      <ContextBar
        breadcrumbs={[{ label: 'Saved Jobs' }]}
        actions={
          <Button variant="secondary" size="sm" onClick={() => navigate('/jobs')}>
            Browse Jobs
          </Button>
        }
      />

      <div className={styles.pageContent}>
        {/* Page header */}
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>Saved Jobs</h1>
            {!isLoading && jobs.length > 0 && (
              <p className={styles.subheading}>
                {jobs.length} saved job{jobs.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </header>

        {/* Content */}
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.cardSkeleton} aria-hidden="true">
                <Skeleton height={14} width="65%" />
                <Skeleton height={13} width="45%" style={{ marginTop: 6 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Skeleton height={20} width={70} />
                  <Skeleton height={20} width={85} />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Couldn't load saved jobs"
            description="Something went wrong. Try refreshing the page."
            action={
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            }
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<Bookmark size={40} />}
            title="No saved jobs yet"
            description="Browse the job board and save listings you want to revisit. They'll appear here so you can compare and decide when you're ready."
            action={
              <Button variant="primary" onClick={() => navigate('/jobs')}>
                Browse Job Board
              </Button>
            }
          />
        ) : (
          <div className={styles.grid}>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onSelect={setSelectedJob}
                onSave={handleSave}
                onUnsave={handleUnsave}
                isSavePending={isSavePending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      <SlideOver
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob ? selectedJob.title : ''}
      >
        {selectedJob && (
          <JobDetail
            job={selectedJob}
            onSave={handleSave}
            onUnsave={handleUnsave}
            isSavePending={isSavePending}
          />
        )}
      </SlideOver>
    </div>
  )
}
