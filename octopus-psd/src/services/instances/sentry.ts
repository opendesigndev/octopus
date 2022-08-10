import type { createSentry } from '../general/sentry.js'

type Sentry = ReturnType<typeof createSentry>

/**
 * Module-based singleton
 */
export let sentry: Sentry | null = null

export function set(instance: Sentry): void {
  sentry = instance
}
