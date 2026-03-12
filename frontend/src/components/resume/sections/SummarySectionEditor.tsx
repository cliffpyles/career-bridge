/**
 * SummarySectionEditor — the professional summary paragraph.
 */
import { TextArea } from '../../ui/TextArea'
import type { SummarySection } from '../../../types/resume'
import { SectionWrapper } from './SectionWrapper'

export interface SummarySectionEditorProps {
  section: SummarySection
  onChange: (updated: SummarySection) => void
}

export function SummarySectionEditor({ section, onChange }: SummarySectionEditorProps) {
  return (
    <SectionWrapper title="Summary">
      <TextArea
        label="Professional summary"
        value={section.content}
        onChange={(e) => onChange({ ...section, content: e.target.value })}
        rows={4}
        placeholder="Write a concise summary of your professional background, key strengths, and what you're looking for…"
        helperText="2–4 sentences. Tailor this to the role you're targeting."
      />
    </SectionWrapper>
  )
}
