import pino from 'pino'

import type { LoggerFactory } from '../logger-factory.iface'

type CreateLoggerWebOptions = {
  enabled: boolean
}

const createLoggerWeb: LoggerFactory = (options: CreateLoggerWebOptions): ReturnType<typeof pino> => {
  return pino({
    enabled: options.enabled,
    browser: { asObject: true },
  })
}

export { createLoggerWeb }
