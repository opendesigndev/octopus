import { getPlatformFactories } from './general/platforms/index.js'

import type { Env } from './general/environment/index.js'
import type { CreateLoggerOptions } from './general/logger/logger-factory.js'
import type { Logger } from './general/logger/logger.js'

type DefaultOptions = {
  logger: CreateLoggerOptions
}

export let env: Env

export let logger: Logger | null = null

export function setLogger(instance: Logger): void {
  logger = instance
}

export function setDefaults(options: DefaultOptions): void {
  env = getPlatformFactories().createEnvironment?.() ?? {}
  logger = getPlatformFactories().createLoggerFactory(options.logger)
}
