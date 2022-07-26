import dotenv from 'dotenv'

export function createEnvironment(): dotenv.DotenvConfigOutput {
  return dotenv.config()
}

/**
 * Loading of .env file.
 */
createEnvironment()

export const ENV = {
  SENTRY: process.env.SENTRY_DSN,
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  NODE_ENV: process.env.NODE_ENV || 'debug',
  API_TOKEN: process.env.API_TOKEN,
}
