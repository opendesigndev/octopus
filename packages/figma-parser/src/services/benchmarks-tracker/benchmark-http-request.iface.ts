export type BenchmarkHTTPRequestExport = {
  start: number
  end: number
  total: number
  task: string
}

export interface IBenchmarkHTTPRequest {
  export(): BenchmarkHTTPRequestExport
}
