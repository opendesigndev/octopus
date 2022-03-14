import { logger } from './logger'
import { sentry } from './sentry'
import type { Extras } from '@sentry/types'

export function logWarn(msg: string, extra: unknown): void {
  logger?.warn(msg, extra)
  sentry?.captureMessage(msg, { extra: extra as Extras })
}
