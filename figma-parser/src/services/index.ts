import { getPlatformFactories } from './platforms/index.js'

import type { Logger } from '../services/logger/logger.js'
import type { SentryFactory } from './sentry/sentry-factory.iface.js'

type Sentry = ReturnType<SentryFactory>

export let logger: Logger | null = null
export let sentry: Sentry | null = null

export function setLogger(instance: Logger): void {
  logger = instance
}

export function setSentry(instance: Sentry): void {
  sentry = instance
}

export function setDefaults(): void {
  logger = getPlatformFactories().createLoggerFactory()()
  sentry = getPlatformFactories().createSentryFactory()({
    dsn: process.env.SENTRY_DSN,
    logger: logger as Logger,
  })
}
