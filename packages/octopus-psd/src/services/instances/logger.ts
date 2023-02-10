import { createDefaultLogger } from '../general/default-logger'

import type { Logger } from '../../typings/index'

/**
 * Module-based singleton
 */
export let logger: Logger = createDefaultLogger()

export function set(instance: Logger): void {
  logger = instance
}
