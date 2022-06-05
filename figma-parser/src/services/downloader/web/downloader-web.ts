import ky from 'ky'

import { logger } from '../..'
import { detachPromiseControls } from '../../../utils/async'
import { ResponseWeb } from './response-web'

import type { Parser } from '../../../parser'
import type { DetachedPromiseControls } from '../../../utils/async'
import type { SafeResult } from '../../../utils/queue'
import type { IDownloader } from '../downloader.iface'
import type { IResponse, JSONValue } from '../response.iface'
import type { NormalizedOptions } from 'ky'
import type { KyInstance } from 'ky/distribution/types/ky'

export type DownloaderWebOptions = {
  parser: Parser
}

export class DownloaderWeb implements IDownloader {
  _parser: Parser
  _client: KyInstance
  _benchmarks: WeakMap<Request, { start: number; end: number }>
  _cache: Map<string, DetachedPromiseControls<Response>>

  constructor(options: DownloaderWebOptions) {
    this._parser = options.parser
    this._benchmarks = new WeakMap()
    this._client = this._initClient()
    this._cache = new Map()
  }

  get parser(): Parser {
    return this._parser
  }

  get raw(): KyInstance {
    return this._client
  }

  private _getAuthHeaders(): Record<PropertyKey, unknown> | null {
    if (this.parser.config.isPersonalToken) {
      return {
        [this.parser.config.figmaTokenHeader]: this.parser.config.token,
      }
    }
    if (this.parser.config.isOAuth2Token) {
      return {
        Authorization: `Bearer ${this.parser.config.token}`,
      }
    }
    return null
  }

  private _initClient(): KyInstance {
    // Headers
    const authHeaders = this._getAuthHeaders()
    const headers = { 'User-Agent': 'Avocode', ...authHeaders }
    // Retries
    const retry = {
      limit: this.parser.config.downloaderRetries,
      statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
    }
    // Hooks (before)
    const verbosePrintCurrentRequest = (request: Request) => {
      if (this.parser.config.isVerbose) {
        logger?.info?.(`[${request.method}] ${request.url}`)
      }
    }
    const registerRequestForBenchmark = (request: Request) => {
      this._benchmarks.set(request, { start: performance.now(), end: 0 })
    }
    const returnFromCacheRequest = (request: Request) => {
      const pending = this._cache.get(request.url)
      if (pending) return pending.promise
      this._cache.set(request.url, detachPromiseControls())
    }
    // Hooks (after)
    const cacheRequest = (request: Request, options: NormalizedOptions, response: Response) => {
      const requestHandlers = this._cache.get(request.url)
      requestHandlers?.resolve(response)
    }
    const trackRequestBenchmarks = (request: Request, options: NormalizedOptions, response: Response) => {
      const timings = this._benchmarks.get(request)
      const benchmark = timings
        ? { start: timings.start, end: timings.end, total: timings.end - timings.start, url: request.url }
        : { start: 0, end: 0, total: 0, url: request.url }
      this.parser.services.benchmarksTracker.trackHttpResponse(benchmark)
      return response
    }
    const warnAboutNon200Code = (request: Request, options: NormalizedOptions, response: Response) => {
      if (response.status !== 200 && this.parser.config.isVerbose) {
        logger?.error?.(`Received different http response code than 200: ${response.status} on ${response.url}`)
      }
      return response
    }

    const beforeRequest = [verbosePrintCurrentRequest, registerRequestForBenchmark, returnFromCacheRequest]
    const afterResponse = [cacheRequest, trackRequestBenchmarks, warnAboutNon200Code]
    const hooks = { beforeRequest, afterResponse }
    // Create extended client
    return ky.extend({ headers, retry, hooks })
  }

  async getOne(task: string): Promise<IResponse> {
    return new ResponseWeb(await this._client.get(task))
  }

  getOneSafe(task: string): Promise<SafeResult<IResponse>> {
    return this._client.get(task).then(
      (response) => ({ value: new ResponseWeb(response), error: null }),
      (error) => ({ value: undefined, error })
    )
  }

  async getText(task: string): Promise<string> {
    return (await this.getOne(task)).text
  }

  async getTextSafe(task: string): Promise<SafeResult<string>> {
    return this.getText(task).then(
      (text) => ({ value: text, error: null }),
      (error) => ({ value: undefined, error })
    )
  }

  async getBuffer(task: string): Promise<ArrayBuffer> {
    return (await this.getOne(task)).buffer
  }

  async getBufferSafe(task: string): Promise<SafeResult<ArrayBuffer>> {
    return this.getBuffer(task).then(
      (buffer) => ({ value: buffer, error: null }),
      (error) => ({ value: undefined, error })
    )
  }

  async getJSON(task: string): Promise<JSONValue> {
    return (await this.getOne(task)).json
  }

  async getJSONSafe(task: string): Promise<SafeResult<JSONValue>> {
    return this.getJSON(task).then(
      (json) => ({ value: json, error: null }),
      (error) => ({ value: undefined, error })
    )
  }

  async rawRequest(cb: (raw: KyInstance) => Promise<Response>): Promise<IResponse> {
    return new ResponseWeb(await cb(this.raw))
  }

  async rawRequestSafe(cb: (raw: KyInstance) => Promise<Response>): Promise<SafeResult<IResponse>> {
    return cb(this.raw).then(
      (response) => ({ value: new ResponseWeb(response), error: null }),
      (error) => ({ value: undefined, error })
    )
  }
}
