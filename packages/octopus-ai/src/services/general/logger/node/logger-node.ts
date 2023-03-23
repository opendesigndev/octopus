import pino from 'pino'
import pinoPretty from 'pino-pretty'

import { env } from '../../../index.js'

import type { LoggerFactory, CreateLoggerOptions } from '../logger-factory.js'

const createLoggerNode: LoggerFactory = (options: CreateLoggerOptions = { enabled: true }): ReturnType<typeof pino> => {
  return pino({
    enabled: options.enabled,
    formatters: {
      bindings: ({ pid }) => {
        return {
          pid,
        }
      },
      level: (level) => {
        return {
          level,
        }
      },
    },
    messageKey: 'message',
    level: env.LOG_LEVEL || 'debug',
    prettyPrint:
      env.NODE_ENV === 'debug'
        ? {
            levelFirst: true,
          }
        : false,
    prettifier: pinoPretty,
    timestamp: pino.stdTimeFunctions.isoTime,
    hooks: {
      logMethod: function (args, method) {
        const [message] = args
        const extra = args.length > 1 ? { extra: args.slice(1) } : null
        method.apply(this, [extra, message])
      },
    },
  })
}

export { createLoggerNode }
