import type { Logger } from '../logger/logger.js'
import type { Sentry } from './sentry.js'

export type CreateSentryOptions = {
  dsn?: string
  env?: string
  logger: Logger
}

export interface SentryFactory {
  (options: CreateSentryOptions): Sentry | null
}
