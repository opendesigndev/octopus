import { createDefaultLogger } from '../general/default-logger.js'

import type { Logger } from '../../typings/index.js'

/**
 * Module-based singleton
 */
export let logger: Logger = createDefaultLogger()

export function set(instance: Logger): void {
  logger = instance
}
