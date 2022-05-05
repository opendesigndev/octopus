import { logger } from './logger'
import { sentry } from './sentry'

import type { Extras } from '@sentry/types'

export function logInfo(msg: string, extra?: unknown): void {
  logger?.info(msg, extra)
  sentry?.captureMessage(msg, { extra: extra as Extras })
}

export function logWarn(msg: string, extra?: unknown): void {
  logger?.warn(msg, extra)
  sentry?.captureMessage(msg, { extra: extra as Extras })
}

export function logError(msg: string, extra?: unknown): void {
  logger?.error(msg, extra)
  sentry?.captureMessage(msg, { extra: extra as Extras })
}
