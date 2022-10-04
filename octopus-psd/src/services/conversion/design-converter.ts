import path from 'path'

import { rejectTo } from '@avocode/octopus-common/dist/utils/async'
import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark-node'
import { isObject } from '@avocode/octopus-common/dist/utils/common'
import { v4 as uuidv4 } from 'uuid'

import { OctopusManifest } from '../../entities/octopus/octopus-manifest'
import { logError } from '../instances/misc'
import { ComponentConverter } from './component-converter'

import type { OctopusPSDConverter } from '../..'
import type { SourceDesign, SourceImage } from '../../entities/source/source-design'
import type { Manifest } from '../../typings/manifest'
import type { Octopus } from '../../typings/octopus'
import type { AbstractExporter } from '../exporters/abstract-exporter'

export type DesignConverterOptions = {
  sourceDesign: SourceDesign
  designId?: string
  exporter?: AbstractExporter
}

export type ConvertDesignResult = {
  manifest: Manifest['OctopusManifest']
  components: ComponentConversionResult[]
  images: SourceImage[]
}

export type ComponentConversionResult = {
  id: string
  value: Octopus['OctopusDocument'] | undefined
  error: Error | null
  time: number
}

export type DesignConversionResult = {
  manifest: Manifest['OctopusManifest']
  time: number
}
export class DesignConverter {
  private _designId: string
  private _octopusConverter: OctopusPSDConverter
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest
  private _exporter: AbstractExporter | null

  constructor(options: DesignConverterOptions, octopusConverter: OctopusPSDConverter) {
    this._designId = options?.designId || uuidv4()
    this._octopusConverter = octopusConverter
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ sourceDesign: options.sourceDesign, octopusConverter })
    this._exporter = isObject(options?.exporter) ? (options?.exporter as AbstractExporter) : null
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

  private async _convertComponentSafe() {
    try {
      const value = await new ComponentConverter({ designConverter: this }).convert()
      return { value, error: null }
    } catch (error) {
      logError('Converting Component failed', { error })
      return { value: undefined, error }
    }
  }

  private async _convertComponentById(id: string): Promise<ComponentConversionResult> {
    const { time, result } = await benchmarkAsync(() => this._convertComponentSafe())
    const { value, error } = result
    return { id, value, error, time }
  }

  private async _exportManifest(exporter: AbstractExporter | null): Promise<Manifest['OctopusManifest']> {
    const { time, result: manifest } = await benchmarkAsync(() => this.octopusManifest.convert())
    await exporter?.exportManifest?.({ manifest, time })
    return manifest
  }

  async convert(): Promise<ConvertDesignResult | null> {
    this.octopusManifest.registerBasePath(await this._exporter?.getBasePath?.())

    /** First Manifest save  */
    this._exportManifest(this._exporter)

    /** Images */
    const images = await Promise.all(
      this._sourceDesign.images.map(async (image) => {
        const imageId = path.basename(image.path)
        const imagePath = await rejectTo(this._exporter?.exportImage?.(image.name, image.path))
        if (typeof imagePath === 'string') {
          this.octopusManifest.setExportedImage(imageId, imagePath)
        }
        return image
      })
    )

    /** Component */
    const componentResult = await this._convertComponentById(this._sourceDesign.component.id)
    const componentPath = await this._exporter?.exportComponent?.(componentResult)
    const { time, error } = componentResult
    this.octopusManifest.setExportedComponent(componentResult.id, { path: componentPath, time, error })

    /** Final trigger of Manifest save */
    const manifest = await this._exportManifest(this._exporter)

    /** Trigger finalizer */
    this._exporter?.finalizeExport?.()

    return {
      manifest,
      components: [componentResult],
      images,
    }
  }
}
