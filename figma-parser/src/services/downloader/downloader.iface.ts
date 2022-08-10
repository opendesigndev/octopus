import type { Parser } from '../../parser.js'
import type { SafeResult } from '../../utils/queue.js'
import type { IResponse, JSONValue } from './response.iface.js'
import type { Got, Response as GotResponse } from 'got'
import type ky from 'ky'
type KyInstance = typeof ky

export interface IDownloader {
  get parser(): Parser
  get raw(): Got | KyInstance
  getOne(task: string): Promise<IResponse>
  getOneSafe(task: string): Promise<SafeResult<IResponse>>
  getText(task: string): Promise<string>
  getTextSafe(task: string): Promise<SafeResult<string>>
  getBuffer(task: string): Promise<ArrayBuffer>
  getBufferSafe(task: string): Promise<SafeResult<ArrayBuffer>>
  getJSON(task: string): Promise<JSONValue>
  getJSONSafe(task: string): Promise<SafeResult<JSONValue>>
  rawRequest(cb: (raw: Got | KyInstance) => Promise<GotResponse<Buffer> | Response>): Promise<IResponse>
  rawRequestSafe(cb: (raw: Got | KyInstance) => Promise<GotResponse<Buffer> | Response>): Promise<SafeResult<IResponse>>
  clientRequest(cb: (raw: Got | KyInstance) => Promise<GotResponse<Buffer> | Response>): Promise<IResponse>
  clientRequestSafe(
    cb: (raw: Got | KyInstance) => Promise<GotResponse<Buffer> | Response>
  ): Promise<SafeResult<IResponse>>
}
