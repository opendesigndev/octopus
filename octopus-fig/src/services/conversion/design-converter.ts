import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import { isObject } from '@avocode/octopus-common/dist/utils/common'
import { Queue } from '@avocode/octopus-common/dist/utils/queue-web'
import { v4 as uuidv4 } from 'uuid'

import { OctopusManifest } from '../../entities/octopus/octopus-manifest'
import { SourceArtboard } from '../../entities/source/source-artboard'
import { SourceDesign } from '../../entities/source/source-design'
import { logger } from '../../services'
import { getRole } from '../../utils/source'
import { DocumentConverter } from '../conversion/document-converter'

import type { OctopusFigConverter } from '../../octopus-fig-converter'
import type { Manifest } from '../../typings/manifest'
import type { Octopus } from '../../typings/octopus'
import type { RawDesign } from '../../typings/raw/design'
import type { RawLayerFrame } from '../../typings/raw/layer'
import type { AbstractExporter } from '../exporters/abstract-exporter'
import type { ImageSize } from '../general/image-size/image-size'
import type {
  Design,
  ResolvedDesign,
  ResolvedFrame,
  ResolvedStyle,
  ResolvedFill,
  ResolvedPreview,
} from '@avocode/figma-parser/lib/src/index-node'
import type { DetachedPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import type { SafeResult } from '@avocode/octopus-common/dist/utils/queue-web'

export type DesignConverterOptions = {
  design: Design | null
  designId?: string
  exporter?: AbstractExporter
  partialUpdateInterval?: number
  skipReturn?: boolean
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

export class DesignConverter {
  private _design: Design | null
  private _designId: string
  private _octopusManifest: OctopusManifest | undefined
  private _octopusConverter: OctopusFigConverter
  private _exporter: AbstractExporter | null
  private _partialUpdateInterval: number
  private _shouldReturn: boolean
  private _imageSizeMap: ImageSizeMap = {}
  private _queue: Queue<SourceArtboard, DocumentConversionResult>
  private _awaitingArtboards: Promise<DocumentConversionResult>[] = []
  private _conversionResult: DesignConversionResult = { manifest: undefined, components: [], images: [], previews: [] }
  private _finalizeConvert: DetachedPromiseControls<void>

  static DOCUMENT_QUEUE_PARALLELS = 5
  static DOCUMENT_QUEUE_NAME = 'Document queue'
  static PARTIAL_UPDATE_INTERVAL = 3000

  constructor(options: DesignConverterOptions, octopusConverter: OctopusFigConverter) {
    this._design = options.design || null
    this._designId = options.designId || uuidv4()
    this._octopusConverter = octopusConverter

    this._exporter = isObject(options.exporter) ? options.exporter : null
    this._partialUpdateInterval = options.partialUpdateInterval || DesignConverter.PARTIAL_UPDATE_INTERVAL
    this._shouldReturn = !(options.skipReturn ?? false)

    this._finalizeConvert = detachPromiseControls<void>()
    this._queue = this._initDocumentQueue()
  }

  get id(): string {
    return this._designId
  }

  get octopusManifest(): OctopusManifest | undefined {
    return this._octopusManifest
  }

  set octopusManifest(manifest: OctopusManifest | undefined) {
    this._octopusManifest = manifest
  }

  get sourceDesign(): Design | null {
    return this._design
  }

  private async _convertDocumentSafe(
    source: SourceArtboard
  ): Promise<{ value: Octopus['OctopusDocument'] | null; error: Error | null }> {
    try {
      const version = await this._octopusConverter.pkg.version
      const value = await new DocumentConverter({ source, version }).convert()
      return { value, error: null }
    } catch (error) {
      return { value: null, error }
    }
  }

  private async convertDocument(source: SourceArtboard): Promise<DocumentConversionResult> {
    const { time, result } = await this._octopusConverter.benchmarkAsync(async () => this._convertDocumentSafe(source))
    const { value, error } = result
    return { id: source.id, value, error, time }
  }

  private async _exportManifest(): Promise<Manifest['OctopusManifest'] | undefined> {
    const octopusManifest = this.octopusManifest
    if (!octopusManifest) return undefined
    const { result: manifest } = await this._octopusConverter.benchmarkAsync(() => octopusManifest.convert())

    try {
      await this._exporter?.exportManifest?.(manifest)
    } catch (error) {
      logger?.error(error)
    }

    return manifest
  }

  private async _exportDocumentSafe(
    converted: DocumentConversionResult,
    role: 'ARTBOARD' | 'COMPONENT' | 'PASTEBOARD'
  ): Promise<{ path: string | null; error: Error | null }> {
    try {
      const path = await this._exporter?.exportDocument?.(converted, role)
      if (!path) return { path: null, error: new Error('Export Artboard failed - no path') }
      return { path, error: null }
    } catch (error) {
      return { path: null, error }
    }
  }

  private async _exportDocument(source: SourceArtboard): Promise<DocumentConversionResult> {
    const converted = await this.convertDocument(source)

    const { path, error } = await this._exportDocumentSafe(converted, getRole(source))

    this.octopusManifest?.setExportedComponent(source, {
      path,
      error: converted.error ?? error,
      time: converted.time,
    })

    return converted
  }

  private _initDocumentQueue() {
    return new Queue({
      name: DesignConverter.DOCUMENT_QUEUE_NAME,
      parallels: DesignConverter.DOCUMENT_QUEUE_PARALLELS,
      factory: async (sources: SourceArtboard[]): Promise<SafeResult<DocumentConversionResult>[]> => {
        return Promise.all(
          sources.map(async (source) => ({
            value: await this._exportDocument(source),
            error: null,
          }))
        )
      },
    })
  }

  private async _convertDesign(design: ResolvedDesign) {
    const designId = design.designId
    const raw = design.design as unknown as RawDesign
    const sourceDesign = new SourceDesign({ designId, raw })

    this.octopusManifest = new OctopusManifest({ sourceDesign, octopusConverter: this._octopusConverter })

    this._exporter?.exportRawDesign?.(sourceDesign.raw)

    /** Init partial update */
    this._exportManifest()
    const manifestInterval = setInterval(async () => this._exportManifest(), this._partialUpdateInterval)

    /** Wait till all documents + dependencies are processed */
    await design.content
    await Promise.all(this._awaitingArtboards)

    /** At this moment all documents + dependencies should be converted and exported */

    /** Final trigger of manifest save */
    clearInterval(manifestInterval)
    this._conversionResult.manifest = await this._exportManifest()

    /** Trigger finalizer */
    this._exporter?.finalizeExport?.()
    this._finalizeConvert.resolve()
  }

  private async _convertDocument(frame: ResolvedFrame) {
    const rawArtboard = frame.node.document as RawLayerFrame
    const sourcePathPromise = this._exporter?.exportRawDocument?.(rawArtboard, frame.nodeId)

    const fillIds = Object.keys(frame.fills)
    this.octopusManifest?.setExportedComponentImageMap(frame.nodeId, fillIds)
    const sourceArtboard = new SourceArtboard({ rawArtboard, imageSizeMap: this._imageSizeMap })
    const artboardPromise = this._queue.exec(sourceArtboard)
    this._awaitingArtboards.push(artboardPromise)

    this.octopusManifest?.setExportedSourcePath(frame.nodeId, await sourcePathPromise)
    const artboard = await artboardPromise
    if (this._shouldReturn) this._conversionResult.components.push(artboard)
  }

  private async _convertChunk(style: ResolvedStyle) {
    const chunkPath = await this._exporter?.exportRawChunk?.(style, style.id)
    this.octopusManifest?.setExportedChunk(style, chunkPath)
  }

  private async _convertFill(fill: ResolvedFill) {
    const fillName = fill.ref
    const fillPath = await this._exporter?.exportImage?.(fillName, fill.buffer)

    const imageSize = await this._octopusConverter.imageSize(fill.buffer)
    if (imageSize) this._imageSizeMap[fillName] = imageSize

    this.octopusManifest?.setExportedImagePath(fillName, fillPath)
    if (this._shouldReturn) this._conversionResult.images.push({ name: fillName, data: fill.buffer })
  }

  private async _convertPreview(preview: ResolvedPreview) {
    const previewId = preview.nodeId
    const previewPath = await this._exporter?.exportPreview?.(preview.nodeId, preview.buffer)
    this.octopusManifest?.setExportedImagePath(previewId, previewPath)
    if (this._shouldReturn) this._conversionResult.previews.push({ id: previewId, data: preview.buffer })
  }

  async convert(): Promise<DesignConversionResult | null> {
    const design = this._design
    if (design === null) {
      logger?.error('Creating Design Failed')
      return null
    }

    design.on('ready:design', (design) => this._convertDesign(design))

    design.on('ready:style', (chunk) => this._convertChunk(chunk))

    design.on('ready:artboard', (artboard) => this._convertDocument(artboard))
    design.on('ready:component', (component) => this._convertDocument(component))
    design.on('ready:library', (library) => this._convertDocument(library))

    design.on('ready:fill', (fill) => this._convertFill(fill))
    design.on('ready:preview', (preview) => this._convertPreview(preview))

    await this._finalizeConvert.promise
    return this._shouldReturn ? this._conversionResult : null
  }
}
