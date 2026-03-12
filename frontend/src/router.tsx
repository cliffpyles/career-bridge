import { createBrowserRouter } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { JobBoardPage } from './pages/JobBoardPage'
import { SavedJobsPage } from './pages/SavedJobsPage'
import { AlertsPage } from './pages/AlertsPage'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { ResumesPage } from './pages/ResumesPage'
import { ResumeEditorPage } from './pages/ResumeEditorPage'
import { ExperiencePage } from './pages/ExperiencePage'
import { InterviewsPage } from './pages/InterviewsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ErrorPage } from './pages/ErrorPage'
import { LoginPage } from './pages/LoginPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: AppShell,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'jobs', Component: JobBoardPage },
      { path: 'saved-jobs', Component: SavedJobsPage },
      { path: 'alerts', Component: AlertsPage },
      { path: 'applications', Component: ApplicationsPage },
      { path: 'resumes', Component: ResumesPage },
      { path: 'resumes/:id', Component: ResumeEditorPage },
      { path: 'experience', Component: ExperiencePage },
      { path: 'interviews', Component: InterviewsPage },
      { path: 'settings', Component: SettingsPage },
      { path: 'profile', Component: ProfilePage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
