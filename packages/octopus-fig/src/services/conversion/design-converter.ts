import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'
import { isObject } from '@opendesign/octopus-common/dist/utils/common.js'
import { Queue } from '@opendesign/octopus-common/dist/utils/queue.js'
import { v4 as uuidv4 } from 'uuid'

import { ComponentConverter } from './component-converter.js'
import { OctopusManifest } from '../../entities/octopus/octopus-manifest.js'
import { SourceArtboard } from '../../entities/source/source-artboard.js'
import { SourceDesign } from '../../entities/source/source-design.js'
import { logger } from '../../services/index.js'
import { getRole } from '../../utils/source.js'

import type { DesignConverterOptions, OctopusFigConverter } from '../../octopus-fig-converter.js'
import type { Octopus } from '../../typings/octopus.js'
import type { RawDesign } from '../../typings/raw/design.js'
import type { RawLayerContainer } from '../../typings/raw/layer.js'
import type { PackageMeta } from '../../utils/read-pkg-meta.js'
import type { AbstractExporter } from '../exporters/abstract-exporter.js'
import type { ImageSize } from '../general/image-size/image-size.js'
import type {
  ResolvedDesign,
  ResolvedFrame,
  ResolvedStyle,
  ResolvedFill,
  ResolvedPreview,
} from '@opendesign/figma-parser'
import type {
  ComponentConversionResult,
  Manifest,
} from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'
import type { SafeResult } from '@opendesign/octopus-common/dist/utils/queue.js'
import type { EventEmitter } from 'eventemitter3'

export type ImageSizeMap = { [key: string]: ImageSize }

export type DesignConversionResult = {
  manifest: Manifest['OctopusManifest'] | undefined
  components: ComponentConversionResult[]
  images: { name: string; data: ArrayBuffer }[]
  previews: { id: string; data: ArrayBuffer }[]
}

const IS_LIBRARY = true

export class DesignConverter {
  private _designEmitter: EventEmitter | null
  private _designId: string
  private _octopusManifest: OctopusManifest
  private _octopusConverter: OctopusFigConverter
  private _exporter: AbstractExporter | null
  private _partialUpdateInterval: number
  private _shouldReturn: boolean
  private _imageSizeMap: ImageSizeMap = {}
  private _queue: Queue<SourceArtboard, ComponentConversionResult>
  private _awaitingComponents: Promise<ComponentConversionResult>[] = []
  private _conversionResult: DesignConversionResult = { manifest: undefined, components: [], images: [], previews: [] }
  private _finalizeConvert: DetachedPromiseControls<void>

  static COMPONENT_QUEUE_PARALLELS = 5
  static COMPONENT_QUEUE_NAME = 'Component queue'
  static PARTIAL_UPDATE_INTERVAL = 3000

  constructor(options: DesignConverterOptions, octopusConverter: OctopusFigConverter) {
    this._designEmitter = options.designEmitter || null
    this._designId = options.designId || uuidv4()
    this._octopusConverter = octopusConverter

    this._exporter = isObject(options.exporter) ? options.exporter : null
    this._partialUpdateInterval = options.partialUpdateInterval || DesignConverter.PARTIAL_UPDATE_INTERVAL
    this._shouldReturn = !(options.skipReturn ?? false)

    this._finalizeConvert = detachPromiseControls<void>()
    this._queue = this._initComponentQueue()
  }

  get id(): string {
    return this._designId
  }

  get octopusManifest(): OctopusManifest {
    return this._octopusManifest
  }

  get imageSizeMap(): ImageSizeMap {
    return this._imageSizeMap
  }

  getImageSize(ref: string | undefined): { width: number; height: number } | undefined {
    return ref ? this._imageSizeMap[ref] : undefined
  }

  get pkgMeta(): PackageMeta {
    return this._octopusConverter.pkg
  }

  private async _convertSourceArtboardSafe(
    source: SourceArtboard
  ): Promise<{ value: Octopus['OctopusComponent'] | null; error: Error | null }> {
    try {
      const value = await new ComponentConverter({ source, designConverter: this }).convert()
      return { value, error: null }
    } catch (error) {
      return { value: null, error }
    }
  }

  private async _convertSourceArtboard(source: SourceArtboard): Promise<ComponentConversionResult> {
    const { time, result } = await this._octopusConverter.benchmarkAsync(async () =>
      this._convertSourceArtboardSafe(source)
    )
    const { value, error } = result
    return { id: source.id, value, error, time }
  }

  private async _exportManifest(): Promise<Manifest['OctopusManifest'] | undefined> {
    const octopusManifest = this.octopusManifest
    if (!octopusManifest) return undefined
    const manifest = await octopusManifest.convert()

    try {
      await this._exporter?.exportManifest?.(manifest)
    } catch (error) {
      logger?.error(error)
    }

    return manifest
  }

  private async _exportComponentSafe(
    converted: ComponentConversionResult,
    role: 'ARTBOARD' | 'COMPONENT' | 'PASTEBOARD' | 'PARTIAL'
  ): Promise<{ path: string | null; error: Error | null }> {
    try {
      const path = await this._exporter?.exportComponent?.(converted, role)
      if (!path) return { path: null, error: new Error('Export Component failed - no path') }
      return { path, error: null }
    } catch (error) {
      return { path: null, error }
    }
  }

  private async _exportComponent(source: SourceArtboard): Promise<ComponentConversionResult> {
    const converted = await this._convertSourceArtboard(source)

    const { path, error } = await this._exportComponentSafe(converted, getRole(source))

    this.octopusManifest?.setExportedComponent(source, {
      path,
      error: converted.error ?? error,
      time: converted.time,
    })

    return converted
  }

  private _initComponentQueue() {
    return new Queue({
      name: DesignConverter.COMPONENT_QUEUE_NAME,
      parallels: DesignConverter.COMPONENT_QUEUE_PARALLELS,
      factory: async (sources: SourceArtboard[]): Promise<SafeResult<ComponentConversionResult>[]> => {
        return Promise.all(
          sources.map(async (source) => ({
            value: await this._exportComponent(source),
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

    this._octopusManifest = new OctopusManifest({ sourceDesign, octopusConverter: this._octopusConverter })

    if (sourceDesign.raw) {
      this._exporter?.exportRawDesign?.(sourceDesign.raw)
    } // skip this for partial converts (FigmaPlugin source)

    /** Init partial update */
    this._exportManifest()
    const manifestInterval = setInterval(async () => this._exportManifest(), this._partialUpdateInterval)

    /** Wait till all components + dependencies are processed */
    await design.content
    this.octopusManifest?.finalize()

    await Promise.all(this._awaitingComponents)

    /** At this moment all components + dependencies should be converted and exported */

    /** Final trigger of manifest save */
    clearInterval(manifestInterval)
    this._conversionResult.manifest = await this._exportManifest()

    /** Trigger finalizer */
    this._exporter?.finalizeExport?.()
    this._finalizeConvert.resolve()
  }

  private async _convertFrame(frame: ResolvedFrame, isLibrary = false) {
    const { libraryMeta, nodeId, node, fills } = frame
    if (isLibrary && libraryMeta) this.octopusManifest?.setExportedLibrary(libraryMeta)

    const rawFrame = node.document as RawLayerContainer
    const sourcePathPromise = this._exporter?.exportRawComponent?.(rawFrame, nodeId)

    const fillIds = Object.keys(fills ?? {})
    this.octopusManifest?.setExportedComponentImageMap(nodeId, fillIds)

    const sourceComponent = new SourceArtboard({ rawFrame })
    const componentPromise = this._queue.exec(sourceComponent)
    this._awaitingComponents.push(componentPromise)

    this.octopusManifest?.setExportedSourcePath(nodeId, await sourcePathPromise)
    const component = await componentPromise
    if (this._shouldReturn) this._conversionResult.components.push(component)
  }

  private async _convertChunk(style: ResolvedStyle) {
    const chunkPath = await this._exporter?.exportRawChunk?.(style, style.id)
    this.octopusManifest?.setExportedChunk(style, chunkPath)
  }

  private async _convertFill(fill: ResolvedFill & { size?: ImageSize }) {
    if (typeof fill.buffer === 'string') fill.buffer = this._octopusConverter.base64ToUint8Array(fill.buffer) // @TODO investigate Buffer.buffer safety

    const fillName = fill.ref
    const imageSize = fill.size ? fill.size : await this._octopusConverter.imageSize(fill.buffer)
    if (imageSize) this._imageSizeMap[fillName] = imageSize

    const fillPathPromise = this._exporter?.exportImage?.(fillName, fill.buffer)
    this.octopusManifest?.setExportedImagePath(fillName, fillPathPromise)
    if (this._shouldReturn) this._conversionResult.images.push({ name: fillName, data: fill.buffer })
  }

  private async _convertPreview(preview: ResolvedPreview) {
    const previewId = preview.nodeId
    const previewPath = await this._exporter?.exportPreview?.(preview.nodeId, preview.buffer)
    this.octopusManifest?.setExportedPreviewPath(previewId, previewPath)
    if (this._shouldReturn) this._conversionResult.previews.push({ id: previewId, data: preview.buffer })
  }

  async convert(): Promise<DesignConversionResult | null> {
    const designEmitter = this._designEmitter
    if (designEmitter === null) {
      logger?.error('Creating Design Failed')
      return null
    }

    designEmitter.on('ready:design', (design) => this._convertDesign(design))

    designEmitter.on('ready:style', (chunk) => this._convertChunk(chunk))

    designEmitter.on('ready:artboard', (artboard) => this._convertFrame(artboard))
    designEmitter.on('ready:component', (component) => this._convertFrame(component))
    designEmitter.on('ready:library', (library) => this._convertFrame(library, IS_LIBRARY))

    designEmitter.on('ready:fill', (fill) => this._convertFill(fill))
    designEmitter.on('ready:preview', (preview) => this._convertPreview(preview))

    await this._finalizeConvert.promise
    return this._shouldReturn ? this._conversionResult : null
  }
}
