import type Config from '../config/index.js'
import type { IDownloader } from '../downloader/downloader.iface.js'
import type { QueuesManager } from '../queues-manager/index.js'
import type { RequestsManager } from './index.js'

type EndpointBaseOptions = { requestsManager: RequestsManager }

export class EndpointBase {
  protected _requestsManager: RequestsManager

  constructor(options: EndpointBaseOptions) {
    this._requestsManager = options.requestsManager
  }

  get config(): Config {
    return this._requestsManager.parser.config
  }

  get downloader(): IDownloader {
    return this._requestsManager.parser.downloader
  }

  get rm(): RequestsManager {
    return this._requestsManager.parser.rm
  }

  get qm(): QueuesManager {
    return this._requestsManager.parser.qm
  }
}
