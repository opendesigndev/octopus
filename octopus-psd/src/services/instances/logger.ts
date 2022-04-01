import type { Logger } from '../../typings'
import { createDefaultLogger } from '../general/default-logger'

/**
 * Module-based singleton
 */
export let logger: Logger = createDefaultLogger()

export function set(instance: Logger): void {
  logger = instance
}
