import { getPlatformFactories } from './general/platforms'

import type { Env } from './general/environment'
import type { Logger } from './general/logger/logger'
import type { CreateLoggerOptions } from './general/logger/logger-factory'
import type { ImageSizeService } from './general/platforms'

type DefaultOptions = {
  logger: CreateLoggerOptions
}

export let logger: Logger | null = null
export let env: Env
export let base64ToUint8Array: (base64: string) => Uint8Array
export let imageSize: ImageSizeService

export function setLogger(instance: Logger): void {
  logger = instance
}

export function setDefaults(options: DefaultOptions): void {
  env = getPlatformFactories().createEnvironment?.() ?? {}
  logger = getPlatformFactories().createLoggerFactory(options.logger)
  base64ToUint8Array = getPlatformFactories().createBufferService().base64ToUint8Array
  imageSize = getPlatformFactories().createImageSizeService()
}
