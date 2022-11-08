import { config } from 'dotenv'

export function createEnvironmentNode(): ReturnType<typeof config> {
  return config()
}
