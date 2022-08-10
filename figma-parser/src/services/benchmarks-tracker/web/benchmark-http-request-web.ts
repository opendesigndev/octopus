import type { BenchmarkHTTPRequestExport, IBenchmarkHTTPRequest } from '../benchmark-http-request.iface.js'

export type ResponseBenchmarkProps = {
  start: number
  end: number
  total: number
  url: string
}

export default class BenchmarkHTTPRequestWeb implements IBenchmarkHTTPRequest {
  _responseTimings: {
    start: number
    end: number
    total: number
  }
  _requestUrl: string

  constructor(benchmarkProps: ResponseBenchmarkProps) {
    this._responseTimings = {
      start: benchmarkProps.start,
      end: benchmarkProps.end,
      total: benchmarkProps.total,
    }
    this._requestUrl = benchmarkProps.url
  }

  export(): BenchmarkHTTPRequestExport {
    return {
      start: this._responseTimings.start,
      end: this._responseTimings.end,
      total: this._responseTimings.total,
      task: this._requestUrl,
    }
  }
}
