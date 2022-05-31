import type { Parser } from '../../parser'
import type { SafeResult } from '../../utils/queue'
import type { RequestDescriptor } from './request-descriptor'
import type { IResponse, JSONValue } from './response.iface'

export interface IDownloader {
  get parser(): Parser
  get raw(): unknown
  execRequest(request: RequestDescriptor): Promise<IResponse>
  execRequestSafe(request: RequestDescriptor): Promise<SafeResult<IResponse>>
  getOne(task: string): Promise<IResponse>
  getOneSafe(task: string): Promise<SafeResult<IResponse>>
  getText(task: string): Promise<string>
  getTextSafe(task: string): Promise<SafeResult<string>>
  getBuffer(task: string): Promise<ArrayBuffer>
  getBufferSafe(task: string): Promise<SafeResult<ArrayBuffer>>
  getJSON(task: string): Promise<JSONValue>
  getJSONSafe(task: string): Promise<SafeResult<JSONValue>>
}
