import type { Parser } from '../../parser'
import type { SafeResult } from '../../utils/queue'
import type { IResponse, JSONValue } from './response.iface'
import type { Got, Response as GotResponse } from 'got/dist/source'
import type { KyInstance } from 'ky/distribution/types/ky'

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
}
