import fromPairs from 'lodash/fromPairs'

import BenchmarkHTTPRequestWeb from './benchmark-http-request-web'
import BenchmarkSimpleWeb from './benchmark-simple-web'

import type { ResponseBenchmarkProps } from './benchmark-http-request-web'
import type { IBenchmarkHTTPRequest } from '../benchmark-http-request.iface'
import type { IBenchmarkSimple, BenchmarkSimpleExport } from '../benchmark-simple.iface'
import type { IBenchmarksTracker } from '../benchmarks-tracker.iface'

type Benchmark = IBenchmarkSimple | IBenchmarkHTTPRequest

export default class BenchmarksTrackerWeb implements IBenchmarksTracker {
  _benchmarks: Benchmark[]
  constructor() {
    this._benchmarks = []
  }
  trackHttpResponse(props: ResponseBenchmarkProps): void {
    const benchmark = new BenchmarkHTTPRequestWeb(props)
    this._benchmarks.push(benchmark)
  }
  async trackAsync<T>(label: string, fn: () => T): Promise<T> {
    const benchmark = new BenchmarkSimpleWeb(label)
    this._benchmarks.push(benchmark)
    const result = await fn()
    benchmark.end()
    return result
  }
  get requestsBenchmarks(): IBenchmarkHTTPRequest[] {
    return this._benchmarks.filter((benchmark) => {
      return benchmark instanceof BenchmarkHTTPRequestWeb
    }) as BenchmarkHTTPRequestWeb[]
  }
  get simpleBenchmarks(): Record<string, number> {
    const simples = this._benchmarks.filter((benchmark) => {
      return benchmark instanceof BenchmarkSimpleWeb
    }) as BenchmarkSimpleWeb[]
    return fromPairs(
      simples
        .map((simple) => {
          return simple.export()
        })
        .filter((exported) => {
          return exported
        }) as Exclude<BenchmarkSimpleExport, null>[]
    )
  }
}
