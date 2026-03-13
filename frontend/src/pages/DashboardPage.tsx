/**
 * DashboardPage — the landing page.
 * Answers: "What should I work on right now?"
 *
 * Sections:
 *  1. Greeting (time-of-day aware) + summary line
 *  2. Needs Attention cards (overdue / upcoming actions)
 *  3. Active Pipeline compact list + Quick Actions (side by side)
 */
import { AlertCircle, BookOpen, Clock, Plus, Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ContextBar } from '../components/layout/ContextBar'
import { PipelineIndicator } from '../components/application/PipelineIndicator'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { useDashboard } from '../queries/dashboard'
import type { AttentionItem, PipelineItem } from '../types/dashboard'
import { APPLICATION_STATUS_LABELS } from '../types/application'
import styles from './DashboardPage.module.css'

// ─── Greeting ─────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysLabel(daysUntil: number): string {
  if (daysUntil < 0) {
    const n = Math.abs(daysUntil)
    return n === 1 ? '1 day overdue' : `${n} days overdue`
  }
  if (daysUntil === 0) return 'Due today'
  if (daysUntil === 1) return 'Due tomorrow'
  return `In ${daysUntil} days`
}

// ─── Needs Attention Card ──────────────────────────────────────────

interface AttentionCardProps {
  item: AttentionItem
  onView: (id: string) => void
}

function AttentionCard({ item, onView }: AttentionCardProps) {
  const isOverdue = item.attention_type === 'overdue'

  return (
    <Card
      status="warning"
      hoverable
      className={styles.attentionCard}
      role="article"
      aria-label={`${item.company} — ${item.role}`}
    >
      <div className={styles.attentionCardHeader}>
        <span className={[styles.attentionBadge, isOverdue ? styles.attentionBadgeOverdue : styles.attentionBadgeUpcoming].join(' ')}>
          {isOverdue ? (
            <AlertCircle size={12} aria-hidden="true" />
          ) : (
            <Clock size={12} aria-hidden="true" />
          )}
          {daysLabel(item.days_until)}
        </span>
      </div>

      <div className={styles.attentionCardBody}>
        <p className={styles.attentionCompany}>{item.company}</p>
        <p className={styles.attentionRole}>{item.role}</p>
        {item.next_action && (
          <p className={styles.attentionAction}>{item.next_action}</p>
        )}
      </div>

      <button
        className={styles.attentionCta}
        onClick={() => onView(item.application_id)}
        aria-label={`View ${item.company} application`}
      >
        View →
      </button>
    </Card>
  )
}

// ─── Needs Attention Skeleton ──────────────────────────────────────

function AttentionSkeleton() {
  return (
    <div className={styles.attentionGrid} aria-label="Loading attention items…">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={styles.attentionSkeletonCard}>
          <Skeleton variant="text" style={{ width: '60%', marginBottom: '8px' }} />
          <Skeleton variant="text" style={{ width: '40%', marginBottom: '6px' }} />
          <Skeleton variant="text" style={{ width: '80%' }} />
        </div>
      ))}
    </div>
  )
}

// ─── Pipeline Row ──────────────────────────────────────────────────

interface PipelineRowProps {
  item: PipelineItem
  onClick: (id: string) => void
}

function PipelineRow({ item, onClick }: PipelineRowProps) {
  return (
    <button
      className={styles.pipelineRow}
      onClick={() => onClick(item.application_id)}
      aria-label={`${item.company} — ${item.role}, ${APPLICATION_STATUS_LABELS[item.status]}`}
    >
      <div className={styles.pipelineRowLeft}>
        <span className={styles.pipelineCompany}>{item.company}</span>
        <span className={styles.pipelineRole}>{item.role}</span>
      </div>
      <div className={styles.pipelineRowRight}>
        {item.next_action_date ? (
          <span className={styles.pipelineDate}>{formatDate(item.next_action_date)}</span>
        ) : (
          <span className={styles.pipelineDateEmpty}>Awaiting</span>
        )}
        <PipelineIndicator status={item.status} compact />
      </div>
    </button>
  )
}

// ─── Quick Actions ─────────────────────────────────────────────────

interface QuickAction {
  icon: React.ReactNode
  label: string
  description: string
  to: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: <Plus size={18} aria-hidden="true" />,
    label: 'Add application',
    description: 'Track a new job you applied to',
    to: '/applications',
  },
  {
    icon: <Sparkles size={18} aria-hidden="true" />,
    label: 'Generate resume',
    description: 'Tailor a resume from your experience',
    to: '/resumes',
  },
  {
    icon: <Search size={18} aria-hidden="true" />,
    label: 'Find jobs',
    description: 'Search and save new opportunities',
    to: '/jobs',
  },
  {
    icon: <BookOpen size={18} aria-hidden="true" />,
    label: 'Start prep',
    description: 'Create an interview prep plan',
    to: '/interviews',
  },
]

// ─── Main Page ─────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useDashboard()

  const greeting = getGreeting()
  const attentionCount = data?.needs_attention.length ?? 0
  const summaryLine =
    attentionCount === 0
      ? 'Everything is up to date.'
      : attentionCount === 1
        ? 'You have 1 thing that needs attention.'
        : `You have ${attentionCount} things that need attention.`

  function handleViewApplication(id: string) {
    navigate('/applications', { state: { openApplicationId: id } })
  }

  return (
    <div className={styles.page}>
      <ContextBar title="Dashboard" />

      <div className={styles.pageContent}>
        {/* ── Header ── */}
        <header className={styles.pageHeader} style={{ animationDelay: '0ms' }}>
          <p className={styles.greeting}>{greeting}.</p>
          {isLoading ? (
            <Skeleton variant="text" style={{ width: '240px', marginTop: '8px' }} />
          ) : (
            <p className={styles.summaryLine}>{summaryLine}</p>
          )}
        </header>

        {/* ── Needs Attention ── */}
        <section className={styles.section} style={{ animationDelay: '100ms' }} aria-labelledby="attention-heading">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="attention-heading">Needs attention</h2>
            {!isLoading && data && data.needs_attention.length > 0 && (
              <button
                className={styles.viewAllLink}
                onClick={() => navigate('/applications')}
                aria-label="View all applications"
              >
                View all
              </button>
            )}
          </div>

          {isLoading && <AttentionSkeleton />}

          {isError && (
            <p className={styles.errorText}>
              We couldn't load your attention items. Refresh to try again.
            </p>
          )}

          {!isLoading && !isError && data?.needs_attention.length === 0 && (
            <div className={styles.attentionEmpty}>
              <p className={styles.attentionEmptyText}>
                You're all caught up. No overdue or upcoming actions.
              </p>
            </div>
          )}

          {!isLoading && !isError && data && data.needs_attention.length > 0 && (
            <div className={styles.attentionGrid}>
              {data.needs_attention.map((item) => (
                <AttentionCard
                  key={item.application_id}
                  item={item}
                  onView={handleViewApplication}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Bottom row: Active Pipeline + Quick Actions ── */}
        <div className={styles.bottomRow} style={{ animationDelay: '150ms' }}>
          {/* Active Pipeline */}
          <section className={styles.pipelineSection} aria-labelledby="pipeline-heading">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} id="pipeline-heading">Active pipeline</h2>
              {!isLoading && data && (
                <span className={styles.statsChip}>
                  {data.stats.total_active} active
                </span>
              )}
            </div>

            {isLoading && (
              <div className={styles.pipelineList} aria-label="Loading pipeline…">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.pipelineSkeletonRow}>
                    <div>
                      <Skeleton variant="text" style={{ width: '120px', marginBottom: '4px' }} />
                      <Skeleton variant="text" style={{ width: '80px' }} />
                    </div>
                    <Skeleton variant="text" style={{ width: '60px' }} />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !isError && data?.active_pipeline.length === 0 && (
              <EmptyState
                title="No active applications"
                description="Start tracking a new application to see your pipeline here."
                action={{
                  label: 'Add application',
                  onClick: () => navigate('/applications'),
                }}
              />
            )}

            {!isLoading && !isError && data && data.active_pipeline.length > 0 && (
              <div className={styles.pipelineList} role="list">
                {data.active_pipeline.map((item) => (
                  <PipelineRow
                    key={item.application_id}
                    item={item}
                    onClick={handleViewApplication}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className={styles.quickActionsSection} aria-labelledby="quickactions-heading">
            <h2 className={styles.sectionTitle} id="quickactions-heading">Quick actions</h2>
            <ul className={styles.quickActionsList}>
              {QUICK_ACTIONS.map((action) => (
                <li key={action.to} className={styles.quickActionItem}>
                <button
                  className={styles.quickAction}
                  onClick={() => navigate(action.to)}
                  aria-label={action.label}
                >
                  <span className={styles.quickActionIcon}>{action.icon}</span>
                  <div className={styles.quickActionText}>
                    <span className={styles.quickActionLabel}>{action.label}</span>
                    <span className={styles.quickActionDesc}>{action.description}</span>
                  </div>
                </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
