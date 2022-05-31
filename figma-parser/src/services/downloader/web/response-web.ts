import type { IResponse, JSONValue } from '../response.iface'

export class ResponseWeb implements IResponse {
  private _body: Response

  constructor(response: Response) {
    this._body = response
  }

  get text(): Promise<string> {
    return this._body.text()
  }

  get buffer(): Promise<ArrayBuffer> {
    return this._body.arrayBuffer()
  }

  get json(): Promise<JSONValue> {
    return this._body.json()
  }
}
