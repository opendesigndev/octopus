import type { Logger } from './logger.js'

export type CreateLoggerOptions = {
  enabled: boolean
}

export interface LoggerFactory {
  (options: CreateLoggerOptions): Logger
}
