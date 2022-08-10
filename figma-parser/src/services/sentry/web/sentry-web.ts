import * as sentry from '@sentry/browser'

import type { CreateSentryOptions, SentryFactory } from '../sentry-factory.iface.js'

const createSentryWeb: SentryFactory = (options: CreateSentryOptions): typeof sentry | null => {
  const { dsn, env, logger } = options
  if (!dsn) {
    logger.warn('No Sentry DSN detected, skipping log tracking')
    return null
  }
  const environment = typeof env === 'string' ? env : 'staging'
  sentry.init({ dsn, environment })
  return sentry
}

export { createSentryWeb }
