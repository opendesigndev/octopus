import pino from 'pino'

import type { LoggerFactory, CreateLoggerOptions } from '../logger-factory'

const createLoggerWeb: LoggerFactory = (options: CreateLoggerOptions): ReturnType<typeof pino> => {
  return pino({
    enabled: options.enabled,
    browser: { asObject: true },
  })
}

export { createLoggerWeb }
