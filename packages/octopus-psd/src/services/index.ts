import { getPlatformFactories } from './general/platforms/index.js'

import type { Env } from './general/environment/index.js'
import type { Logger } from './general/logger/logger'
import type { CreateLoggerOptions } from './general/logger/logger-factory'

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
  //   base64ToUint8Array = getPlatformFactories().createBufferService().base64ToUint8Array
  //   imageSize = getPlatformFactories().createImageSizeService()
}
