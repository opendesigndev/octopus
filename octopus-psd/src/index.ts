import path from 'path'

import { rejectTo } from '@avocode/octopus-common/dist/utils/async'
import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark'
import { isObject } from '@avocode/octopus-common/dist/utils/common'
import readPackageUpAsync from 'read-pkg-up'
import { v4 as uuidv4 } from 'uuid'

import { OctopusManifest } from './entities/octopus/octopus-manifest.js'
import { ArtboardConverter } from './services/conversion/artboard-converter.js'
import { DebugExporter } from './services/exporters/debug-exporter.js'
import { LocalExporter } from './services/exporters/local-exporter.js'
import { createEnvironment } from './services/general/environment.js'
import { createSentry } from './services/general/sentry.js'
import { logger, set as setLogger } from './services/instances/logger.js'
import { logError } from './services/instances/misc.js'
import { set as setSentry } from './services/instances/sentry.js'
import { PSDFileReader } from './services/readers/psd-file-reader.js'
import { SourceFileReader } from './services/readers/source-file-reader.js'

import type { SourceDesign, SourceImage } from './entities/source/source-design.js'
import type { AbstractExporter } from './services/exporters/abstract-exporter.js'
import type { Logger } from './typings/index.js'
import type { Manifest } from './typings/manifest.js'
import type { Octopus } from './typings/octopus.js'
import type { NormalizedReadResult } from 'read-pkg-up'

export { LocalExporter, DebugExporter }
export { PSDFileReader, SourceFileReader }

type ConvertDesignOptions = {
  exporter?: AbstractExporter
}

export type ConvertDesignResult = {
  manifest: Manifest['OctopusManifest']
  artboards: ArtboardConversionResult[]
  images: SourceImage[]
}

type OctopusPSDConverterGeneralOptions = {
  designId?: string
  logger?: Logger
}

type OctopusPSDConverterOptions = OctopusPSDConverterGeneralOptions & {
  sourceDesign: SourceDesign
}

export type ArtboardConversionResult = {
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

  private async _convertArtboardSafe() {
    try {
      const value = await new ArtboardConverter({ octopusConverter: this }).convert()
      return { value, error: null }
    } catch (error) {
      logError('Converting Artboard failed', { error })
      return { value: undefined, error }
    }
  }

  private async _convertArtboardById(id: string): Promise<ArtboardConversionResult> {
    const { time, result } = await benchmarkAsync(() => this._convertArtboardSafe())
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

    /** Artboard */
    const artboardResult = await this._convertArtboardById(this._sourceDesign.artboard.id)
    const artboardPath = await exporter?.exportArtboard?.(artboardResult)
    const { time, error } = artboardResult
    this.octopusManifest.setExportedArtboard(artboardResult.id, { path: artboardPath, time, error })

    /** Final trigger of Manifest save */
    const manifest = await this._exportManifest(exporter)

    /** Trigger finalizer */
    exporter?.finalizeExport?.()

    return {
      manifest,
      artboards: [artboardResult],
      images,
    }
  }
}
