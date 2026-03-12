/**
 * HeaderSectionEditor — contact info at the top of the resume.
 */
import { Input } from '../../ui/Input'
import type { HeaderSection } from '../../../types/resume'
import { SectionWrapper } from './SectionWrapper'

export interface HeaderSectionEditorProps {
  section: HeaderSection
  onChange: (updated: HeaderSection) => void
}

export function HeaderSectionEditor({ section, onChange }: HeaderSectionEditorProps) {
  function set<K extends keyof HeaderSection>(key: K, value: HeaderSection[K]) {
    onChange({ ...section, [key]: value || undefined })
  }

  return (
    <SectionWrapper title="Contact" defaultOpen>
      <Input
        label="Full name"
        value={section.name}
        onChange={(e) => onChange({ ...section, name: e.target.value })}
        placeholder="Jane Smith"
        required
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label="Email"
          type="email"
          value={section.email ?? ''}
          onChange={(e) => set('email', e.target.value)}
          placeholder="jane@example.com"
        />
        <Input
          label="Phone"
          type="tel"
          value={section.phone ?? ''}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="555-1234"
        />
      </div>
      <Input
        label="Location"
        value={section.location ?? ''}
        onChange={(e) => set('location', e.target.value)}
        placeholder="San Francisco, CA"
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label="Website"
          value={section.website ?? ''}
          onChange={(e) => set('website', e.target.value)}
          placeholder="yoursite.com"
        />
        <Input
          label="LinkedIn"
          value={section.linkedin ?? ''}
          onChange={(e) => set('linkedin', e.target.value)}
          placeholder="linkedin.com/in/yourname"
        />
      </div>
    </SectionWrapper>
  )
}
