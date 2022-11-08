import { getPlatformFactories } from './platforms'

import type { Logger } from '../services/logger/logger'

export let logger: Logger | null = null

export function setLogger(instance: Logger): void {
  logger = instance
}

export function setDefaults(): void {
  logger = getPlatformFactories().createLoggerFactory()()
}
