import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark-node'
import { isObject } from '@avocode/octopus-common/dist/utils/common'
import readPackageUpAsync from 'read-pkg-up'

import { OctopusManifest } from './entities/octopus/octopus-manifest'
import { AIFileReader } from './services/conversion/ai-file-reader'
import { ArtboardConverter } from './services/conversion/artboard-converter'
import { LocalExporter } from './services/conversion/exporter/local-exporter'
import { TempExporter } from './services/conversion/exporter/temp-exporter'
import { LayerGroupingService } from './services/conversion/text-layer-grouping-service'
import { set as setLayerGroupingService } from './services/instances/layer-grouping-service'
import { set as setLogger } from './services/instances/logger'

import type { SourceDesign } from './entities/source/source-design'
import type { Exporter } from './services/conversion/exporter'
import type { Logger, SourceImage } from './typings'
import type { Manifest } from './typings/manifest'
import type { Octopus } from './typings/octopus'
import type { AdditionalTextData } from './typings/raw'
import type { NormalizedPackageJson, NormalizedReadResult } from 'read-pkg-up'

type ConvertDesignOptions = {
  exporter?: Exporter
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

  async convertDesign(options?: ConvertDesignOptions): Promise<{
    manifest: Manifest['OctopusManifest']
    artboards: ArtboardConversionResult[]
    images: SourceImage[]
  }> {
    const exporter = isObject(options?.exporter) ? (options?.exporter as Exporter) : null
    this._octopusManifest.registerBasePath(await exporter?.getBasePath?.())
    /** Whole SourceDesign entity - mainly for dev purposes */
    exporter?.exportAuxiliaryData?.(this._sourceDesign)

    /** Images */
    const images = await Promise.all(
      this._sourceDesign.images.map(async (image) => {
        const rawValue = await image.getImageData()
        const imagePath = await exporter?.exportImage?.(image.id, rawValue)
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
    const { time, result: manifest } = await benchmarkAsync(() => this._octopusManifest.convert())

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
