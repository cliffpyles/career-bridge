/**
 * ResumePreview — renders the resume as a styled document.
 * Updates in real-time as the editor form changes.
 * The visual output matches the PDF export format.
 */
import type {
  EducationSection,
  ExperienceSection,
  HeaderSection,
  ProjectsSection,
  Resume,
  ResumeSection,
  SkillsSection,
  SummarySection,
} from '../../types/resume'
import styles from './ResumePreview.module.css'

function findSection<T extends ResumeSection>(
  sections: ResumeSection[],
  type: T['type'],
): T | undefined {
  return sections.find((s) => s.type === type) as T | undefined
}

function formatDateRange(
  start?: string,
  end?: string,
  current?: boolean,
): string {
  if (!start && !end) return ''
  const endLabel = current ? 'Present' : end ?? 'Present'
  if (start && endLabel) return `${start} – ${endLabel}`
  return start ?? endLabel
}

// ── Section renderers ────────────────────────────────────────────────────────

function HeaderPreview({ section }: { section: HeaderSection }) {
  const contactParts = [
    section.email,
    section.phone,
    section.location,
    section.website,
    section.linkedin,
  ].filter(Boolean)

  return (
    <div className={styles.header}>
      <h1 className={styles.headerName}>{section.name || 'Your Name'}</h1>
      {contactParts.length > 0 && (
        <p className={styles.headerContact}>{contactParts.join(' · ')}</p>
      )}
    </div>
  )
}

function SummaryPreview({ section }: { section: SummarySection }) {
  if (!section.content) return null
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Summary</h2>
      <p className={styles.summaryText}>{section.content}</p>
    </div>
  )
}

function ExperiencePreview({ section }: { section: ExperienceSection }) {
  if (!section.entries.length) return null
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Experience</h2>
      {section.entries.map((entry) => (
        <div key={entry.id} className={styles.entry}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>{entry.title}</span>
            <span className={styles.entryDate}>
              {formatDateRange(entry.start_date, entry.end_date, entry.current)}
            </span>
          </div>
          {entry.company && (
            <p className={styles.entrySub}>
              {entry.company}
              {entry.location ? ` · ${entry.location}` : ''}
            </p>
          )}
          {entry.bullets.filter(Boolean).length > 0 && (
            <ul className={styles.bullets}>
              {entry.bullets.filter(Boolean).map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function ProjectsPreview({ section }: { section: ProjectsSection }) {
  if (!section.entries.length) return null
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Projects</h2>
      {section.entries.map((entry) => (
        <div key={entry.id} className={styles.entry}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>{entry.name}</span>
            {entry.technologies.length > 0 && (
              <span className={styles.entryDate}>{entry.technologies.join(', ')}</span>
            )}
          </div>
          {entry.description && <p className={styles.entrySub}>{entry.description}</p>}
          {entry.bullets.filter(Boolean).length > 0 && (
            <ul className={styles.bullets}>
              {entry.bullets.filter(Boolean).map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function SkillsPreview({ section }: { section: SkillsSection }) {
  if (!section.categories.length) return null
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Skills</h2>
      {section.categories.map((cat, i) => (
        <div key={i} className={styles.skillRow}>
          <span className={styles.skillCategoryName}>{cat.name}</span>
          <span className={styles.skillList}>{cat.skills.join(', ')}</span>
        </div>
      ))}
    </div>
  )
}

function EducationPreview({ section }: { section: EducationSection }) {
  if (!section.entries.length) return null
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Education</h2>
      {section.entries.map((entry) => (
        <div key={entry.id} className={styles.entry}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>{entry.institution}</span>
            <span className={styles.entryDate}>
              {formatDateRange(entry.start_date, entry.end_date)}
            </span>
          </div>
          {(entry.degree || entry.field) && (
            <p className={styles.entrySub}>
              {[entry.degree, entry.field].filter(Boolean).join(' ')}
              {entry.gpa ? ` · GPA ${entry.gpa}` : ''}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export interface ResumePreviewProps {
  resume: Pick<Resume, 'name' | 'sections'>
  className?: string
}

export function ResumePreview({ resume, className }: ResumePreviewProps) {
  const sections = resume.sections
  const header = findSection<HeaderSection>(sections, 'header')
  const summary = findSection<SummarySection>(sections, 'summary')
  const experience = findSection<ExperienceSection>(sections, 'experience')
  const projects = findSection<ProjectsSection>(sections, 'projects')
  const skills = findSection<SkillsSection>(sections, 'skills')
  const education = findSection<EducationSection>(sections, 'education')

  return (
    <article
      className={`${styles.preview} ${className ?? ''}`}
      aria-label="Resume preview"
      data-testid="resume-preview"
    >
      <div className={styles.document}>
        {header && <HeaderPreview section={header} />}
        {summary && <SummaryPreview section={summary} />}
        {experience && <ExperiencePreview section={experience} />}
        {projects && <ProjectsPreview section={projects} />}
        {skills && <SkillsPreview section={skills} />}
        {education && <EducationPreview section={education} />}
      </div>
    </article>
  )
}
