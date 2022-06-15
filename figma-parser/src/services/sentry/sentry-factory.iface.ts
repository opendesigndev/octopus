import type { Logger } from '../logger/logger'
import type { Sentry } from './sentry'

export type CreateSentryOptions = {
  dsn?: string
  env?: string
  logger: Logger
}

export interface SentryFactory {
  (options: CreateSentryOptions): Sentry | null
}
