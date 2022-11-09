import { getPlatformFactories } from './general/platforms'

import type { Env } from './general/environment'
import type { Logger } from './general/logger/logger'
import type { CreateLoggerOptions } from './general/logger/logger-factory'

type DefaultOptions = {
  logger: CreateLoggerOptions
}

export let logger: Logger | null = null
export let env: Env

export function setLogger(instance: Logger): void {
  logger = instance
}

export function setDefaults(options: DefaultOptions): void {
  env = getPlatformFactories().createEnvironment?.() ?? {}
  logger = getPlatformFactories().createLoggerFactory(options.logger)
}
