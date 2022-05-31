import { FileEndpoint } from './file-endpoint'
import { NodesEndpoint } from './nodes-endpoint'

import type { Parser } from '../../parser'

type RequestsManagerOptions = {
  parser: Parser
}

export class RequestsManager {
  private _parser: Parser
  private _endpoints: {
    file: FileEndpoint
    nodes: NodesEndpoint
  }

  constructor(options: RequestsManagerOptions) {
    this._parser = options.parser
    this._endpoints = {
      file: new FileEndpoint({ requestsManager: this }),
      nodes: new NodesEndpoint({ requestsManager: this }),
    }
  }

  get parser(): Parser {
    return this._parser
  }

  get file(): FileEndpoint {
    return this._endpoints.file
  }

  get nodes(): NodesEndpoint {
    return this._endpoints.nodes
  }
}
