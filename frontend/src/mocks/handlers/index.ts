import { experienceHandlers } from './experiences'
import { healthHandlers } from './health'

export const handlers = [
  ...healthHandlers,
  ...experienceHandlers,
]
