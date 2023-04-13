import { rejectTo } from '@opendesign/octopus-common/dist/utils/async.js'
import { push } from '@opendesign/octopus-common/dist/utils/common.js'
import { Queue } from '@opendesign/octopus-common/dist/utils/queue.js'

import { OctopusManifest } from '../../../entities/octopus/octopus-manifest.js'
import { getBenchmarkService } from '../../index.js'
import { set as setTextLayerGroupingService } from '../../instances/text-layer-grouping-service.js'
import { ArtboardConverter } from '../artboard-converter/index.js'
import { TextLayerGroupingservice } from '../text-layer-grouping-service/index.js'

import type { SourceArtboard } from '../../../entities/source/source-artboard.js'
import type { SourceDesign } from '../../../entities/source/source-design.js'
import type { OctopusAIConverter } from '../../../octopus-ai-converter.js'
import type { Manifest } from '../../../typings/manifest/index.js'
import type { Octopus } from '../../../typings/octopus/index.js'
import type { AdditionalTextData } from '../../../typings/raw/index.js'
import type { AIExporter } from '../exporters/index.js'
import type {
  SourceImage,
  GenericComponentConversionResult,
  GenericDesignConversionResult,
} from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'
import type { SafeResult } from '@opendesign/octopus-common/dist/utils/queue.js'

type DesignConverterGeneralOptions = {
  octopusAIconverter: OctopusAIConverter
  exporter?: AIExporter
  partialUpdateInterval?: number
}

type OctopusAIConverterOptions = DesignConverterGeneralOptions & {
  /**
   * SourceDesign instance encapsulates all the source design data.
   * It consists of artboards, images and other assets.
   * It's possible to generate using either built-in `AIFileReader` or by custom reader.
   */
  sourceDesign: SourceDesign
}

export type ConvertDesignResult = {
  manifest: Manifest['OctopusManifest']
  artboards: ComponentConversionResult[]
  images: SourceImage[]
}

export type ComponentConversionResult = GenericComponentConversionResult<Octopus['OctopusComponent']>

export type ArtboardExport = {
  images: SourceImage[]
  artboard: ComponentConversionResult
}

export type DesignConversionResult = GenericDesignConversionResult<Manifest['OctopusManifest']>

export class DesignConverter {
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest
  private _octopusAIConverter: OctopusAIConverter
  private _exporter?: AIExporter
  private _partialUpdateInterval: number

  static PARTIAL_UPDATE_INTERVAL = 3000
  static ARTBOARDS_QUEUE_PARALLELS = 5
  static ARTBOARDS_QUEUE_NAME = 'artboards'

  constructor(options: OctopusAIConverterOptions) {
    this._setupTextLayerGroupingService(options.sourceDesign.additionalTextData)
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ designConverter: this })
    this._octopusAIConverter = options.octopusAIconverter
    this._exporter = options.exporter
    this._partialUpdateInterval = options.partialUpdateInterval ?? DesignConverter.PARTIAL_UPDATE_INTERVAL
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  private _setupTextLayerGroupingService(additionalTextData: AdditionalTextData) {
    const instance = new TextLayerGroupingservice(additionalTextData)
    setTextLayerGroupingService(instance)
  }

  get octopusAIConverter(): OctopusAIConverter {
    return this._octopusAIConverter
  }

  get manifest(): OctopusManifest {
    return this._octopusManifest
  }

  private _convertArtboardByIdSafe(targetArtboardId: string) {
    try {
      const value = new ArtboardConverter({
        targetArtboardId,
        designConverter: this,
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

  convertArtboardById(targetArtboardId: string): ComponentConversionResult {
    const {
      result: { value, error },
      time,
    } = getBenchmarkService()(() => this._convertArtboardByIdSafe(targetArtboardId))

    return { id: targetArtboardId, value, error, time }
  }

  private async _exportManifest(exporter: AIExporter | null): Promise<Manifest['OctopusManifest']> {
    const { time, result: manifest } = getBenchmarkService()(() => this.manifest.convert())
    await exporter?.exportManifest?.({ manifest, time })
    return manifest
  }

  private async _exportArtboard(exporter: AIExporter | null, artboard: SourceArtboard): Promise<ArtboardExport> {
    const { images: imagesDep } = artboard.dependencies
    const artboardImages = this._sourceDesign.images.filter((image) => imagesDep.some((dep) => image.id.includes(dep)))
    const images = await Promise.all(
      artboardImages.map(async (image) => {
        const imageId = image.id
        const imagePath = (await rejectTo(exporter?.exportImage?.(image) ?? Promise.reject(''))) as string
        this.manifest.setExportedImage(imageId, imagePath)

        return image
      })
    )

    const converted = this.convertArtboardById(artboard.id)
    const artboardPath = (await rejectTo(exporter?.exportComponent?.(converted) ?? Promise.reject(''))) as string
    await exporter?.exportSourceArtboard?.(artboard)

    this.manifest.setExportedArtboard(artboard.id, artboardPath)

    return { images, artboard: converted }
  }

  private _initArtboardQueue(exporter: AIExporter | null) {
    return new Queue({
      name: DesignConverter.ARTBOARDS_QUEUE_NAME,
      parallels: DesignConverter.ARTBOARDS_QUEUE_PARALLELS,
      factory: async (artboards: SourceArtboard[]): Promise<SafeResult<ArtboardExport>[]> => {
        return Promise.all(
          artboards.map(async (artboard) => {
            return { value: await this._exportArtboard(exporter, artboard), error: null }
          })
        )
      },
    })
  }

  async convert(): Promise<ConvertDesignResult> {
    const exporter = this._exporter ?? null

    this._octopusManifest.registerBasePath(await exporter?.getBasePath?.())

    exporter?.exportAuxiliaryData?.(this._sourceDesign)

    /** Init artboards queue */
    const queue = this._initArtboardQueue(exporter)

    /** Init partial update + first manifest save */
    const manifestInterval = setInterval(async () => this._exportManifest(exporter), this._partialUpdateInterval)

    /** Enqueue all artboards */
    const allConverted = await Promise.all(this._sourceDesign.artboards.map((artboard) => queue.exec(artboard)))
    const artboards = allConverted.map((converted) => converted.artboard)

    /** Final trigger of manifest save */
    clearInterval(manifestInterval)
    const manifest = await this._exportManifest(exporter)

    const images = [...new Set(allConverted.reduce((images, converted) => push(images, ...converted.images), []))]

    /** Trigger finalizer */
    exporter?.finalizeExport?.()

    return {
      manifest,
      artboards,
      images,
    }
  }
}
