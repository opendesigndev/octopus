import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import { isObject } from '@avocode/octopus-common/dist/utils/common'
import { Queue } from '@avocode/octopus-common/dist/utils/queue-web'
import { v4 as uuidv4 } from 'uuid'

import { OctopusManifest } from './entities/octopus/octopus-manifest'
import { SourceArtboard } from './entities/source/source-artboard'
import { SourceDesign } from './entities/source/source-design'
import { logger, setDefaults, setLogger } from './services'
import { ArtboardConverter } from './services/conversion/artboard-converter'
import { getPlatformFactories, setPlatformFactories } from './services/general/platforms'
import { readPackageMeta } from './utils/read-pkg-meta'

import type { AbstractExporter } from './services/exporters/abstract-exporter'
import type { ImageSize } from './services/general/image-size/image-size'
import type { NodeFactories, WebFactories } from './services/general/platforms'
import type { Logger } from './typings'
import type { Manifest } from './typings/manifest'
import type { Octopus } from './typings/octopus'
import type { RawDesign } from './typings/raw/design'
import type { RawLayerFrame } from './typings/raw/layer'
import type {
  Design,
  ResolvedDesign,
  ResolvedFrame,
  ResolvedFill,
  ResolvedPreview,
} from '@avocode/figma-parser/lib/src/index-node'
import type { SafeResult } from '@avocode/octopus-common/dist/utils/queue-web'

export type ConvertDesignOptions = {
  exporter?: AbstractExporter
  partialUpdateInterval?: number
  skipReturn?: boolean
}

export type OctopusConverterOptions = {
  design: Design | null
  designId?: string
  logger?: Logger
  platformFactories: WebFactories | NodeFactories
  loggerEnabled?: boolean
}

export type ImageSizeMap = { [key: string]: ImageSize }

export type ArtboardConversionResult = {
  id: string
  value: Octopus['OctopusDocument'] | null
  error: Error | null
  time: number
}

export type DesignConversionResult = {
  manifest: Manifest['OctopusManifest'] | undefined
  artboards: ArtboardConversionResult[]
  images: { name: string; data: ArrayBuffer }[]
  previews: { id: string; data: ArrayBuffer }[]
}

export type ArtboardConversionWithAssetsResult = ArtboardConversionResult & {
  images: {
    id: string
    image: Uint8Array
  }[]
}

export class OctopusFigConverter {
  private _id: string
  private _pkg: { version: string; name: string }
  private _design: Design | null
  private _octopusManifest: OctopusManifest | undefined
  private _services: {
    benchmark: {
      benchmarkAsync: <T>(cb: (...args: unknown[]) => Promise<T>) => Promise<{ result: T; time: number }>
    }
    imageSize: (buffer: ArrayBuffer) => Promise<ImageSize | undefined>
  }

  static ARTBOARDS_QUEUE_PARALLELS = 5
  static ARTBOARDS_QUEUE_NAME = 'Artboards queue'
  static PARTIAL_UPDATE_INTERVAL = 3000

  constructor(options: OctopusConverterOptions) {
    this._setGlobals(options)
    this._pkg = readPackageMeta()
    this._services = this._initServices()

    this._id = options.designId || uuidv4()
    this._design = options.design
  }

  get id(): string {
    return this._id
  }

  get octopusManifest(): OctopusManifest | undefined {
    return this._octopusManifest
  }

  get sourceDesign(): Design | null {
    return this._design
  }

  get bmarkAsync() {
    return this._services.benchmark.benchmarkAsync
  }

  private _initServices() {
    return {
      benchmark: getPlatformFactories().createBenchmarkService(),
      imageSize: getPlatformFactories().createImageSizeService(),
    }
  }

  private _setGlobals(options: OctopusConverterOptions): void {
    if ('createEnvironment' in options.platformFactories) {
      options.platformFactories.createEnvironment?.()
    }
    setPlatformFactories(options.platformFactories)
    setDefaults({
      logger: {
        enabled: options.loggerEnabled ?? true,
      },
    })
    if (isObject(options.logger)) setLogger(options.logger)
  }

  get pkg(): { name: string; version: string } {
    return this._pkg
  }

  private async _convertArtboardSafe(
    artboard: SourceArtboard
  ): Promise<{ value: Octopus['OctopusDocument'] | null; error: Error | null }> {
    try {
      const version = await this.pkg.version
      const value = await new ArtboardConverter({ artboard, version }).convert()
      return { value, error: null }
    } catch (error) {
      return { value: null, error }
    }
  }

  async convertArtboard(artboard: SourceArtboard): Promise<ArtboardConversionResult> {
    const { time, result } = await this._services.benchmark.benchmarkAsync(async () =>
      this._convertArtboardSafe(artboard)
    )
    const { value, error } = result
    return { id: artboard.id, value, error, time }
  }

  private async _exportManifest(exporter: AbstractExporter | null): Promise<Manifest['OctopusManifest'] | undefined> {
    const octopusManifest = this._octopusManifest
    if (!octopusManifest) return undefined
    const { result: manifest } = await this._services.benchmark.benchmarkAsync(() => octopusManifest.convert())

    try {
      await exporter?.exportManifest?.(manifest)
    } catch (error) {
      logger?.error(error)
    }

    return manifest
  }

  private async _exportArtboardSafe(
    exporter: AbstractExporter | null,
    converted: ArtboardConversionResult
  ): Promise<{ artboardPath: string | null; error: Error | null }> {
    try {
      const artboardPath = await exporter?.exportArtboard?.(converted)
      if (!artboardPath) return { artboardPath: null, error: new Error('Export Artboard failed - no artboardPath') }
      return { artboardPath, error: null }
    } catch (error) {
      return { artboardPath: null, error }
    }
  }

  private async _exportArtboard(
    exporter: AbstractExporter | null,
    artboard: SourceArtboard
  ): Promise<ArtboardConversionResult> {
    const converted = await this.convertArtboard(artboard)

    const { artboardPath, error } = await this._exportArtboardSafe(exporter, converted)

    this._octopusManifest?.setExportedArtboard(artboard.id, {
      path: artboardPath,
      error: converted.error ?? error,
      time: converted.time,
    })

    return converted
  }

  private _initArtboardQueue(exporter: AbstractExporter | null) {
    return new Queue({
      name: OctopusFigConverter.ARTBOARDS_QUEUE_NAME,
      parallels: OctopusFigConverter.ARTBOARDS_QUEUE_PARALLELS,
      factory: async (artboards: SourceArtboard[]): Promise<SafeResult<ArtboardConversionResult>[]> => {
        return Promise.all(
          artboards.map(async (artboard) => {
            return { value: await this._exportArtboard(exporter, artboard), error: null }
          })
        )
      },
    })
  }

  async convertDesign(options?: ConvertDesignOptions): Promise<DesignConversionResult | null> {
    const finalizeConvert = detachPromiseControls<void>()
    const conversionResult: DesignConversionResult = { manifest: undefined, artboards: [], images: [], previews: [] }
    const exporter = isObject(options?.exporter) ? (options?.exporter as AbstractExporter) : null
    const shouldReturn = !(options?.skipReturn ?? false)
    const awaitingArtboards: Promise<ArtboardConversionResult>[] = []

    const imageSizeMap: ImageSizeMap = {}

    /** Init artboards queue */
    const queue = this._initArtboardQueue(exporter)

    const design = this._design
    if (design === null) {
      logger?.error('Creating Design Failed')
      return null
    }

    design.on('ready:design', async (design: ResolvedDesign) => {
      const designId = design.designId
      const raw = design.design as unknown as RawDesign
      const sourceDesign = new SourceDesign({ designId, raw })

      this._octopusManifest = new OctopusManifest({ sourceDesign, octopusConverter: this })

      exporter?.exportRawDesign?.(sourceDesign.raw)

      /** Init partial update */
      this._exportManifest(exporter)
      const manifestInterval = setInterval(
        async () => this._exportManifest(exporter),
        options?.partialUpdateInterval || OctopusFigConverter.PARTIAL_UPDATE_INTERVAL
      )

      /** Wait till all artboards + dependencies are processed */
      await design.content
      await Promise.all(awaitingArtboards)

      /** At this moment all artboards + dependencies should be converted and exported */

      /** Final trigger of manifest save */
      clearInterval(manifestInterval)
      conversionResult.manifest = await this._exportManifest(exporter)

      /** Trigger finalizer */
      exporter?.finalizeExport?.()
      finalizeConvert.resolve()
    })

    design.on('ready:artboard', async (frame: ResolvedFrame) => {
      const rawArtboard = frame.node.document as RawLayerFrame
      exporter?.exportRawComponent?.(rawArtboard, frame.nodeId)

      const fillIds = Object.keys(frame.fills)
      this._octopusManifest?.setExportedArtboardImageMap(frame.nodeId, fillIds)
      const sourceArtboard = new SourceArtboard({ rawArtboard, imageSizeMap })
      const artboardPromise = queue.exec(sourceArtboard)
      awaitingArtboards.push(artboardPromise)
      const artboard = await artboardPromise
      if (shouldReturn) conversionResult.artboards.push(artboard)
    })

    design.on('ready:fill', async (fill: ResolvedFill) => {
      const fillName = fill.ref
      const fillPath = await exporter?.exportImage?.(fillName, fill.buffer)

      const imageSize = await this._services.imageSize(fill.buffer)
      if (imageSize) imageSizeMap[fillName] = imageSize

      this._octopusManifest?.setExportedImagePath(fillName, fillPath)
      if (shouldReturn) conversionResult.images.push({ name: fillName, data: fill.buffer })
    })

    design.on('ready:preview', async (preview: ResolvedPreview) => {
      const previewId = preview.nodeId
      const previewPath = await exporter?.exportPreview?.(preview.nodeId, preview.buffer)
      this._octopusManifest?.setExportedImagePath(previewId, previewPath)
      if (shouldReturn) conversionResult.previews.push({ id: previewId, data: preview.buffer })
    })

    await finalizeConvert.promise
    return shouldReturn ? conversionResult : null
  }
}
