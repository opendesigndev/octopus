import { getPlatformFactories } from './general/platforms/index.js'

import type { BenchMarkService } from './general/benchmark-service/benchmark-service.js'
import type { Env } from './general/environment/index.js'
import type { CreateLoggerOptions } from './general/logger/logger-factory.js'
import type { Logger } from './general/logger/logger.js'

type DefaultOptions = {
  logger: CreateLoggerOptions
}

export let env: Env

export let logger: Logger | null = null

let benchmarkService: BenchMarkService | null = null

export function getBenchmarkService(): BenchMarkService {
  if (!benchmarkService) {
    throw new Error('Benchmark service is not set!')
  }
  return benchmarkService
}

export function setLogger(instance: Logger): void {
  logger = instance
}

export function setBenchmarkService(instance: BenchMarkService): void {
  benchmarkService = instance
}

export function setDefaults(options: DefaultOptions): void {
  env = getPlatformFactories().createEnvironment?.() ?? {}
  logger = getPlatformFactories().createLoggerFactory(options.logger)
  benchmarkService = getPlatformFactories().createBenchmarkService()
}
