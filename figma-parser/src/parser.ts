import { Design } from './entities/obtainers/design'
import { setLogger, setDefaults, logger } from './services'
import Config from './services/config'
import { getPlatformFactories, setPlatformFactories } from './services/platforms'
import { QueuesManager } from './services/queues-manager'
import { RequestsManager } from './services/requests-manager'
import { isObject } from './utils/common'

import type { IBenchmarksTracker } from './services/benchmarks-tracker/benchmarks-tracker.iface'
import type { IDownloader } from './services/downloader/downloader.iface'
import type { Logger } from './services/logger/logger'
import type { NodeFactories, WebFactories } from './services/platforms'
import type { ICacher } from './types/cacher'

export type { Design }

type Services = {
  downloader: IDownloader
  benchmarksTracker: IBenchmarksTracker
  requestsManager: RequestsManager
  queuesManager: QueuesManager
  cacher: ICacher | null
}

export type ParserOptions = {
  designId: string
  host: string
  token: string
  ids: string[]
  pixelsLimit: number
  framePreviews: boolean
  tokenType: string
  previewsParallels: number
  nodesParallels: number
  s3Parallels: number
  verbose: boolean
  figmaIdsFetchUsedComponents: boolean
  renderImagerefs: boolean
  shouldObtainLibraries: boolean
  shouldObtainStyles: boolean
  parallelRequests: number
  logger?: Logger
  platformFactories: WebFactories | NodeFactories
  cacher?: ICacher
}

export class Parser {
  private _services: Services
  private _config: Config

  static getLogger(): Logger | null {
    return logger
  }

  constructor(options: ParserOptions) {
    this._setGlobals(options)
    this._config = new Config(options)
    this._services = this._initServices(options)
  }

  get config(): Config {
    return this._config
  }

  get services(): Services {
    return this._services
  }

  get downloader(): IDownloader {
    return this._services.downloader
  }

  get rm(): RequestsManager {
    return this._services.requestsManager
  }

  get qm(): QueuesManager {
    return this._services.queuesManager
  }

  private _initServices(options: ParserOptions): Services {
    return {
      downloader: getPlatformFactories().createDownloader({ parser: this }),
      benchmarksTracker: getPlatformFactories().createBenchmarksTracker(),
      requestsManager: new RequestsManager({ parser: this }),
      queuesManager: new QueuesManager({ parser: this }),
      cacher: options.cacher ?? null,
    }
  }

  private _setGlobals(options: ParserOptions): void {
    if ('createEnvironment' in options.platformFactories) {
      options.platformFactories.createEnvironment?.()?.()
    }
    setPlatformFactories(options.platformFactories)
    setDefaults()
    if (isObject(options.logger)) setLogger(options.logger)
  }

  parse(): Design {
    return new Design({
      designId: this.config.designId,
      parser: this,
    })
  }
}
