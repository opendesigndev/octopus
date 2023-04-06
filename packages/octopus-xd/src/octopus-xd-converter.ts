import { rejectTo } from '@opendesign/octopus-common/dist/utils/async.js'
import { isObject, push } from '@opendesign/octopus-common/dist/utils/common.js'
import { pathBasename } from '@opendesign/octopus-common/dist/utils/fs-path.js'
import { Queue } from '@opendesign/octopus-common/dist/utils/queue.js'

import { OctopusManifest } from './entities/octopus/octopus-manifest.js'
import { ArtboardConverter } from './services/conversion/artboard-converter/index.js'
import { getPlatformFactories, setPlatformFactories } from './services/general/platforms/index.js'
import { setDefaults, setLogger } from './services/index.js'
import { readPackageMeta } from './utils/read-pkg-meta.js'

import type { SourceArtboard } from './entities/source/source-artboard.js'
import type { GetImageData, SourceDesign } from './entities/source/source-design.js'
import type { Exporter } from './services/conversion/exporter/index.js'
import type { NodeFactories, WebFactories } from './services/general/platforms/index.js'
import type { Logger } from './typings/index.js'
import type { Manifest } from './typings/manifest/index.js'
import type { Octopus } from './typings/octopus/index.js'
import type { PackageMeta } from './utils/read-pkg-meta.js'
import type {
  GenericComponentConversionResult,
  GenericDesignConversionResult,
} from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'
import type { SafeResult } from '@opendesign/octopus-common/dist/utils/queue.js'

export type ConvertDesignOptions = {
  exporter?: Exporter
  partialUpdateInterval?: number
}

export type OctopusXDConverterGeneralOptions = {
  platformFactories: WebFactories | NodeFactories
  loggerEnabled?: boolean
  logger?: Logger
}

export type OctopusXDConverterOptions = OctopusXDConverterGeneralOptions & {
  sourceDesign: SourceDesign
}

export type ComponentConversionResult = GenericComponentConversionResult<Octopus['OctopusComponent']>
export type DesignConversionResult = GenericDesignConversionResult<Manifest['OctopusManifest']>
export type ArtboardExport = {
  images: { path: string; getImageData: GetImageData }[]
  artboard: ComponentConversionResult
}

export type ArtboardConversionWithAssetsResult = ComponentConversionResult & {
  images: {
    id: string
    image: Uint8Array
  }[]
}

export class OctopusXDConverter {
  private _pkg: PackageMeta
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest
  private _services: {
    benchmark: {
      benchmarkAsync: <T>(cb: (...args: unknown[]) => Promise<T>) => Promise<{ result: T; time: number }>
    }
  }

  static ARTBOARDS_QUEUE_NAME = 'artboards'
  static ARTBOARDS_QUEUE_PARALLELS = 5
  static PARTIAL_UPDATE_INTERVAL = 3000

  constructor(options: OctopusXDConverterOptions) {
    this._setGlobals(options)
    this._pkg = readPackageMeta()
    this._services = this._initServices()
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ octopusXdConverter: this })
  }

  get octopusManifest(): OctopusManifest {
    return this._octopusManifest
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  get bmarkAsync() {
    return this._services.benchmark.benchmarkAsync
  }

  private _initServices() {
    return {
      benchmark: getPlatformFactories().createBenchmarkService(),
    }
  }

  private _setGlobals(options: OctopusXDConverterOptions): void {
    if ('createEnvironment' in options.platformFactories) {
      options.platformFactories.createEnvironment?.()?.()
    }
    setPlatformFactories(options.platformFactories)
    setDefaults({
      logger: {
        enabled: options.loggerEnabled ?? true,
      },
    })
    if (isObject(options.logger)) setLogger(options.logger)
  }

  get pkg(): PackageMeta {
    return this._pkg
  }

  private async _convertArtboardByIdSafe(
    targetArtboardId: string
  ): Promise<{ value: Octopus['OctopusComponent'] | null; error: Error | null }> {
    try {
      const value = await new ArtboardConverter({
        targetArtboardId,
        octopusXdConverter: this,
      }).convert()

      return {
        value,
        error: null,
      }
    } catch (err) {
      return {
        value: null,
        error: err,
      }
    }
  }

  async convertArtboardById(targetArtboardId: string): Promise<ComponentConversionResult> {
    const { time, result } = await this._services.benchmark.benchmarkAsync(async () =>
      this._convertArtboardByIdSafe(targetArtboardId)
    )
    const { value, error } = result
    return { id: targetArtboardId, value, error, time }
  }

  async convertArtboardByIdWithAssets(targetArtboardId: string): Promise<ArtboardConversionWithAssetsResult> {
    const [sourceArtboard] = this._sourceDesign.artboards.filter((artboard) => artboard.meta.id === targetArtboardId)
    const { time, result } = await this._services.benchmark.benchmarkAsync(async () =>
      this._convertArtboardByIdSafe(targetArtboardId)
    )
    const { value, error } = result

    const { images: imagesDep } = sourceArtboard.dependencies
    const artboardImages = await Promise.all(
      this._sourceDesign.images
        .filter((image) => imagesDep.some((dep) => image.path.includes(dep)))
        .map((image) => {
          return {
            getImageData: image.getImageData,
            id: imagesDep.find((dep) => image.path.includes(dep)) as string,
          }
        })
        .map(async (imageDescriptor) => {
          return {
            id: imageDescriptor.id,
            image: await imageDescriptor.getImageData(),
          }
        })
    )

    return { id: targetArtboardId, value, error, time, images: artboardImages }
  }

  private async _exportManifest(exporter: Exporter | null): Promise<Manifest['OctopusManifest']> {
    const { time, result: manifest } = await this._services.benchmark.benchmarkAsync(() =>
      this.octopusManifest.convert()
    )
    await exporter?.exportManifest?.({ manifest, time })
    return manifest
  }

  private async _exportArtboard(exporter: Exporter | null, artboard: SourceArtboard): Promise<ArtboardExport> {
    const { images: imagesDep } = artboard.dependencies
    const artboardImages = this._sourceDesign.images.filter((image) =>
      imagesDep.some((dep) => image.path.includes(dep))
    )
    const images = await Promise.all(
      artboardImages.map(async (image) => {
        const imageId = pathBasename(image.path)
        const rawData = await image.getImageData()
        const imagePath = await rejectTo(exporter?.exportImage?.(image.path, rawData) ?? Promise.reject(null))
        this.octopusManifest.setExportedImage(imageId, { path: imagePath })
        return image
      })
    )
    const converted = await this.convertArtboardById(artboard.meta.id)
    const artboardPath = await rejectTo(exporter?.exportArtboard?.(artboard, converted) ?? Promise.reject(null))
    this.octopusManifest.setExportedArtboard(artboard.meta.id, {
      path: artboardPath,
      error: converted.error,
      time: converted.time,
    })
    return { images, artboard: converted }
  }

  private _initArtboardQueue(exporter: Exporter | null) {
    return new Queue({
      name: OctopusXDConverter.ARTBOARDS_QUEUE_NAME,
      parallels: OctopusXDConverter.ARTBOARDS_QUEUE_PARALLELS,
      factory: async (artboards: SourceArtboard[]): Promise<SafeResult<ArtboardExport>[]> => {
        return Promise.all(
          artboards.map(async (artboard) => {
            return { value: await this._exportArtboard(exporter, artboard), error: null }
          })
        )
      },
    })
  }

  async convertDesign(options?: ConvertDesignOptions): Promise<{
    manifest: Manifest['OctopusManifest']
    artboards: ComponentConversionResult[]
    images: { path: string; getImageData: GetImageData }[]
  }> {
    const exporter = isObject(options?.exporter) ? (options?.exporter as Exporter) : null

    this.octopusManifest.registerBasePath(await exporter?.getBasePath?.())

    /** Pass whole SourceDesign entity into exporter - mainly for dev purposes */
    exporter?.exportSourceDesign?.(this._sourceDesign)

    /** Init artboards queue */
    const queue = this._initArtboardQueue(exporter)

    /** Init partial update */
    const manifestInterval = setInterval(
      async () => this._exportManifest(exporter),
      options?.partialUpdateInterval || OctopusXDConverter.PARTIAL_UPDATE_INTERVAL
    )

    /** Enqueue all artboards */
    const allConverted = await Promise.all(this._sourceDesign.artboards.map((artboard) => queue.exec(artboard)))

    /** At this moment all artboards + dependencies should be converted and exported */

    /** Final trigger of manifest save */
    clearInterval(manifestInterval)
    const manifest = await this._exportManifest(exporter)

    /** Trigger finalizer */
    exporter?.finalizeExport?.()

    /** Return transient outputs */
    const images = [...new Set(allConverted.reduce((images, converted) => push(images, ...converted.images), []))]
    const artboards = allConverted.map((converted) => converted.artboard)

    return {
      manifest,
      artboards,
      images,
    }
  }
}
