import dotenv from 'dotenv'

export default function createEnvironment(): ReturnType<typeof dotenv.config> {
  return dotenv.config()
}
