import pino from 'pino'
import pinoPretty from 'pino-pretty'
import isEmpty from 'lodash/isEmpty'
import compact from 'lodash/compact'

export function createDefaultLogger(): ReturnType<typeof pino> {
  return pino({
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
    level: process.env.LOG_LEVEL || 'debug',
    prettyPrint:
      process.env.NODE_ENV === 'debug'
        ? {
            levelFirst: true,
          }
        : false,
    prettifier: pinoPretty,
    timestamp: pino.stdTimeFunctions.isoTime,
    hooks: {
      logMethod: function (args, method) {
        const [message, ...extra] = args
        const _extra = !isEmpty(compact(extra)) ? { extra } : null
        method.apply(this, [_extra, message])
      },
    },
  })
}
