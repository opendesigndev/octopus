import { FileEndpoint } from './file-endpoint'
import { FillsEndpoint } from './fills-endpoint'
import { NodesEndpoint } from './nodes-endpoint'
import { PreviewsEndpoint } from './previews-endpoint'
import { RenditionsEndpoint } from './renditions-endpoint'

import type { Parser } from '../../parser'

type RequestsManagerOptions = {
  parser: Parser
}

export class RequestsManager {
  private _parser: Parser
  private _endpoints: {
    file: FileEndpoint
    nodes: NodesEndpoint
    fills: FillsEndpoint
    previews: PreviewsEndpoint
    renditions: RenditionsEndpoint
  }

  constructor(options: RequestsManagerOptions) {
    this._parser = options.parser
    this._endpoints = {
      file: new FileEndpoint({ requestsManager: this }),
      nodes: new NodesEndpoint({ requestsManager: this }),
      fills: new FillsEndpoint({ requestsManager: this }),
      previews: new PreviewsEndpoint({ requestsManager: this }),
      renditions: new RenditionsEndpoint({ requestsManager: this }),
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

  get fills(): FillsEndpoint {
    return this._endpoints.fills
  }

  get previews(): PreviewsEndpoint {
    return this._endpoints.previews
  }

  get renditions(): RenditionsEndpoint {
    return this._endpoints.renditions
  }
}
