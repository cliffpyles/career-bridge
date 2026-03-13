import { applicationHandlers } from './applications'
import { dashboardHandlers } from './dashboard'
import { experienceHandlers } from './experiences'
import { healthHandlers } from './health'
import { jobHandlers } from './jobs'
import { resumeHandlers } from './resumes'

export const handlers = [
  ...healthHandlers,
  ...experienceHandlers,
  ...resumeHandlers,
  ...applicationHandlers,
  ...dashboardHandlers,
  ...jobHandlers,
]
