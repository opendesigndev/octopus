import path from 'path'

import { rejectTo } from '@avocode/octopus-common/dist/utils/async'
import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark-node'
import { isObject, push } from '@avocode/octopus-common/dist/utils/common'
import { Queue } from '@avocode/octopus-common/dist/utils/queue-web'
import readPackageUpAsync from 'read-pkg-up'

import { OctopusManifest } from './entities/octopus/octopus-manifest'
import { AIFileReader } from './services/conversion/ai-file-reader'
import { ArtboardConverter } from './services/conversion/artboard-converter'
import { LocalExporter } from './services/conversion/exporter/local-exporter'
import { TempExporter } from './services/conversion/exporter/temp-exporter'
import { LayerGroupingService } from './services/conversion/text-layer-grouping-service'
import { set as setLayerGroupingService } from './services/instances/layer-grouping-service'
import { set as setLogger } from './services/instances/logger'

import type { SourceArtboard } from './entities/source/source-artboard'
import type { SourceDesign } from './entities/source/source-design'
import type { Exporter } from './services/conversion/exporter'
import type { Logger, SourceImage } from './typings'
import type { Manifest } from './typings/manifest'
import type { Octopus } from './typings/octopus'
import type { AdditionalTextData } from './typings/raw'
import type { SafeResult } from '@avocode/octopus-common/dist/utils/queue-web'
import type { NormalizedPackageJson, NormalizedReadResult } from 'read-pkg-up'

type ConvertDesignOptions = {
  exporter?: Exporter
  partialUpdateInterval?: number
}

type OctopusAIConverterGeneralOptions = {
  logger?: Logger
}

type OctopusAIConverterFromFileOptions = OctopusAIConverterGeneralOptions & {
  filePath: string
}

type OctopusAIConverterOptions = OctopusAIConverterGeneralOptions & {
  sourceDesign: SourceDesign
}

export type ArtboardConversionResult = {
  id: string
  value: Octopus['OctopusDocument'] | null
  error: Error | null
  time: number
}

export type ArtboardExport = {
  images: SourceImage[]
  artboard: ArtboardConversionResult
}

export type DesignConversionResult = {
  manifest: Manifest['OctopusManifest']
  time: number
}

export class OctopusAIConverter {
  private _pkg: Promise<NormalizedReadResult | undefined>
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest

  static EXPORTERS = {
    LOCAL: LocalExporter,
    TEMP: TempExporter,
  }

  static PARTIAL_UPDATE_INTERVAL = 3000
  static ARTBOARDS_QUEUE_PARALLELS = 5
  static ARTBOARDS_QUEUE_NAME = 'artboards'

  static async fromPath(options: OctopusAIConverterFromFileOptions): Promise<OctopusAIConverter> {
    const { logger } = options
    const sourceDesign = await new AIFileReader({ path: options.filePath }).sourceDesign

    return new this({
      logger,
      sourceDesign,
    })
  }

  constructor(options: OctopusAIConverterOptions) {
    this._setupLogger(options?.logger)
    this._setupTextLayerGroupingService(options.sourceDesign.additionalTextData)
    this._pkg = readPackageUpAsync({ cwd: __dirname })
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ octopusAIConverter: this })
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  private _setupTextLayerGroupingService(additionalTextData: AdditionalTextData) {
    const instance = new LayerGroupingService(additionalTextData)
    setLayerGroupingService(instance)
  }

  get pkg(): Promise<NormalizedPackageJson> {
    return this._pkg.then((normalized) => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson
    })
  }

  get manifest(): OctopusManifest {
    return this._octopusManifest
  }

  private async _convertArtboardByIdSafe(targetArtboardId: string) {
    try {
      const value = await new ArtboardConverter({
        targetArtboardId,
        octopusAIConverter: this,
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
    const {
      result: { value, error },
      time,
    } = await benchmarkAsync(() => this._convertArtboardByIdSafe(targetArtboardId))

    return { id: targetArtboardId, value, error, time }
  }

  private async _exportManifest(exporter: Exporter | null): Promise<Manifest['OctopusManifest']> {
    const { time, result: manifest } = await benchmarkAsync(() => this.manifest.convert())
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
        const imagePath = (await rejectTo(exporter?.exportImage?.(image.path, rawData) ?? Promise.reject(''))) as string
        this.manifest.setExportedImage(imageId, imagePath)

        return image
      })
    )

    const converted = await this.convertArtboardById(artboard.id)
    const artboardPath = (await rejectTo(
      exporter?.exportArtboard?.(artboard, converted) ?? Promise.reject('')
    )) as string

    this.manifest.setExportedArtboard(artboard.id, artboardPath)

    return { images, artboard: converted }
  }

  private _initArtboardQueue(exporter: Exporter | null) {
    return new Queue({
      name: OctopusAIConverter.ARTBOARDS_QUEUE_NAME,
      parallels: OctopusAIConverter.ARTBOARDS_QUEUE_PARALLELS,
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
    images: SourceImage[]
  }> {
    const exporter = isObject(options?.exporter) ? (options?.exporter as Exporter) : null

    this._octopusManifest.registerBasePath(await exporter?.getBasePath?.())

    exporter?.exportAuxiliaryData?.(this._sourceDesign)

    const queue = this._initArtboardQueue(exporter)

    const manifestInterval = setInterval(
      async () => this._exportManifest(exporter),
      options?.partialUpdateInterval || OctopusAIConverter.PARTIAL_UPDATE_INTERVAL
    )

    const allConverted = await Promise.all(this._sourceDesign.artboards.map((artboard) => queue.exec(artboard)))

    clearInterval(manifestInterval)
    const manifest = await this._exportManifest(exporter)
    /** Manifest */

    exporter?.finalizeExport?.()

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
