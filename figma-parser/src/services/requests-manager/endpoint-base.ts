import type { RequestsManager } from '.'
import type Config from '../config'
import type { IDownloader } from '../downloader/downloader.iface'
import type { QueuesManager } from '../queues-manager'

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
