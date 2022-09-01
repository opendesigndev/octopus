import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import { isObject } from '@avocode/octopus-common/dist/utils/common'
import { Queue } from '@avocode/octopus-common/dist/utils/queue-web'
import { v4 as uuidv4 } from 'uuid'

import { OctopusManifest } from './entities/octopus/octopus-manifest'
import { SourceArtboard } from './entities/source/source-artboard'
import { SourceDesign } from './entities/source/source-design'
import { logger, setDefaults, setLogger } from './services'
import { DocumentConverter } from './services/conversion/document-converter'
import { getPlatformFactories, setPlatformFactories } from './services/general/platforms'
import { readPackageMeta } from './utils/read-pkg-meta'
import { getRole } from './utils/source'

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

export type DocumentConversionResult = {
  id: string
  value: Octopus['OctopusDocument'] | null
  error: Error | null
  time: number
}

export type DesignConversionResult = {
  manifest: Manifest['OctopusManifest'] | undefined
  components: DocumentConversionResult[]
  images: { name: string; data: ArrayBuffer }[]
  previews: { id: string; data: ArrayBuffer }[]
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

  static DOCUMENT_QUEUE_PARALLELS = 5
  static DOCUMENT_QUEUE_NAME = 'Document queue'
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

  private async _convertDocumentSafe(
    source: SourceArtboard
  ): Promise<{ value: Octopus['OctopusDocument'] | null; error: Error | null }> {
    try {
      const version = await this.pkg.version
      const value = await new DocumentConverter({ source, version }).convert()
      return { value, error: null }
    } catch (error) {
      return { value: null, error }
    }
  }

  async convertDocument(source: SourceArtboard): Promise<DocumentConversionResult> {
    const { time, result } = await this._services.benchmark.benchmarkAsync(async () =>
      this._convertDocumentSafe(source)
    )
    const { value, error } = result
    return { id: source.id, value, error, time }
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

  private async _exportDocumentSafe(
    exporter: AbstractExporter | null,
    converted: DocumentConversionResult,
    role: 'ARTBOARD' | 'COMPONENT' | 'PASTEBOARD'
  ): Promise<{ path: string | null; error: Error | null }> {
    try {
      const path = await exporter?.exportDocument?.(converted, role)
      if (!path) return { path: null, error: new Error('Export Artboard failed - no path') }
      return { path, error: null }
    } catch (error) {
      return { path: null, error }
    }
  }

  private async _exportDocument(
    exporter: AbstractExporter | null,
    source: SourceArtboard
  ): Promise<DocumentConversionResult> {
    const converted = await this.convertDocument(source)

    const { path, error } = await this._exportDocumentSafe(exporter, converted, getRole(source))

    this._octopusManifest?.setExportedComponent(source, {
      path,
      error: converted.error ?? error,
      time: converted.time,
    })

    return converted
  }

  private _initDocumentQueue(exporter: AbstractExporter | null) {
    return new Queue({
      name: OctopusFigConverter.DOCUMENT_QUEUE_NAME,
      parallels: OctopusFigConverter.DOCUMENT_QUEUE_PARALLELS,
      factory: async (sources: SourceArtboard[]): Promise<SafeResult<DocumentConversionResult>[]> => {
        return Promise.all(
          sources.map(async (source) => ({
            value: await this._exportDocument(exporter, source),
            error: null,
          }))
        )
      },
    })
  }

  async convertDesign(options?: ConvertDesignOptions): Promise<DesignConversionResult | null> {
    const finalizeConvert = detachPromiseControls<void>()
    const conversionResult: DesignConversionResult = { manifest: undefined, components: [], images: [], previews: [] }
    const exporter = isObject(options?.exporter) ? (options?.exporter as AbstractExporter) : null
    const shouldReturn = !(options?.skipReturn ?? false)
    const awaitingArtboards: Promise<DocumentConversionResult>[] = []

    const imageSizeMap: ImageSizeMap = {}

    const convertDocument = async (frame: ResolvedFrame) => {
      const rawArtboard = frame.node.document as RawLayerFrame
      const sourcePathPromise = exporter?.exportRawDocument?.(rawArtboard, frame.nodeId)

      const fillIds = Object.keys(frame.fills)
      this._octopusManifest?.setExportedComponentImageMap(frame.nodeId, fillIds)
      const sourceArtboard = new SourceArtboard({ rawArtboard, imageSizeMap })
      const artboardPromise = queue.exec(sourceArtboard)
      awaitingArtboards.push(artboardPromise)

      this._octopusManifest?.setExportedSourcePath(frame.nodeId, await sourcePathPromise)
      const artboard = await artboardPromise
      if (shouldReturn) conversionResult.components.push(artboard)
    }

    /** Init document queue */
    const queue = this._initDocumentQueue(exporter)

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

      /** Wait till all documents + dependencies are processed */
      await design.content
      await Promise.all(awaitingArtboards)

      /** At this moment all documents + dependencies should be converted and exported */

      /** Final trigger of manifest save */
      clearInterval(manifestInterval)
      conversionResult.manifest = await this._exportManifest(exporter)

      /** Trigger finalizer */
      exporter?.finalizeExport?.()
      finalizeConvert.resolve()
    })

    design.on('ready:artboard', async (frame: ResolvedFrame) => convertDocument(frame))

    design.on('ready:component', async (frame: ResolvedFrame) => convertDocument(frame))

    design.on('ready:library', async (frame: ResolvedFrame) => convertDocument(frame))

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
