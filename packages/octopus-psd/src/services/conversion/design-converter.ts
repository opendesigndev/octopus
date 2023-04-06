import { rejectTo } from '@opendesign/octopus-common/dist/utils/async.js'
import { isObject } from '@opendesign/octopus-common/dist/utils/common.js'
import { Queue } from '@opendesign/octopus-common/dist/utils/queue.js'
import { v4 as uuidv4 } from 'uuid'

import { ComponentConverter } from './component-converter.js'
import { OctopusManifest } from '../../entities/octopus/octopus-manifest.js'
import { logger } from '../index.js'

import type { SourceComponent } from '../../entities/source/source-component.js'
import type { PsdSourceImage, SourceDesign } from '../../entities/source/source-design.js'
import type { DesignConverterOptions, OctopusPSDConverter } from '../../octopus-psd-converter.js'
import type { Manifest } from '../../typings/manifest.js'
import type { Octopus } from '../../typings/octopus.js'
import type { AbstractExporter } from '../exporters/abstract-exporter.js'
import type { FeaturesTracker } from '@opendesign/octopus-common/dist/services/features-tracker.js'
import type {
  GenericComponentConversionResult,
  GenericDesignConversionResult,
} from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'
import type { SafeResult } from '@opendesign/octopus-common/dist/utils/queue.js'

export type ComponentConversionResult = GenericComponentConversionResult<Octopus['OctopusComponent']>
export type ConvertDesignResult = {
  manifest: Manifest['OctopusManifest']
  components: ComponentConversionResult[]
  images: PsdSourceImage[]
}
export type DesignConversionResult = GenericDesignConversionResult<Manifest['OctopusManifest']>

export class DesignConverter {
  private _designId: string
  private _octopusConverter: OctopusPSDConverter
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest
  private _exporter: AbstractExporter | null
  private _trackingService?: FeaturesTracker

  static COMPONENT_QUEUE_PARALLELS = 5
  static COMPONENT_QUEUE_NAME = 'Component queue'
  static PARTIAL_UPDATE_INTERVAL = 3000

  constructor(options: DesignConverterOptions, octopusConverter: OctopusPSDConverter) {
    this._designId = options?.designId || uuidv4()
    this._octopusConverter = octopusConverter
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ sourceDesign: options.sourceDesign, octopusConverter })
    this._exporter = isObject(options?.exporter) ? (options?.exporter as AbstractExporter) : null
    this._trackingService = options.trackingService
  }

  get designId(): string {
    return this._designId
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  get octopusManifest(): OctopusManifest {
    return this._octopusManifest
  }

  get octopusConverter(): OctopusPSDConverter {
    return this._octopusConverter
  }

  private async _convertSourceComponentSafe(
    componentId: string
  ): Promise<{ value: Octopus['OctopusComponent'] | null; error: Error | null }> {
    try {
      const value = await new ComponentConverter({ componentId, designConverter: this }).convert()
      return { value, error: null }
    } catch (error) {
      logger?.error('Converting Component failed', { componentId, error })
      return { value: null, error }
    }
  }

  private async _convertSourceComponent(componentId: string): Promise<ComponentConversionResult> {
    const { time, result } = await this._octopusConverter.benchmarkAsync(() =>
      this._convertSourceComponentSafe(componentId)
    )
    const { value, error } = result

    return { id: componentId, value, error, time }
  }

  private async _exportComponent(source: SourceComponent): Promise<ComponentConversionResult> {
    const componentId = source.id
    const componentResult = await this._convertSourceComponent(componentId)

    const componentPath = await this._exporter?.exportComponent?.(componentResult)
    const { time, error } = componentResult
    this.octopusManifest.setExportedComponent(componentResult.id, { path: componentPath, time, error })

    return componentResult
  }

  private _initComponentQueue() {
    return new Queue({
      name: DesignConverter.COMPONENT_QUEUE_NAME,
      parallels: DesignConverter.COMPONENT_QUEUE_PARALLELS,
      factory: async (sources: SourceComponent[]): Promise<SafeResult<ComponentConversionResult>[]> => {
        return Promise.all(
          sources.map(async (source) => ({
            value: await this._exportComponent(source),
            error: null,
          }))
        )
      },
    })
  }

  private _exportStatistics(): Promise<string> | undefined {
    if (!this._trackingService) {
      throw new Error('Tracking service is not initialized')
    }
    return this._exporter?.exportStatistics?.(this._trackingService.statistics)
  }

  private async _exportManifest({ isFinal = false } = {}): Promise<Manifest['OctopusManifest']> {
    const { time, result: manifest } = await this._octopusConverter.benchmarkAsync(() => this.octopusManifest.convert())

    if (!isFinal || !this._trackingService) {
      await this._exporter?.exportManifest?.({ manifest, time })
      return manifest
    }

    this._trackingService.collectManifestFeatures(manifest)
    const statisticsPath = await this._exportStatistics()

    // by default typescript does not check for excess types
    // https://github.com/microsoft/TypeScript/issues/19775#issue-271567665
    const manifestWithStatisticsReference = { ...manifest, ...(statisticsPath ? { statistics: statisticsPath } : null) }

    await this._exporter?.exportManifest?.({ manifest: manifestWithStatisticsReference, time })

    return manifestWithStatisticsReference
  }

  async convert(): Promise<ConvertDesignResult | null> {
    this.octopusManifest.registerBasePath(await this._exporter?.getBasePath?.())

    /** Init artboards queue */
    const queue = this._initComponentQueue()

    /** Init partial update + first manifest save */
    const manifestInterval = setInterval(async () => this._exportManifest(), DesignConverter.PARTIAL_UPDATE_INTERVAL)
    this._exportManifest()

    /** Images */
    const images = await Promise.all(
      this._sourceDesign.images.map(async (image) => {
        const imageId = image.id
        const imagePath = await rejectTo(this._exporter?.exportImage?.(image))
        if (typeof imagePath === 'string') {
          this.octopusManifest.setExportedImage(imageId, imagePath)
        }
        return image
      })
    )

    /** Enqueue all artboards */
    const components = await Promise.all(this._sourceDesign.components.map((artboard) => queue.exec(artboard)))

    /** At this moment all artboards + dependencies should be converted and exported */

    /** Final trigger of manifest save */
    clearInterval(manifestInterval)
    if (this._trackingService) {
      this._trackingService.collectLayerFeatures(components)
      this._trackingService.registerSpecificFeatures(`iccProfileName.${this._sourceDesign.iccProfileName}`)
    }

    const manifest = await this._exportManifest({ isFinal: true })

    /** Trigger finalizer */
    this._exporter?.finalizeExport?.()

    return { manifest, components, images }
  }
}
