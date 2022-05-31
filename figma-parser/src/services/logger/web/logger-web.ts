import pino from 'pino'

import type { LoggerFactory } from '../logger-factory.iface'

const createLoggerWeb: LoggerFactory = (): ReturnType<typeof pino> => {
  return pino({ browser: { asObject: true } })
}

export { createLoggerWeb }
