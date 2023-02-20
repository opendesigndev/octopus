import dotenv from 'dotenv'

import type { Env } from '..'

export function createEnvironmentNode(): Env {
  dotenv.config()
  return process.env
}
