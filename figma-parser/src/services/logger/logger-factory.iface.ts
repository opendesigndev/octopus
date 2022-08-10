import type { Logger } from './logger.js'

export interface LoggerFactory {
  (): Logger
}
