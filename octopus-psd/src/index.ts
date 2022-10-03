import path from 'path'

import { rejectTo } from '@avocode/octopus-common/dist/utils/async'
import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark-node'
import { isObject } from '@avocode/octopus-common/dist/utils/common'
import readPackageUpAsync from 'read-pkg-up'
import { v4 as uuidv4 } from 'uuid'

import { OctopusManifest } from './entities/octopus/octopus-manifest'
import { ComponentConverter } from './services/conversion/component-converter'
import { DebugExporter } from './services/exporters/debug-exporter'
import { LocalExporter } from './services/exporters/local-exporter'
import { createEnvironment } from './services/general/environment'
import { createSentry } from './services/general/sentry'
import { logger, set as setLogger } from './services/instances/logger'
import { logError } from './services/instances/misc'
import { set as setSentry } from './services/instances/sentry'
import { PSDFileReader } from './services/readers/psd-file-reader'
import { SourceFileReader } from './services/readers/source-file-reader'

import type { SourceDesign, SourceImage } from './entities/source/source-design'
import type { AbstractExporter } from './services/exporters/abstract-exporter'
import type { Logger } from './typings'
import type { Manifest } from './typings/manifest'
import type { Octopus } from './typings/octopus'
import type { NormalizedReadResult } from 'read-pkg-up'

export { LocalExporter, DebugExporter }
export { PSDFileReader, SourceFileReader }

type ConvertDesignOptions = {
  exporter?: AbstractExporter
}

export type ConvertDesignResult = {
  manifest: Manifest['OctopusManifest']
  components: ComponentConversionResult[]
  images: SourceImage[]
}

type OctopusPSDConverterGeneralOptions = {
  designId?: string
  logger?: Logger
}

type OctopusPSDConverterOptions = OctopusPSDConverterGeneralOptions & {
  sourceDesign: SourceDesign
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

/**
 * Loading of .env file.
 */
createEnvironment()

export class OctopusPSDConverter {
  private _id: string
  private _pkg: Promise<NormalizedReadResult | undefined>
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest

  static EXPORTERS = {
    LOCAL: LocalExporter,
    DEBUG: DebugExporter,
  }

  static READERS = {
    PSD: PSDFileReader,
    SOURCE: SourceFileReader,
  }

  constructor(options: OctopusPSDConverterOptions) {
    this._setupLogger(options?.logger)
    setSentry(
      createSentry({
        dsn: process.env.SENTRY_DSN,
        logger,
      })
    )

    this._id = options.designId || uuidv4()
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ sourceDesign: options.sourceDesign, octopusConverter: this })
    this._pkg = readPackageUpAsync({ cwd: __dirname })
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  get octopusManifest(): OctopusManifest {
    return this._octopusManifest
  }

  get id(): string {
    return this._id
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  get pkgVersion(): Promise<string> {
    return this._pkg.then((normalized) => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson.version
    })
  }

  private async _convertComponentSafe() {
    try {
      const value = await new ComponentConverter({ octopusConverter: this }).convert()
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

  async convertDesign(options?: ConvertDesignOptions): Promise<ConvertDesignResult | null> {
    const exporter = isObject(options?.exporter) ? (options?.exporter as AbstractExporter) : null
    if (exporter == null) return null

    this.octopusManifest.registerBasePath(await exporter?.getBasePath?.())

    /** First Manifest save  */
    this._exportManifest(exporter)

    /** Images */
    const images = await Promise.all(
      this._sourceDesign.images.map(async (image) => {
        const imageId = path.basename(image.path)
        const imagePath = await rejectTo(exporter?.exportImage?.(image.name, image.path))
        if (typeof imagePath === 'string') {
          this.octopusManifest.setExportedImage(imageId, imagePath)
        }
        return image
      })
    )

    /** Component */
    const componentResult = await this._convertComponentById(this._sourceDesign.component.id)
    const componentPath = await exporter?.exportComponent?.(componentResult)
    const { time, error } = componentResult
    this.octopusManifest.setExportedComponent(componentResult.id, { path: componentPath, time, error })

    /** Final trigger of Manifest save */
    const manifest = await this._exportManifest(exporter)

    /** Trigger finalizer */
    exporter?.finalizeExport?.()

    return {
      manifest,
      components: [componentResult],
      images,
    }
  }
}
