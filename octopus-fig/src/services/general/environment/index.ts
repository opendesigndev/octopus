import dotenv from 'dotenv'

export function createEnvironmentNode(): dotenv.DotenvConfigOutput {
  return dotenv.config()
}
