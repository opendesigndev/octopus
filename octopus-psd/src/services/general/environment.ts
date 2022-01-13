import dotenv from 'dotenv'

export function createEnvironment() {
  return dotenv.config()
}
