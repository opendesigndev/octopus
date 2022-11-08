import type { Logger } from './logger'

export type CreateLoggerOptions = {
  enabled: boolean
}

export interface LoggerFactory {
  (options: CreateLoggerOptions): Logger
}
