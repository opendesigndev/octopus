import { asNumber } from '../../../utils/as.js'

import type { BenchmarkHTTPRequestExport, IBenchmarkHTTPRequest } from '../benchmark-http-request.iface.js'
import type { Response } from 'got'

type ResponseTimings = {
  start: number
  end: number
  total: number
}

export default class BenchmarkHTTPRequestNode implements IBenchmarkHTTPRequest {
  _responseTimings: ResponseTimings
  _requestUrl: string

  constructor(response: Response) {
    this._responseTimings = {
      start: response.timings.start,
      end: asNumber(response.timings.end, 0),
      total: asNumber(response.timings.phases.total, 0),
    }
    const url = response.request.options.url ?? ''
    this._requestUrl = typeof url === 'string' ? url : url.href
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
