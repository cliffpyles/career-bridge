# Frontend

React 19 SPA for Career Bridge — built with TypeScript, Vite 7, React Router v7 (Data Mode), TanStack Query, and CSS Modules.

## Quick Start

```bash
npm install
npm run dev   # http://localhost:5173
```

In development mode all `/api/*` requests are intercepted by MSW stubs, so the frontend runs without a running backend. The stub layer covers auth, experiences, and health endpoints.

## Scripts

| Command                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Vite dev server with HMR at `:5173`              |
| `npm run build`         | Type-check (`tsc -b`) then produce `dist/`       |
| `npm run preview`       | Serve the production build locally               |
| `npm run lint`          | ESLint over all source files                     |
| `npm test`              | Vitest run (one-shot, CI mode)                   |
| `npm run test:watch`    | Vitest in interactive watch mode                 |
| `npm run test:coverage` | Coverage report via v8 into `coverage/`          |
| `npm run msw:init`      | Regenerate `public/mockServiceWorker.js`         |

## Project Structure

```
src/
  lib/
    tokens.css          # Single source of truth for all design tokens
    api-client.ts       # Typed fetch wrapper with ApiError and auth headers
    query-client.ts     # Configured TanStack QueryClient
    ai-stream.ts        # SSE streaming utility for AI responses
  components/
    ui/                 # Primitive component library (13 components)
    layout/             # AppShell, Sidebar, ContextBar, BottomNav
  contexts/
    AuthContext.tsx     # JWT auth state, login/register/logout, token persistence
    ThemeContext.tsx    # Light/dark toggle, persisted to localStorage
    SidebarContext.tsx  # Collapsed/expanded state with responsive breakpoints
    ToastContext.tsx    # Imperative toast() API with queuing and auto-dismiss
  pages/
    LoginPage.tsx       # Public split-panel sign-in / register page
    DashboardPage.tsx   # Aggregated landing (coming soon)
    ExperiencePage.tsx  # Experience library — full CRUD with filtering and search
    ResumesPage.tsx     # Resume library and editor (coming soon)
    ApplicationsPage.tsx # Application tracker (coming soon)
    InterviewsPage.tsx  # Interview prep (coming soon)
    JobBoardPage.tsx    # Job search (coming soon)
    SavedJobsPage.tsx   # Saved job listings (coming soon)
    AlertsPage.tsx      # Job alerts (coming soon)
    SettingsPage.tsx    # Theme toggle and account management (sign out)
    ProfilePage.tsx     # User profile (coming soon)
    NotFoundPage.tsx    # 404 handler
    ErrorPage.tsx       # React Router error boundary
  queries/
    keys.ts             # Centralized TanStack Query key factory
  mocks/
    browser.ts          # MSW browser worker setup
    server.ts           # MSW Node server (used in tests)
    handlers/           # Request handlers: health, auth, experiences
  router.tsx            # React Router v7 Data Mode route tree
  main.tsx              # App entry — providers, MSW init, RouterProvider
  test/
    setup.ts            # Vitest setup: MSW lifecycle + jsdom API stubs
    utils.tsx           # renderWithProviders helper wrapping all contexts
    ui/                 # UI component tests
    layout/             # Layout component tests
    contexts/           # Context tests
```

## Authentication

All authenticated routes are guarded by `AppShell`, which reads from `AuthContext`. Unauthenticated visitors are redirected to `/login` with the intended destination preserved. On return, they land where they originally tried to go.

`AuthContext` persists the JWT to `localStorage` under the key `career-bridge-auth-token` and restores the session on page load via `GET /auth/me`. The `logout()` function clears the token, resets user state, and invalidates the TanStack Query cache.

## UI Component Library

All components live in `src/components/ui/` and are exported from `src/components/ui/index.ts`.
Each component has a `.tsx` file and a `.module.css` file that references design tokens exclusively.

| Component        | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `Button`         | primary / secondary / ghost / danger; sizes sm/md/lg; loading state |
| `Card`           | surface, padding, hover, and selected variants            |
| `Input`          | label, helper text, error state, leading/trailing icon    |
| `TextArea`       | auto-resize, row control, same error/helper API as Input  |
| `Select`         | typed `options` prop, same error/helper API as Input      |
| `Badge`          | status, category, and neutral semantic variants           |
| `Toast`          | info / success / warning / error; auto-dismiss; action slot |
| `Skeleton`       | block, circle, and text pulse placeholders                |
| `EmptyState`     | icon, title, description, and action slot                 |
| `SlideOver`      | accessible right-side drawer with overlay and close button |
| `Dropdown`       | anchor-positioned menu with keyboard navigation           |
| `CommandPalette` | fuzzy-search command launcher (⌘K)                        |
| `Modal`          | focus-trapped dialog using the native `<dialog>` element  |

## Design Tokens

`src/lib/tokens.css` is the single source of truth. All tokens are CSS custom properties on `:root` (light theme) and `[data-theme="dark"]`. Token categories:

- **Surfaces** — `--surface-ground`, `--surface-primary`, `--surface-secondary`, `--surface-tertiary`
- **Text** — `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-inverse`
- **Borders** — `--border-subtle`, `--border-default`, `--border-strong`
- **Accent** — `--accent-primary` through `--accent-hover` / `--accent-active` / `--accent-text`
- **Status** — `--status-success-*`, `--status-warning-*`, `--status-error-*`, `--status-info-*`
- **Typography** — DM Serif Display (headings), Instrument Sans (body), JetBrains Mono (code)
- **Spacing** — `--space-1` … `--space-16`
- **Shadows** — `--shadow-sm` … `--shadow-xl`
- **Animations** — `--duration-fast/normal/slow`, `--ease-standard/spring`

## API Client

`src/lib/api-client.ts` exports a typed `apiClient` with `get`, `post`, `put`, `patch`, and `delete` methods. All methods:

- Prepend `VITE_API_BASE_URL` (default `/api`)
- Inject the `Authorization: Bearer <token>` header if a token is present
- Parse non-2xx responses into a structured `ApiError` with `.status`, `.statusText`, `.body`, and helper methods (`.isNotFound()`, `.isUnauthorized()`, etc.)

## Testing

Tests use Vitest + React Testing Library. 114 tests across 15 files.

```bash
npm test
```

The test setup (`src/test/setup.ts`) starts the MSW Node server, handles server lifecycle, and stubs browser APIs not implemented by jsdom (`matchMedia`, `scrollIntoView`, `HTMLDialogElement`).

Use `renderWithProviders` from `src/test/utils.tsx` when testing components that need any context:

```ts
import { renderWithProviders } from '../test/utils'

test('renders', () => {
  renderWithProviders(<MyComponent />)
})
```

## Environment Variables

| Variable        | Default | Description                                          |
| --------------- | ------- | ---------------------------------------------------- |
| `VITE_API_URL`  | `/api`  | Base path for all API requests                       |
| `VITE_MSW`      | `false` | Set to `true` to enable MSW request interception     |

Copy `.env.example` to `.env.local` and override as needed for local development.
