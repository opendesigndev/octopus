import { keys } from './common.js'

export function buildEndpoint(endpointPattern: string, rawOptions: Record<string, string | string[]>): string {
  const options = Object(rawOptions) as typeof rawOptions
  const builtUrl = keys(options).reduce((endpoint, prop) => {
    const rawValue = options[prop]
    const value = Array.isArray(rawValue) ? rawValue.join(',') : String(rawValue)
    return endpoint.replace(new RegExp(`:${prop}`, 'gi'), value)
  }, endpointPattern)
  if (/:[a-zA-Z]/.test(builtUrl)) {
    throw new Error(`Endpoint pattern still contains markers, please apply all parameters: ${builtUrl}`)
  }
  return builtUrl
}
