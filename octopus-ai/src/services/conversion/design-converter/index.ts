import path from 'path'

import { rejectTo } from '@avocode/octopus-common/dist/utils/async'
import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark-node'
import { push } from '@avocode/octopus-common/dist/utils/common'
import { Queue } from '@avocode/octopus-common/dist/utils/queue-web'

import { OctopusManifest } from '../../../entities/octopus/octopus-manifest'
import { set as setTextLayerGroupingService } from '../../instances/text-layer-grouping-service'
import { ArtboardConverter } from '../artboard-converter'
import { LocalExporter } from '../exporters/local-exporter'
import { TempExporter } from '../exporters/temp-exporter'
import { TextLayerGroupingservice } from '../text-layer-grouping-service'

import type { OctopusAIConverter } from '../../..'
import type { SourceArtboard } from '../../../entities/source/source-artboard'
import type { SourceDesign } from '../../../entities/source/source-design'
import type { SourceImage } from '../../../typings'
import type { Manifest } from '../../../typings/manifest'
import type { Octopus } from '../../../typings/octopus'
import type { AdditionalTextData } from '../../../typings/raw'
import type { Exporter } from '../exporters'
import type { SafeResult } from '@avocode/octopus-common/dist/utils/queue-web'

type DesignConverterGeneralOptions = {
  octopusAIconverter: OctopusAIConverter
  exporter?: Exporter
  partialUpdateInterval?: number
}

type OctopusAIConverterOptions = DesignConverterGeneralOptions & {
  sourceDesign: SourceDesign
}

export type ConvertDesignResult = {
  manifest: Manifest['OctopusManifest']
  artboards: ArtboardConversionResult[]
  images: SourceImage[]
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

export class DesignConverter {
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest
  private _octopusAIConverter: OctopusAIConverter
  private _exporter?: Exporter
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

  private async _convertArtboardByIdSafe(targetArtboardId: string) {
    try {
      const value = await new ArtboardConverter({
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

    const queue = this._initArtboardQueue(exporter)

    const manifestInterval = setInterval(async () => this._exportManifest(exporter), this._partialUpdateInterval)

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
