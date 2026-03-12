/**
 * TypeScript types for the Resume domain.
 * Section types mirror the JSONB structure stored in the backend.
 */

// ── Section types ──────────────────────────────────────────────────────────

export interface HeaderSection {
  type: 'header'
  name: string
  email?: string
  phone?: string
  location?: string
  website?: string
  linkedin?: string
}

export interface SummarySection {
  type: 'summary'
  content: string
}

export interface ExperienceEntry {
  id: string
  title: string
  company: string
  location?: string
  start_date?: string
  end_date?: string
  current?: boolean
  bullets: string[]
  experience_id?: string  // optional link to an Experience Library entry
}

export interface ExperienceSection {
  type: 'experience'
  entries: ExperienceEntry[]
}

export interface ProjectEntry {
  id: string
  name: string
  description: string
  technologies: string[]
  url?: string
  bullets: string[]
  experience_id?: string
}

export interface ProjectsSection {
  type: 'projects'
  entries: ProjectEntry[]
}

export interface SkillCategory {
  name: string
  skills: string[]
}

export interface SkillsSection {
  type: 'skills'
  categories: SkillCategory[]
}

export interface EducationEntry {
  id: string
  institution: string
  degree: string
  field: string
  start_date?: string
  end_date?: string
  gpa?: string
  notes?: string
}

export interface EducationSection {
  type: 'education'
  entries: EducationEntry[]
}

export type ResumeSection =
  | HeaderSection
  | SummarySection
  | ExperienceSection
  | ProjectsSection
  | SkillsSection
  | EducationSection

export type SectionType = ResumeSection['type']

// ── Resume ─────────────────────────────────────────────────────────────────

export interface Resume {
  id: string
  user_id: string
  name: string
  version: number
  sections: ResumeSection[]
  created_at: string
  updated_at: string
}

export interface ResumeCreate {
  name: string
  sections?: ResumeSection[]
}

export interface ResumeUpdate {
  name?: string
  sections?: ResumeSection[]
}

// ── Versions ───────────────────────────────────────────────────────────────

export interface ResumeVersion {
  id: string
  resume_id: string
  version: number
  name: string
  sections: ResumeSection[]
  created_at: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function defaultSections(): ResumeSection[] {
  return [
    { type: 'header', name: '' },
    { type: 'summary', content: '' },
    { type: 'experience', entries: [] },
    { type: 'projects', entries: [] },
    { type: 'skills', categories: [] },
    { type: 'education', entries: [] },
  ]
}

export function findSection<T extends ResumeSection>(
  sections: ResumeSection[],
  type: T['type'],
): T | undefined {
  return sections.find((s) => s.type === type) as T | undefined
}

export function replaceSection(
  sections: ResumeSection[],
  updated: ResumeSection,
): ResumeSection[] {
  return sections.map((s) => (s.type === updated.type ? updated : s))
}

export const SECTION_LABELS: Record<SectionType, string> = {
  header: 'Contact',
  summary: 'Summary',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  education: 'Education',
}
