# Career Bridge — Product Design

## Design Philosophy

Career transitions are inherently stressful. The job search is an emotional gauntlet — rejection, uncertainty, time pressure, and the cognitive overload of managing dozens of applications, tailoring resumes, and preparing for interviews simultaneously. Career Bridge exists to be the antidote: a command center that transforms chaos into clarity.

### Core Design Principles

1. **Reduce Stress** — The interface should feel like a deep breath. Warm, grounded aesthetics. No visual noise. No anxiety-inducing red badges or aggressive notifications. Progress is celebrated; setbacks are normalized.

2. **Maximum Control** — The user is always the pilot. AI assists but never takes over. Every AI-generated output is editable, every automation is reversible, every default is overridable. The user should never feel like the tool is "doing things" without their awareness.

3. **Maximum Efficiency** — Minimize clicks, minimize context-switching. Keyboard-first navigation. Batch operations. Smart defaults. The interface should anticipate what the user needs next based on where they are in their workflow.

4. **Maximum Clarity** — Information hierarchy is ruthless. The most important thing on any screen is immediately obvious. Data is surfaced through clear visual patterns, not buried in tables. Status is always visible at a glance.

5. **Simplicity** — Every element earns its place. If it doesn't directly serve the user's goal, it doesn't exist. Complexity is progressive — simple surface, depth on demand.

---

## Aesthetic Direction: "Warm Precision"

The design language is **warm precision** — the intersection of Japanese-inspired minimalism and Scandinavian functionality. Think: a perfectly organized workspace with warm wood, soft light, and everything exactly where you need it.

This is NOT a corporate SaaS dashboard. It is NOT a startup landing page. It is a personal tool that feels like it was crafted by hand for exactly one person.

### Mood

- A well-lit architect's studio at golden hour
- The calm focus of a library reading room
- The quiet confidence of a well-tailored suit

### Anti-patterns

- No gamification (no streaks, no points, no leaderboards)
- No social pressure (no "others who applied here" features)
- No artificial urgency (no countdown timers, no "X people viewing this")
- No dark patterns (no guilt-tripping for inactivity)

---

## Color System

The palette is built around warm neutrals with a single, deliberate accent. The warmth reduces screen fatigue during long sessions. The accent is used sparingly — only for the single most important action or status on any given screen.

### Light Theme (Default)

```
--surface-ground:      #F7F5F2    /* warm off-white, the canvas */
--surface-primary:     #FFFFFF    /* cards and elevated surfaces */
--surface-secondary:   #F0EDE8    /* subtle differentiation, sidebar backgrounds */
--surface-tertiary:    #E8E4DD    /* input backgrounds, hover states */

--text-primary:        #2C2825    /* near-black with warmth, main content */
--text-secondary:      #6B6560    /* descriptions, metadata */
--text-tertiary:       #9C9590    /* placeholders, disabled states */

--accent-primary:      #C4704B    /* terracotta — warm, grounded, confident */
--accent-primary-soft: #C4704B1A  /* 10% opacity for backgrounds */
--accent-primary-hover:#B5613C    /* darker on interaction */

--accent-success:      #5B8A6E    /* muted sage green — progress without alarm */
--accent-warning:      #C4A04B    /* warm amber — attention without anxiety */
--accent-danger:       #B85C5C    /* muted rose — serious but not aggressive */

--border-subtle:       #E8E4DD    /* barely visible structure */
--border-default:      #D9D4CC    /* clear delineation */

--shadow-sm:           0 1px 2px rgba(44, 40, 37, 0.06);
--shadow-md:           0 4px 12px rgba(44, 40, 37, 0.08);
--shadow-lg:           0 12px 36px rgba(44, 40, 37, 0.12);
```

### Dark Theme

```
--surface-ground:      #1A1816    /* deep warm charcoal */
--surface-primary:     #242220    /* elevated cards */
--surface-secondary:   #1E1C1A    /* sidebar, secondary areas */
--surface-tertiary:    #2E2B28    /* inputs, hover states */

--text-primary:        #E8E4DD    /* warm off-white text */
--text-secondary:      #9C9590    /* secondary content */
--text-tertiary:       #6B6560    /* placeholders */

--accent-primary:      #D4815C    /* slightly lighter terracotta for dark bg */
--accent-primary-soft: #D4815C1A
--accent-primary-hover:#E0926D

--accent-success:      #6B9A7E
--accent-warning:      #D4B05C
--accent-danger:       #C86C6C

--border-subtle:       #2E2B28
--border-default:      #3A3633

--shadow-sm:           0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-md:           0 4px 12px rgba(0, 0, 0, 0.3);
--shadow-lg:           0 12px 36px rgba(0, 0, 0, 0.4);
```

### Usage Rules

- The accent color appears on **one primary CTA per screen**, status indicators, and active navigation items. Nowhere else.
- Success/warning/danger colors are used exclusively for status communication, never for decoration.
- Backgrounds use the surface scale to create depth through subtle layering, not through borders or shadows alone.

---

## Typography

### Font Stack

- **Display / Headings**: [DM Serif Display](https://fonts.google.com/specimen/DM+Serif+Display) — Elegant serif with sharp terminals. Conveys authority and craft without being stuffy. Used for page titles and section headers only.
- **Body / UI**: [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) — Clean, modern sans-serif with excellent legibility at small sizes and subtle humanist warmth. Slightly rounded terminals prevent it from feeling clinical.
- **Monospace / Data**: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — For dates, IDs, code snippets, and tabular data where character alignment matters.

### Type Scale

```
--text-xs:     0.75rem / 1rem      /* 12px — metadata, timestamps */
--text-sm:     0.8125rem / 1.25rem /* 13px — secondary labels, captions */
--text-base:   0.9375rem / 1.5rem  /* 15px — body text, form inputs */
--text-lg:     1.125rem / 1.625rem /* 18px — section subheadings */
--text-xl:     1.5rem / 1.875rem   /* 24px — page section titles */
--text-2xl:    2rem / 2.25rem      /* 32px — page titles */
--text-3xl:    2.75rem / 3rem      /* 44px — hero/dashboard greeting */
```

### Typography Rules

- Body text is always `--text-base` (15px). Never smaller for readable content.
- Line length is capped at `65ch` for body text to maintain readability.
- Letter-spacing is tightened on display sizes (`-0.02em` at `--text-2xl` and above).
- Font weight range: 400 (body), 500 (labels/emphasis), 600 (headings). Never use 700+ — it creates visual tension.

---

## Spacing & Layout

### Spacing Scale

An 8px base grid with a 4px half-step for fine adjustments:

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px
```

### Layout Architecture

The application uses a **fixed sidebar + fluid main content** layout:

```
┌──────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌─────────────────────────────────────┐ │
│ │          │ │                                     │ │
│ │ Sidebar  │ │           Main Content              │ │
│ │          │ │                                     │ │
│ │  220px   │ │    fluid, max-width: 1200px         │ │
│ │          │ │    centered with auto margins        │ │
│ │          │ │                                     │ │
│ │          │ │  ┌─────────────────────────────────┐ │ │
│ │          │ │  │  Context bar (breadcrumb, acts) │ │ │
│ │          │ │  ├─────────────────────────────────┤ │ │
│ │          │ │  │                                 │ │ │
│ │          │ │  │       Page Content              │ │ │
│ │          │ │  │                                 │ │ │
│ │          │ │  └─────────────────────────────────┘ │ │
│ │          │ │                                     │ │
│ └──────────┘ └─────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

- **Sidebar**: 220px fixed width, collapsible to 64px (icon-only). Persists across all views.
- **Main content**: Fluid width with a `max-width: 1200px`. Horizontally centered.
- **Context bar**: Sticky top bar within the main content area. Contains breadcrumbs, page title, and primary page actions.
- **Slide-over panels**: Detail views and editors slide in from the right (480px width) over the main content, dimming the background. This keeps context visible while editing.

### Responsive Behavior

- **≥ 1280px**: Full sidebar + main content
- **1024–1279px**: Collapsed sidebar (icon-only) + full main content
- **< 1024px**: Sidebar becomes a bottom navigation bar with 5 key items. Main content fills the screen. Slide-over panels become full-screen modals.

---

## Iconography

Use [Lucide Icons](https://lucide.dev/) — clean, consistent, open-source. 20px default size. 1.5px stroke weight.

Icons are **never decorative**. Every icon must either:
1. Serve as the sole identifier for a navigation item (sidebar collapsed state)
2. Precede a label to accelerate visual scanning in lists
3. Communicate status (checkmark, clock, alert)

Icon colors follow text color hierarchy (`--text-primary`, `--text-secondary`, `--text-tertiary`) unless communicating status.

---

## Component Design

### Cards

The primary content container. Used for applications, resumes, jobs, interview plans.

```
Background:    --surface-primary
Border:        1px solid --border-subtle
Border-radius: 12px
Padding:       --space-5 (20px)
Shadow:        --shadow-sm (resting state)
Hover:         --shadow-md + translateY(-1px) over 200ms ease
```

Cards never have colored backgrounds unless communicating a specific status. Status is indicated by a thin left border accent (4px) using the appropriate status color.

### Inputs & Forms

```
Background:      --surface-tertiary
Border:          1px solid transparent
Border-radius:   8px
Padding:         --space-3 --space-4 (12px 16px)
Font-size:       --text-base
Transition:      border-color 150ms ease

Focus:
  Border:        1px solid --accent-primary
  Box-shadow:    0 0 0 3px --accent-primary-soft
  Background:    --surface-primary
```

- Labels are always visible (no placeholder-only inputs).
- Labels are positioned above the input with `--space-2` (8px) gap.
- Labels use `--text-sm`, `font-weight: 500`, `--text-secondary`.
- Helper text appears below the input in `--text-xs`, `--text-tertiary`.
- Error states replace the helper text with `--accent-danger` colored message and matching border.

### Buttons

Three tiers:

**Primary** (one per screen, max):
```
Background:    --accent-primary
Color:         #FFFFFF
Border-radius: 8px
Padding:       --space-3 --space-5 (12px 20px)
Font-weight:   500
Hover:         --accent-primary-hover
Active:        scale(0.98)
Transition:    all 150ms ease
```

**Secondary**:
```
Background:    transparent
Color:         --text-primary
Border:        1px solid --border-default
Border-radius: 8px
Padding:       --space-3 --space-5
Hover:         --surface-tertiary background
```

**Ghost/Tertiary**:
```
Background:    transparent
Color:         --text-secondary
Border:        none
Padding:       --space-2 --space-3
Hover:         --surface-tertiary background
```

### Toasts & Notifications

Toasts appear in the bottom-right, stacking upward. They auto-dismiss after 5 seconds. No sound. No vibration. Minimal visual weight.

```
Background:    --surface-primary
Border:        1px solid --border-subtle
Border-left:   3px solid [status-color]
Shadow:        --shadow-lg
Border-radius: 8px
```

Notifications (job alerts, etc.) collect silently in a notification center (bell icon in context bar). A small dot indicator (no count badge) signals unread items. The user checks at their own pace — no interruption.

---

## Motion & Animation

### Principles

- Motion is **functional**, never decorative. It communicates spatial relationships (where something came from, where it went) and state changes.
- Duration is **150–300ms** for micro-interactions, **300–500ms** for larger transitions (panel slides, page changes).
- Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)` for most transitions. Slightly decelerated, natural feeling.
- `prefers-reduced-motion: reduce` must be respected. All animations collapse to instant state changes.

### Specific Animations

| Action | Animation |
|--------|-----------|
| Card hover | `translateY(-1px)` + shadow elevation, 200ms |
| Slide-over open | Slide in from right, 350ms, with background dim fade |
| Slide-over close | Slide out to right, 250ms (faster exit) |
| Page transition | Content fades in with 8px upward translate, 300ms, staggered 50ms per section |
| Toast appear | Slide up 16px + fade in, 250ms |
| Toast dismiss | Fade out + slide right 16px, 200ms |
| Dropdown open | Scale from 0.95 + fade in, origin top-left, 150ms |
| Skeleton loading | Subtle pulse using opacity oscillation (0.5 → 1), 1.5s infinite |
| Status change | Background color cross-fade, 300ms |

### Page Load Sequence

When a page loads (including SPA navigation), content appears in a deliberate staggered sequence:

1. **Context bar** — instant (already in DOM)
2. **Page title + description** — fade in, 0ms delay
3. **Primary action area** — fade in, 50ms delay
4. **Content sections** — fade in with stagger, 100ms base + 50ms increment per section
5. **Secondary content** (sidebars, supplementary info) — fade in, 200ms delay

This creates a natural "settling" effect — the page assembles itself calmly rather than appearing all at once.

---

## Navigation & Information Architecture

### Sidebar Navigation

The sidebar is the primary navigation structure. It is organized by workflow phase:

```
┌──────────────────────┐
│                      │
│   CAREER BRIDGE      │  ← App wordmark, DM Serif Display
│                      │
│ ─────────────────    │
│                      │
│   ◆ Dashboard        │  ← Home/overview
│                      │
│   SEARCH             │  ← Section label
│   ○ Job Board        │
│   ○ Saved Jobs       │
│   ○ Alerts           │
│                      │
│   APPLY              │
│   ○ Applications     │  ← Active application tracking
│   ○ Resumes          │  ← Resume library & generation
│   ○ Experience       │  ← Projects & tasks library
│                      │
│   PREPARE            │
│   ○ Interviews       │  ← Interview prep & plans
│                      │
│ ─────────────────    │
│                      │
│   ○ Settings         │
│   ○ Profile          │
│                      │
└──────────────────────┘
```

Section labels (`SEARCH`, `APPLY`, `PREPARE`) map to the natural phases of a job search. This gives the user a mental model — "Where am I in my process?" — just by glancing at the sidebar.

Active nav items use `--accent-primary` text and a `--accent-primary-soft` background pill. Inactive items use `--text-secondary`. Hover state transitions to `--text-primary`.

### Keyboard Navigation

- `Cmd/Ctrl + K` — Command palette (search anything: jobs, applications, resumes, actions)
- `Cmd/Ctrl + N` — Quick-add menu (new application, new resume, new note)
- `1–9` — Navigate to sidebar items (when no input focused)
- `Esc` — Close any panel, modal, or menu
- `Tab / Shift+Tab` — Navigate focusable elements with visible focus ring
- `Enter` — Open selected item
- `E` — Edit focused item (when applicable)
- Arrow keys — Navigate within lists and tables

### Command Palette

The command palette is the power-user's primary interface. It provides fuzzy search across:
- All entities (applications, jobs, resumes, contacts)
- All actions ("Create new resume", "Add application", "Start interview prep")
- All navigation targets ("Go to Job Board", "Open Settings")
- Recent items (last 10 viewed)

Design:
```
┌────────────────────────────────────────────┐
│  🔍  Search anything...             ⌘K    │
├────────────────────────────────────────────┤
│                                            │
│  RECENT                                    │
│  ├─ Senior Frontend Engineer @ Stripe      │
│  ├─ Resume: Full-Stack Generalist          │
│  └─ Interview Prep: Acme Corp              │
│                                            │
│  ACTIONS                                   │
│  ├─ Create new application                 │
│  ├─ Generate tailored resume               │
│  └─ Start interview quiz                   │
│                                            │
└────────────────────────────────────────────┘
```

Centered overlay, 560px max-width, backdrop blur. Results update as user types with <100ms response time.

---

## Page Designs

### 1. Dashboard

The dashboard is the landing page. Its job is to answer one question: **"What should I work on right now?"**

It is NOT a metrics vanity dashboard. It does not show pie charts of application statuses or a graph of applications over time. It shows **actionable items**.

#### Layout

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Good morning, Cliff.                            │  ← Greeting, DM Serif Display
│  You have 3 things that need attention.           │  ← Summary line
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  NEEDS ATTENTION                            │ │
│  │                                             │ │
│  │  ┌───────────┐ ┌───────────┐ ┌──────────┐  │ │
│  │  │ Interview │ │ Follow-up │ │ New match│  │ │
│  │  │ tomorrow  │ │ overdue   │ │ 3 jobs   │  │ │
│  │  │ Acme Corp │ │ Stripe    │ │ matched  │  │ │
│  │  │           │ │           │ │          │  │ │
│  │  │  Prepare →│ │  View  → │ │  View → │  │ │
│  │  └───────────┘ └───────────┘ └──────────┘  │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────┐ ┌────────────────────┐  │
│  │  ACTIVE PIPELINE    │ │  QUICK ACTIONS     │  │
│  │                     │ │                    │  │
│  │  ● Acme Corp       │ │  + Add application │  │
│  │    On-site Wed      │ │  + Generate resume │  │
│  │  ● Stripe          │ │  + Find jobs       │  │
│  │    Awaiting resp.   │ │  + Start prep      │  │
│  │  ● Figma           │ │                    │  │
│  │    Phone screen Fri │ │                    │  │
│  │                     │ │                    │  │
│  └─────────────────────┘ └────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

- **Needs Attention cards**: Orange-amber left border. Each card has a clear action verb ("Prepare", "Follow up", "Review"). Maximum 5 cards shown; overflow becomes a "View all" link.
- **Active Pipeline**: Compact list of in-progress applications with their current stage and next milestone. Sorted by next action date.
- **Quick Actions**: Direct links to the most common workflows.

### 2. Applications Tracker

The primary workspace for managing active job applications.

#### List View (Default)

A clean table-list hybrid. Each row is a card-row:

```
┌──────────────────────────────────────────────────────┐
│  Applications                    + New Application   │
│  12 active · 8 archived                              │
│                                                      │
│  ┌─ Filter: All ▾   Stage: All ▾   Sort: Recent ▾ ┐ │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ◆  Senior Frontend Engineer                     ││
│  │    Stripe · Applied Mar 3 · Phone Screen         ││
│  │    Next: Technical interview Mar 15              ││
│  │                                          ··· →   ││
│  ├──────────────────────────────────────────────────┤│
│  │ ◆  Staff Software Engineer                      ││
│  │    Acme Corp · Applied Feb 28 · On-site          ││
│  │    Next: On-site visit Mar 13                    ││
│  │                                          ··· →   ││
│  ├──────────────────────────────────────────────────┤│
│  │ ○  Product Engineer                             ││
│  │    Figma · Applied Mar 8 · Applied               ││
│  │    Awaiting response                             ││
│  │                                          ··· →   ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

- The filled dot (`◆`) indicates applications with upcoming actions. Empty dot (`○`) for waiting/idle.
- Clicking a row opens the application detail in a slide-over panel.
- Keyboard: arrow keys navigate rows, `Enter` opens detail, `N` creates new.

#### Application Detail (Slide-over Panel)

```
┌────────────────────────────────────────────┐
│  ← Back                    Archive   Edit  │
│                                            │
│  Senior Frontend Engineer                  │
│  Stripe                                    │
│  Applied: March 3, 2026                    │
│                                            │
│  PIPELINE                                  │
│  ●───────●───────●───────○───────○         │
│  Applied  Phone   Technical On-site Offer  │
│                                            │
│  ─────────────────────────────────         │
│                                            │
│  TIMELINE                                  │
│                                            │
│  Mar 10 · Phone Screen                     │
│  Spoke with Sarah, Engineering Manager.    │
│  Discussed team structure and role scope.  │
│  Positive signals. [Edit note]             │
│                                            │
│  Mar 3 · Applied                           │
│  Submitted via company portal.             │
│  Used "Full-Stack Generalist" resume.      │
│  [View resume snapshot]                    │
│                                            │
│  ─────────────────────────────────         │
│                                            │
│  + Add note     + Log event                │
│                                            │
│  LINKED ITEMS                              │
│  📄 Resume: Full-Stack Generalist v3       │
│  📋 Interview Prep: Stripe On-site         │
│                                            │
└────────────────────────────────────────────┘
```

- **Pipeline visualization**: Horizontal step indicator showing all stages. Completed stages filled, current stage highlighted with accent, future stages hollow.
- **Timeline**: Reverse-chronological event log. Each entry has a date, event type, and editable notes. This is the central record of everything that happened with this application.
- **Linked items**: References to the resume used and any interview prep created for this application.

### 3. Resume Library

#### Library View

```
┌──────────────────────────────────────────────────────┐
│  Resumes                             + New Resume    │
│  5 resumes · 12 versions                             │
│                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │              │ │              │ │              │  │
│  │  Full-Stack  │ │  Frontend    │ │  Engineering │  │
│  │  Generalist  │ │  Specialist  │ │  Manager     │  │
│  │              │ │              │ │              │  │
│  │  v3 · Mar 8  │ │  v2 · Feb 20│ │  v1 · Feb 15│  │
│  │  Used 4x     │ │  Used 2x    │ │  Used 1x    │  │
│  │              │ │              │ │              │  │
│  │  Edit  Share │ │  Edit  Share │ │  Edit  Share │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                      │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                      │
│  AI RESUME GENERATION                                │
│                                                      │
│  Generate a tailored resume from your experience     │
│  library. Paste a job posting or describe a role.     │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Paste job posting URL or description...       │  │
│  │                                                │  │
│  │                                                │  │
│  │                                    Generate →  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Resumes displayed as cards in a grid (3 columns on desktop, 2 on tablet, 1 on mobile).
- Each card shows the resume name, version, last modified date, and usage count.
- The AI generation area is visually separated but always accessible — no need to hunt for it in a menu.

#### Resume Editor

Full-page view (not slide-over — needs more room):

```
┌──────────────────────────────────────────────────────┐
│  ← Back to Library                 Save   Export ▾   │
│                                                      │
│  Full-Stack Generalist                    v3         │
│  Last edited: March 8, 2026                          │
│                                                      │
│  ┌────────────────────────┐ ┌──────────────────────┐ │
│  │                        │ │                      │ │
│  │    EDITOR              │ │    PREVIEW           │ │
│  │                        │ │                      │ │
│  │  Structured form       │ │  Live rendered       │ │
│  │  sections:             │ │  resume preview      │ │
│  │                        │ │                      │ │
│  │  - Summary             │ │  Updates in          │ │
│  │  - Experience          │ │  real-time as        │ │
│  │  - Projects            │ │  editor changes      │ │
│  │  - Skills              │ │                      │ │
│  │  - Education           │ │                      │ │
│  │                        │ │                      │ │
│  │  Each section has      │ │                      │ │
│  │  AI assist button      │ │                      │ │
│  │                        │ │                      │ │
│  └────────────────────────┘ └──────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Split view: editor on left, live preview on right. Ratio is adjustable via drag handle.
- Editor uses structured sections (not a raw text editor). Each section has clear fields.
- Each section has a subtle "AI Assist" button that can rewrite, expand, or tailor that section.
- AI suggestions appear inline as ghost text or in a diff-style overlay, always editable before accepting.

### 4. Experience Library

The experience library is the user's career database — all projects, accomplishments, skills, and tasks they've done throughout their career. This is the source material AI uses to generate tailored resumes.

```
┌──────────────────────────────────────────────────────┐
│  Experience Library                  + Add Entry     │
│  Your career history, ready for any resume.          │
│                                                      │
│  ┌─ Filter: All ▾   Type: All ▾   Search...       ┐ │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ PROJECT                                         ││
│  │ Redesigned checkout flow                        ││
│  │ Acme Corp · 2024                                ││
│  │ Reduced cart abandonment by 23%. Led a team     ││
│  │ of 3 engineers. React, TypeScript, A/B testing. ││
│  │                                      Edit  ···  ││
│  ├──────────────────────────────────────────────────┤│
│  │ SKILL                                           ││
│  │ System Design                                   ││
│  │ 8 years · Advanced                              ││
│  │ Distributed systems, microservices, event-      ││
│  │ driven architecture.                            ││
│  │                                      Edit  ···  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  AI can pull from these entries when generating      │
│  tailored resumes. The more detail, the better.      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Entries are categorized: `PROJECT`, `ROLE`, `SKILL`, `ACHIEVEMENT`, `CERTIFICATION`.
- Each entry can have tags for easy filtering.
- Rich text descriptions with quantified impact metrics.
- AI integration: when generating a resume, the AI selects the most relevant entries and adapts their language to match the target role.

### 5. Job Board & Search

```
┌──────────────────────────────────────────────────────┐
│  Job Board                                           │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Search roles, companies, or skills...         │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Location ▾  Remote ▾  Level ▾  Salary ▾  ────┐  │
│                                                      │
│  ┌────────────────────────────┐ ┌────────────────┐   │
│  │                            │ │                │   │
│  │  JOB RESULTS               │ │  JOB DETAIL    │   │
│  │                            │ │                │   │
│  │  ┌──────────────────────┐  │ │  Senior FE     │   │
│  │  │▸ Senior Frontend Eng │  │ │  Engineer      │   │
│  │  │  Stripe · Remote     │  │ │  Stripe        │   │
│  │  │  $180–220k · 92%     │  │ │                │   │
│  │  └──────────────────────┘  │ │  Remote · NYC  │   │
│  │  ┌──────────────────────┐  │ │  $180–220k     │   │
│  │  │  Staff SWE            │  │ │                │   │
│  │  │  Acme · Hybrid       │  │ │  92% match     │   │
│  │  │  $200–250k · 87%     │  │ │                │   │
│  │  └──────────────────────┘  │ │  ────────────  │   │
│  │                            │ │                │   │
│  │                            │ │  [Description] │   │
│  │                            │ │                │   │
│  │                            │ │  Save   Apply  │   │
│  │                            │ │  Gen Resume    │   │
│  │                            │ │                │   │
│  └────────────────────────────┘ └────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- **List-detail split view**: Results on the left (scrollable list), selected job's full detail on the right.
- **Match percentage**: AI-calculated match score based on the user's experience library. Shown as a compact percentage. Color coded: `≥ 85%` uses success color, `70–84%` uses warning, `< 70%` uses text-tertiary.
- **Actions on job detail**: Save to favorites, start application tracking, generate tailored resume (launches resume generator pre-filled with job posting data).
- **Job alerts** (separate "Alerts" nav item): Configure saved searches with notification preferences. New matches appear as notification dots.

### 6. Interview Preparation

```
┌──────────────────────────────────────────────────────┐
│  Interview Prep                   + New Prep Plan    │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ Stripe — Senior Frontend Engineer                ││
│  │ On-site · March 15, 2026 · 4 days away          ││
│  │                                                  ││
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ ││
│  │ │  Plan   │ │  Notes  │ │  Quiz   │ │Outline │ ││
│  │ │  ✓ Done │ │ 5 notes │ │ 78% avg │ │ Draft  │ ││
│  │ └─────────┘ └─────────┘ └─────────┘ └────────┘ ││
│  │                                                  ││
│  │                               Open Prep →        ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ Acme Corp — Staff Software Engineer              ││
│  │ Phone Screen · March 20, 2026 · 9 days away     ││
│  │ ...                                              ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

#### Prep Detail View (Full Page)

Tabbed interface within the prep plan:

**Plan Tab**: AI-generated study plan based on the job posting, company research, and interview type. Checklist format with topics to review, skills to practice, and research to do. Fully editable.

**Notes Tab**: Free-form notes organized by topic. Can link to external resources. Rich text with markdown support.

**Quiz Tab**:
```
┌──────────────────────────────────────────────────────┐
│  Quiz · Stripe Frontend Interview                    │
│                                                      │
│  Question 5 of 20                    ● ● ● ● ○ ...  │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │                                                  ││
│  │  "Describe how you would optimize the rendering  ││
│  │   performance of a React application with 1000+  ││
│  │   list items that update in real-time."           ││
│  │                                                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │  Your answer...                                  ││
│  │                                                  ││
│  │                                                  ││
│  │                                                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│                          Submit Answer →              │
│                                                      │
│  After submission:                                   │
│  ┌──────────────────────────────────────────────────┐│
│  │  AI FEEDBACK                                     ││
│  │                                                  ││
│  │  ✓ Good coverage of virtualization               ││
│  │  ✓ Mentioned React.memo correctly                ││
│  │  △ Consider also mentioning useDeferredValue     ││
│  │  △ Could strengthen with a real example          ││
│  │                                                  ││
│  │  Score: 7/10                                     ││
│  │                                                  ││
│  │               Next Question →                    ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

- Questions are AI-generated based on the job posting, role type, and common interview patterns.
- User types free-form answers (no multiple choice — this simulates real interviews).
- AI provides structured feedback after each answer: what was strong, what was missing, score.
- Session summary at the end with overall score, weak areas to review, and suggested follow-up questions.

**Outline Tab**: Structured talking points and stories the user wants to have ready. Organized by common interview question categories (behavioral, technical, situational). Each entry can link to an experience library item for reference.

---

## AI Integration Design Patterns

AI is deeply integrated but never autonomous. Every AI interaction follows a consistent pattern:

### The AI Assist Pattern

```
┌──────────────────────────────────────────────┐
│                                              │
│  [Content area - text, section, etc.]        │
│                                              │
│         ┌──────────────────┐                 │
│         │  ✦ AI Assist  ▾  │                 │
│         └──────────────────┘                 │
│                                              │
│  Clicking opens a contextual menu:           │
│                                              │
│  ┌──────────────────────────┐                │
│  │  Rewrite for clarity     │                │
│  │  Expand with details     │                │
│  │  Tailor for [role]       │                │
│  │  Make more concise       │                │
│  │  Custom instruction...   │                │
│  └──────────────────────────┘                │
│                                              │
└──────────────────────────────────────────────┘
```

### AI Output Presentation

AI-generated content is ALWAYS:
1. **Visually distinguished** — Shown with a subtle left border using a muted accent and a small `✦` icon, making it clear this was AI-generated.
2. **Inline editable** — The user can click into it and edit directly. No "accept/reject" modal flow.
3. **Diffable** — When AI rewrites existing content, the original is preserved and a subtle inline diff shows what changed. User can toggle between versions.
4. **Dismissable** — A single click/key dismisses the suggestion entirely.

### AI Loading States

When AI is processing:
- The target area shows a gentle pulse animation (not a spinner — spinners create anxiety).
- A small text indicator reads "Thinking..." with an ellipsis animation.
- The rest of the interface remains fully interactive.
- There is always a cancel button.

---

## Data Patterns & Empty States

### Empty States

Every view has a thoughtful empty state. Empty states are NOT just "Nothing here yet" with a button. They are:
1. **Encouraging** — "Your resume library is a blank canvas. Start with one resume and evolve it as you discover what works."
2. **Actionable** — A single clear CTA, styled as the primary button.
3. **Educational** — A brief explanation of what this area does and why it matters.

### Loading States

- Skeleton screens match the layout of the actual content (not generic gray rectangles).
- Skeletons use the subtle pulse animation described in the motion section.
- Text skeletons have varying widths (60%, 80%, 40%) to simulate natural text patterns.

### Error States

- Errors are displayed inline, near the action that failed.
- Language is human: "We couldn't save your changes. Your edits are still here — try again." Not: "Error 500: Internal Server Error."
- A retry action is always available.
- Errors auto-dismiss after successful retry.

---

## Accessibility

- **WCAG 2.1 AA** compliance minimum.
- All interactive elements have visible focus indicators (2px `--accent-primary` outline with 2px offset).
- Color is never the sole indicator of status — always paired with icon or text.
- All images and icons have appropriate alt text or aria-labels.
- Form inputs are always associated with visible labels (not placeholder-only).
- Motion can be disabled via `prefers-reduced-motion`.
- Minimum touch target: 44x44px on mobile.
- Contrast ratios: 4.5:1 for body text, 3:1 for large text and UI components.

---

## Responsive Breakpoints

```
--bp-sm:   640px    /* Mobile landscape */
--bp-md:   768px    /* Tablet portrait */
--bp-lg:   1024px   /* Tablet landscape / small desktop */
--bp-xl:   1280px   /* Desktop */
--bp-2xl:  1536px   /* Large desktop */
```

### Mobile Adaptations (< 1024px)

- Sidebar collapses to a bottom tab bar: Dashboard, Jobs, Applications, Resumes, Prep.
- Slide-over panels become full-screen views with a back button.
- Split views (job board, resume editor) become single-column with a tab or segmented control to switch between panes.
- Command palette remains centered overlay but takes full width with padding.
- Cards stack vertically in single column.
- Context bar simplifies: breadcrumbs collapse to "← Back", actions move to a "···" overflow menu.

---

## Micro-Copy & Tone of Voice

The app's language is:
- **Calm and supportive** — Never urgent, never pushy. "You might want to follow up with Stripe — it's been 5 days" not "OVERDUE: Follow up with Stripe NOW!"
- **Clear and direct** — "Save resume" not "Persist document to library." "Find jobs" not "Explore opportunities."
- **Human** — "Something went wrong on our end" not "Error 500."
- **Empowering** — "Your interview prep is looking solid" not "You're 73% prepared." Avoid reducing human experiences to percentages where it creates pressure.

### Naming Conventions

| Concept | Term Used | NOT |
|---------|-----------|-----|
| Job application tracking | Application | Opportunity, Lead |
| Career history database | Experience Library | Portfolio, Career Vault |
| AI content generation | AI Assist | Magic, Auto-generate |
| Interview preparation | Interview Prep | Study Guide, Cramming |
| Resume variations | Versions | Iterations, Drafts |
| Saved job searches | Alerts | Watchers, Subscriptions |

---

## File Export & Data Portability

- Resumes exportable as PDF (primary), DOCX, and plain text.
- All user data exportable as JSON for portability.
- Application data exportable as CSV for spreadsheet users.
- No lock-in — the user can leave with everything they brought and created.

---

## Summary of Visual Identity

| Element | Choice | Rationale |
|---------|--------|-----------|
| Primary typeface | DM Serif Display | Authority and craft without pretension |
| Body typeface | Instrument Sans | Warm, legible, modern |
| Accent color | Terracotta (#C4704B) | Warm, grounded, confident — not corporate blue, not startup purple |
| Background | Warm off-white (#F7F5F2) | Reduces eye strain, feels personal not institutional |
| Layout | Sidebar + fluid content | Predictable navigation, maximum content space |
| Interactions | Slide-over panels | Maintain context while editing details |
| AI presentation | Inline, editable, dismissable | User retains full control |
| Motion philosophy | Functional, calm, staggered | Reduces cognitive jarring, creates natural rhythm |
| Empty states | Encouraging + educational | Reduces new-user anxiety |
| Error language | Human, actionable | Reduces frustration |
| Notification style | Silent collection, dot indicator | Reduces interruption stress |
