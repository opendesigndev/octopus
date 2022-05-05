import dotenv from 'dotenv'

export function createEnvironment(): dotenv.DotenvConfigOutput {
  return dotenv.config()
}
