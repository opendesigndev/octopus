import type { IBenchmarkHTTPRequest } from './benchmark-http-request.iface.js'

export interface IBenchmarksTracker {
  trackHttpResponse(response: unknown): void
  trackAsync<T>(label: string, fn: () => T): Promise<T>
  get requestsBenchmarks(): IBenchmarkHTTPRequest[]
  get simpleBenchmarks(): Record<string, number>
}
