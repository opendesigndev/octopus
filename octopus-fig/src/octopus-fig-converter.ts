import { setDefaults, setLogger } from './services'
import { DesignConverter } from './services/conversion/design-converter'
import { getPlatformFactories, setPlatformFactories } from './services/general/platforms'
import { readPackageMeta } from './utils/read-pkg-meta'

import type { DesignConverterOptions, DesignConversionResult } from './services/conversion/design-converter'
import type { ImageSize } from './services/general/image-size/image-size'
import type { NodeFactories, WebFactories } from './services/general/platforms'
import type { Logger } from './typings'

export type OctopusConverterOptions = {
  logger?: Logger
  platformFactories: WebFactories | NodeFactories
  loggerEnabled?: boolean
}

export class OctopusFigConverter {
  private _pkg: { version: string; name: string }
  private _services: {
    benchmark: {
      benchmarkAsync: <T>(cb: (...args: unknown[]) => Promise<T>) => Promise<{ result: T; time: number }>
    }
    imageSize: (buffer: ArrayBuffer) => Promise<ImageSize | undefined>
  }

  constructor(options: OctopusConverterOptions) {
    this._setGlobals(options)
    this._pkg = readPackageMeta()
    this._services = this._initServices()
  }

  get benchmarkAsync() {
    return this._services.benchmark.benchmarkAsync
  }

  get imageSize() {
    return this._services.imageSize
  }

  private _initServices() {
    return {
      benchmark: getPlatformFactories().createBenchmarkService(),
      imageSize: getPlatformFactories().createImageSizeService(),
    }
  }

  private _setGlobals(options: OctopusConverterOptions): void {
    setPlatformFactories(options.platformFactories)
    setDefaults({
      logger: {
        enabled: options.loggerEnabled ?? true,
      },
    })
    if (options.logger) setLogger(options.logger)
  }

  get pkg(): { name: string; version: string } {
    return this._pkg
  }

  async convertDesign(options: DesignConverterOptions): Promise<DesignConversionResult | null> {
    return new DesignConverter(options, this).convert()
  }
}
