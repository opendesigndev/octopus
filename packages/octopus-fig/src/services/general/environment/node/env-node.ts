import dotenv from 'dotenv'

import type { Env } from '../index.js'

export function createEnvironmentNode(): Env {
  dotenv.config()
  return process.env
}
