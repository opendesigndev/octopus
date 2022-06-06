import got from 'got'

import { logger } from '../..'
import { ResponseNode } from './response-node'

import type { Parser } from '../../../parser'
import type { SafeResult } from '../../../utils/queue'
import type { IDownloader } from '../downloader.iface'
import type { IResponse, JSONValue } from '../response.iface'
import type { Got, NormalizedOptions, Response } from 'got'

export type DownloaderNodeOptions = {
  parser: Parser
}

export class DownloaderNode implements IDownloader {
  _parser: Parser
  _client: Got
  _pureClient: Got

  constructor(options: DownloaderNodeOptions) {
    this._parser = options.parser
    this._client = this._initClient()
    this._pureClient = this._initPureClient()
  }

  get parser(): Parser {
    return this._parser
  }

  get raw(): Got {
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

  private _initClient(): Got {
    // Headers
    const authHeaders = this._getAuthHeaders()
    const headers = { 'User-Agent': 'Avocode', ...authHeaders }
    // Retries
    const retry = {
      limit: this.parser.config.downloaderRetries,
      errorCodes: [...got.defaults.options.retry.errorCodes, 'EPROTO'],
    }
    // Hooks
    const verbosePrintCurrentRequest = (options: NormalizedOptions) => {
      if (this.parser.config.isVerbose) {
        logger?.info?.(`[${options.method}] ${options.url.href}`)
      }
    }
    const trackRequestBenchmarks = (response: Response) => {
      this.parser.services.benchmarksTracker.trackHttpResponse(response)
      return response
    }
    const warnAboutNon200Code = (response: Response) => {
      if (response.statusCode !== 200 && this.parser.config.isVerbose) {
        logger?.error?.(`Received different http response code than 200: ${response.statusCode} on ${response.url}`)
      }
      return response
    }
    // Handlers
    const requestsMap = new Map()
    const preventDuplicates = (options: NormalizedOptions, next: (options: NormalizedOptions) => unknown) => {
      if (options.isStream) return next(options)
      const pending = requestsMap.get(options.url.href)
      if (pending) return pending
      const promise = next(options)
      requestsMap.set(options.url.href, promise)
      return promise // .finally(() => { requestsMap.delete(options.url.href) })
    }

    const beforeRequest = [verbosePrintCurrentRequest]
    const afterResponse = [trackRequestBenchmarks, warnAboutNon200Code]
    const hooks = { beforeRequest, afterResponse }
    const handlers = [preventDuplicates]
    // Create extended client
    return got.extend({ headers, retry, responseType: 'buffer', hooks, handlers })
  }

  private _initPureClient(): Got {
    // Retries
    const retry = {
      limit: this.parser.config.downloaderRetries,
      errorCodes: [...got.defaults.options.retry.errorCodes, 'EPROTO'],
    }
    // Hooks
    const verbosePrintCurrentRequest = (options: NormalizedOptions) => {
      if (this.parser.config.isVerbose) {
        logger?.info?.(`[${options.method}] ${options.url.href}`)
      }
    }
    const trackRequestBenchmarks = (response: Response) => {
      this.parser.services.benchmarksTracker.trackHttpResponse(response)
      return response
    }
    const warnAboutNon200Code = (response: Response) => {
      if (response.statusCode !== 200 && this.parser.config.isVerbose) {
        logger?.error?.(`Received different http response code than 200: ${response.statusCode} on ${response.url}`)
      }
      return response
    }
    // Handlers
    const requestsMap = new Map()
    const preventDuplicates = (options: NormalizedOptions, next: (options: NormalizedOptions) => unknown) => {
      if (options.isStream) return next(options)
      const pending = requestsMap.get(options.url.href)
      if (pending) return pending
      const promise = next(options)
      requestsMap.set(options.url.href, promise)
      return promise // .finally(() => { requestsMap.delete(options.url.href) })
    }

    const beforeRequest = [verbosePrintCurrentRequest]
    const afterResponse = [trackRequestBenchmarks, warnAboutNon200Code]
    const hooks = { beforeRequest, afterResponse }
    const handlers = [preventDuplicates]
    // Create extended client
    return got.extend({ retry, responseType: 'buffer', hooks, handlers })
  }

  async getOne(task: string): Promise<IResponse> {
    return new ResponseNode(await this._client.get<Buffer>(task))
  }

  async getOneSafe(task: string): Promise<SafeResult<IResponse>> {
    return this._client.get<Buffer>(task).then(
      (response) => ({ value: new ResponseNode(response), error: null }),
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

  async rawRequest(cb: (raw: Got) => Promise<Response<Buffer>>): Promise<IResponse> {
    return new ResponseNode(await cb(this._pureClient))
  }

  async rawRequestSafe(cb: (raw: Got) => Promise<Response<Buffer>>): Promise<SafeResult<IResponse>> {
    return cb(this._pureClient).then(
      (response) => ({ value: new ResponseNode(response), error: null }),
      (error) => ({ value: undefined, error })
    )
  }

  async clientRequest(cb: (raw: Got) => Promise<Response<Buffer>>): Promise<IResponse> {
    return new ResponseNode(await cb(this.raw))
  }

  async clientRequestSafe(cb: (raw: Got) => Promise<Response<Buffer>>): Promise<SafeResult<IResponse>> {
    return cb(this.raw).then(
      (response) => ({ value: new ResponseNode(response), error: null }),
      (error) => ({ value: undefined, error })
    )
  }
}
