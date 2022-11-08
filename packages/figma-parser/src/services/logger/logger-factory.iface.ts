import type { Logger } from './logger'

export interface LoggerFactory {
  (): Logger
}
