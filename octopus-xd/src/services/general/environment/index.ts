import { config } from 'dotenv'

export default function createEnvironment(): ReturnType<typeof config> {
  return config()
}
