import pino from 'pino'
// @ts-ignore
import pinoPretty from 'pino-pretty'

export const createLogger = () => {
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
        const [message] = args
        const extra = args.length > 1 ? { extra: args.slice(1) } : null
        method.apply(this, [extra, message])
      },
    },
  })
}
