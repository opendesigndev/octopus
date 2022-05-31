import fromPairs from 'lodash/fromPairs'

import { getPlatformFactories } from '../../platforms'
import BenchmarkHTTPRequestNode from './benchmark-http-request-node'
import BenchmarkSimpleNode from './benchmark-simple-node'

import type { NodeFactories } from '../../platforms'
import type { IBenchmarkHTTPRequest } from '../benchmark-http-request.iface'
import type { IBenchmarkSimple, BenchmarkSimpleExport } from '../benchmark-simple.iface'
import type { IBenchmarksTracker } from '../benchmarks-tracker.iface'
import type { Response } from 'got'

type Benchmark = IBenchmarkSimple | IBenchmarkHTTPRequest

export default class BenchmarksTrackerNode implements IBenchmarksTracker {
  _benchmarks: Benchmark[]
  constructor() {
    this._benchmarks = []
  }
  trackHttpResponse(response: Response): void {
    const benchmark = getPlatformFactories<NodeFactories>().createBenchmarkHTTPRequest(response)
    this._benchmarks.push(benchmark)
  }
  async trackAsync<T>(label: string, fn: () => T): Promise<T> {
    const benchmark = getPlatformFactories<NodeFactories>().createBenchmarkSimple(label)
    this._benchmarks.push(benchmark)
    const result = await fn()
    benchmark.end()
    return result
  }
  get requestsBenchmarks(): IBenchmarkHTTPRequest[] {
    return this._benchmarks.filter((benchmark) => {
      return benchmark instanceof BenchmarkHTTPRequestNode
    }) as BenchmarkHTTPRequestNode[]
  }
  get simpleBenchmarks(): Record<string, number> {
    const simples = this._benchmarks.filter((benchmark) => {
      return benchmark instanceof BenchmarkSimpleNode
    }) as BenchmarkSimpleNode[]
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
