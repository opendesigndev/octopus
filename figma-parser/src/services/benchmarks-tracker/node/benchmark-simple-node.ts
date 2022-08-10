import { performance } from 'perf_hooks'

import type { BenchmarkSimpleExport, IBenchmarkSimple } from '../benchmark-simple.iface.js'

export default class BenchmarkSimpleNode implements IBenchmarkSimple {
  _label: string
  _start: number
  _end: number | null

  constructor(label: string) {
    this._label = label
    this._start = performance.now()
    this._end = null
  }

  end(): number {
    this._end = performance.now()
    return this._end - this._start
  }

  export(): BenchmarkSimpleExport | null {
    if (this._end === null) {
      return null
    }
    return [this._label, this._end - this._start]
  }
}
