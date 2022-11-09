import type { IResponse, JSONValue } from '../response.iface'
import type { Response } from 'got'

function bufCopy(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length)
}

export class ResponseNode implements IResponse {
  private _response: Response<Buffer>
  constructor(response: Response<Buffer>) {
    this._response = response
  }

  get text(): Promise<string> {
    return Promise.resolve(this._response.body.toString())
  }

  get buffer(): Promise<ArrayBuffer> {
    return Promise.resolve(bufCopy(this._response.body))
  }

  get json(): Promise<JSONValue> {
    return this.text.then((text) => JSON.parse(text))
  }
}
