import readPackageUpAsync from 'read-pkg-up'
import { isObject } from '@avocode/octopus-common/dist/utils/common'

import ArtboardConverter from './services/conversion/artboard-converter'
import createSentry from './services/general/sentry'
import { logger, set as setLogger } from './services/instances/logger'
import { LocalExporter } from './services/conversion/exporter/local-exporter'
import { TempExporter } from './services/conversion/exporter/temp-exporter'
import { AIFileReader } from './services/conversion/ai-file-reader'
import OctopusManifest from './entities/octopus/octopus-manifest'
import SourceLayerGroupingService from './services/conversion/source-layer-grouping-service'

import type { Logger, SourceImage } from './typings'
import type { Octopus } from './typings/octopus'
import type SourceDesign from './entities/source/source-design'
import type { NormalizedReadResult, NormalizedPackageJson } from 'read-pkg-up'
import type { OctopusManifestReport } from './typings/manifest'
import type { Exporter } from './services/conversion/exporter'
import { basename } from 'path'

type ConvertDesignOptions = {
  exporter?: Exporter
}

type OctopusAIConverterGeneralOptions = {
  logger?: Logger
}

type OctopusAIConverterFromFileOptions = OctopusAIConverterGeneralOptions & {
  dirPath: string
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

export type DesignConversionResult = {
  manifest: OctopusManifestReport
  time: number
}

export class OctopusAIConverter {
  private _pkg: Promise<NormalizedReadResult | undefined>
  private _sentry: ReturnType<typeof createSentry>
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest
  private _sourceLayerGroupingService: SourceLayerGroupingService

  static EXPORTERS = {
    LOCAL: LocalExporter,
    TEMP: TempExporter,
  }

  static async fromDir(options: OctopusAIConverterFromFileOptions): Promise<OctopusAIConverter> {
    const { logger } = options
    const sourceDesign = await new AIFileReader({ path: options.dirPath }).sourceDesign

    return new this({
      logger,
      sourceDesign,
    })
  }

  constructor(options: OctopusAIConverterOptions) {
    this._setupLogger(options?.logger)
    this._pkg = readPackageUpAsync({ cwd: __dirname })
    this._sentry = createSentry({ dsn: process.env.SENTRY_DSN, logger })
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ octopusAIConverter: this })

    const additionalTextData = options.sourceDesign.additionalTextData
    this._sourceLayerGroupingService = new SourceLayerGroupingService(additionalTextData)
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  get pkg(): Promise<NormalizedPackageJson> {
    return this._pkg.then((normalized) => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson
    })
  }

  get sentry(): ReturnType<typeof createSentry> {
    return this._sentry
  }

  get manifest(): OctopusManifest {
    return this._octopusManifest
  }

  private async _convertArtboardByIdSafe(targetArtboardId: string) {
    try {
      const value = await new ArtboardConverter({
        targetArtboardId,
        octopusAIConverter: this,
        sourceLayerGroupingService: this._sourceLayerGroupingService,
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
    const timeStart = performance.now()
    const { value, error } = await this._convertArtboardByIdSafe(targetArtboardId)
    const time = performance.now() - timeStart
    return { id: targetArtboardId, value, error, time }
  }

  async convertDesign(options?: ConvertDesignOptions): Promise<{
    manifest: OctopusManifestReport
    artboards: ArtboardConversionResult[]
    images: SourceImage[]
  }> {
    const exporter = isObject(options?.exporter) ? (options?.exporter as Exporter) : null
    this._octopusManifest.registerBasePath(await exporter?.getBasePath?.())

    /** Whole SourceDesign entity - mainly for dev purposes */
    exporter?.exportSourceDesign?.(this._sourceDesign)

    /** Images */
    const images = await Promise.all(
      this._sourceDesign.images.map(async (image) => {
        const imagePath = await exporter?.exportImage?.(image.id, image.rawValue)
        if (typeof imagePath === 'string') {
          this._octopusManifest.setExportedImage(image.id, `${imagePath}`)
        }
        return image
      })
    )

    /** Artboards */
    const artboards = await this._sourceDesign.artboards.reduce(async (queue, artboard) => {
      const artboards = await queue
      const converted = await this.convertArtboardById(artboard.id)
      const artboardPath = await exporter?.exportArtboard?.(artboard, converted)

      if (typeof artboardPath === 'string') {
        this._octopusManifest.setExportedArtboard(artboard.id, artboardPath)
      }
      return [...artboards, converted]
    }, Promise.resolve([]))

    /** Manifest */
    const timeStart = performance.now()
    const manifest = await this._octopusManifest.convert()
    const time = performance.now() - timeStart

    await exporter?.exportManifest?.({ manifest, time })

    return {
      manifest,
      artboards,
      images,
    }
  }
}

export { LocalExporter }
export { TempExporter }
