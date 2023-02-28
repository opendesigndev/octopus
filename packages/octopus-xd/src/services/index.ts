import { getPlatformFactories } from './general/platforms/index.js'

import type { Logger } from './general/logger/logger.js'
import type { CreateLoggerOptions } from './general/logger/logger-factory.iface.js'

type DefaultOptions = {
  logger: CreateLoggerOptions
}

export let logger: Logger | null = null

export function setLogger(instance: Logger): void {
  logger = instance
}

export function setDefaults(options: DefaultOptions): void {
  logger = getPlatformFactories().createLoggerFactory()(options.logger)
}
