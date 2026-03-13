import { applicationHandlers } from './applications'
import { experienceHandlers } from './experiences'
import { healthHandlers } from './health'
import { resumeHandlers } from './resumes'

export const handlers = [
  ...healthHandlers,
  ...experienceHandlers,
  ...resumeHandlers,
  ...applicationHandlers,
]
