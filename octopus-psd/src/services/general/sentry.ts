import * as sentry from '@sentry/node'

import type { Logger } from '../../typings'

type CreateSentryOptions = {
  dsn?: string
  env?: string
  logger: Logger
}

export function createSentry({ dsn, env, logger }: CreateSentryOptions) {
  if (!dsn) {
    logger.warn('No Sentry DSN detected, skipping log tracking')
    return null
  }
  const environment = typeof env === 'string' ? env : 'staging'
  sentry.init({ dsn, environment })
  return sentry
}
