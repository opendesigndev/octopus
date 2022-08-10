import * as sentry from '@sentry/node'

import type { Logger } from '../../typings/index.js'

type CreateSentryOptions = {
  dsn?: string
  env?: string
  logger: Logger
}

export function createSentry(options: CreateSentryOptions): typeof sentry | null {
  const { dsn, env, logger } = options
  if (!dsn) {
    logger.warn('No Sentry DSN detected, skipping log tracking')
    return null
  }
  const environment = typeof env === 'string' ? env : 'staging'
  sentry.init({ dsn, environment })
  return sentry
}
