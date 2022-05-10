import path from 'path'

import { rejectTo } from '@avocode/octopus-common/dist/utils/async'
import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark'
import { isObject, push } from '@avocode/octopus-common/dist/utils/common'
import { Queue } from '@avocode/octopus-common/dist/utils/queue'
import readPackageUpAsync from 'read-pkg-up'

import OctopusManifest from './entities/octopus/octopus-manifest'
import ArtboardConverter from './services/conversion/artboard-converter'
import { LocalExporter } from './services/conversion/exporter/local-exporter'
import { TempExporter } from './services/conversion/exporter/temp-exporter'
import { XDFileReader } from './services/conversion/xd-file-reader'
import createEnvironment from './services/general/environment'
import createSentry from './services/general/sentry'
import { logger, set as setLogger } from './services/instances/logger'

import type SourceArtboard from './entities/source/source-artboard'
import type SourceDesign from './entities/source/source-design'
import type { Exporter } from './services/conversion/exporter'
import type { Logger } from './typings'
import type { Manifest } from './typings/manifest'
import type { Octopus } from './typings/octopus'
import type { SafeResult } from '@avocode/octopus-common/dist/utils/queue'
import type { NormalizedReadResult, NormalizedPackageJson } from 'read-pkg-up'

type ConvertDesignOptions = {
  exporter?: Exporter
}

type OctopusXDConverterGeneralOptions = {
  logger?: Logger
}

type OctopusXDConverterOptions = OctopusXDConverterGeneralOptions & {
  sourceDesign: SourceDesign
}

export type ArtboardConversionResult = {
  id: string
  value: Octopus['OctopusDocument'] | null
  error: Error | null
  time: number
}

export type DesignConversionResult = {
  manifest: Manifest['OctopusManifest']
  time: number
}

type ArtboardExport = {
  images: { path: string; getImageData: () => Promise<Buffer> }[]
  artboard: ArtboardConversionResult
}

/**
 * Loading of .env file.
 */
createEnvironment()

export class OctopusXDConverter {
  private _pkg: Promise<NormalizedReadResult | undefined>
  private _sentry: ReturnType<typeof createSentry>
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest

  static EXPORTERS = {
    LOCAL: LocalExporter,
    TEMP: TempExporter,
  }

  static READERS = {
    FILE: XDFileReader,
  }

  static ARTBOARDS_QUEUE_NAME = 'artboards'
  static ARTBOARDS_QUEUE_PARALLELS = 5
  static PARTIAL_UPDATE_INTERVAL = 3000

  constructor(options: OctopusXDConverterOptions) {
    this._setupLogger(options?.logger)
    this._pkg = readPackageUpAsync({ cwd: __dirname })
    this._sentry = createSentry({ dsn: process.env.SENTRY_DSN, logger })
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ octopusXdConverter: this })
  }

  get octopusManifest(): OctopusManifest {
    return this._octopusManifest
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  get sentry(): ReturnType<typeof createSentry> {
    return this._sentry
  }

  get pkg(): Promise<NormalizedPackageJson> {
    return this._pkg.then((normalized) => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson
    })
  }

  private async _convertArtboardByIdSafe(
    targetArtboardId: string
  ): Promise<{ value: Octopus['OctopusDocument'] | null; error: Error | null }> {
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

  async convertArtboardById(targetArtboardId: string): Promise<ArtboardConversionResult> {
    const { time, result } = await benchmarkAsync(async () => this._convertArtboardByIdSafe(targetArtboardId))
    const { value, error } = result
    return { id: targetArtboardId, value, error, time }
  }

  private async _exportManifest(exporter: Exporter | null): Promise<Manifest['OctopusManifest']> {
    const { time, result: manifest } = await benchmarkAsync(() => this.octopusManifest.convert())
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
        const imageId = path.basename(image.path)
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
    artboards: ArtboardConversionResult[]
    images: { path: string; getImageData: () => Promise<Buffer> }[]
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
      OctopusXDConverter.PARTIAL_UPDATE_INTERVAL
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

export { LocalExporter }
export { TempExporter }
export { XDFileReader }
