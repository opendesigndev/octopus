import path from 'path'

import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark'
import { isObject } from '@avocode/octopus-common/dist/utils/common'
import readPackageUpAsync from 'read-pkg-up'
import { v4 as uuidv4 } from 'uuid'

import { OctopusManifest } from './entities/octopus/octopus-manifest'
import { ArtboardConverter } from './services/conversion/artboard-converter'
import { LocalExporter } from './services/exporters/local-exporter'
import { TempExporter } from './services/exporters/temp-exporter'
import { createEnvironment } from './services/general/environment'
import { createSentry } from './services/general/sentry'
import { logger, set as setLogger } from './services/instances/logger'
import { logError } from './services/instances/misc'
import { set as setSentry } from './services/instances/sentry'
import { PSDFileReader } from './services/readers/psd-file-reader'
import { SourceFileReader } from './services/readers/source-file-reader'

import type { SourceDesign, SourceImage } from './entities/source/source-design'
import type { ArtboardConversionOptions } from './services/conversion/artboard-converter'
import type { AbstractExporter } from './services/exporters/abstract-exporter'
import type { Logger } from './typings'
import type { Manifest } from './typings/manifest'
import type { Octopus } from './typings/octopus'
import type { NormalizedReadResult } from 'read-pkg-up'

export { LocalExporter, TempExporter }
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
    TEMP: TempExporter,
  }

  constructor(options: OctopusPSDConverterOptions) {
    this._id = options.designId || uuidv4()
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ sourceDesign: options.sourceDesign, octopusConverter: this })
    this._pkg = readPackageUpAsync({ cwd: __dirname })

    this._setupLogger(options?.logger)
    setSentry(
      createSentry({
        dsn: process.env.SENTRY_DSN,
        logger,
      })
    )
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

  private async _convertArtboardSafe(options: ArtboardConversionOptions) {
    try {
      const value = await new ArtboardConverter({ ...options, octopusConverter: this }).convert()
      return { value, error: null }
    } catch (error) {
      logError('Converting Artboard failed', { error })
      return { value: undefined, error }
    }
  }

  private async _convertArtboard(options: ArtboardConversionOptions): Promise<ArtboardConversionResult> {
    const id = options.sourceDesign.artboard.id
    const { time, result } = await benchmarkAsync(() => this._convertArtboardSafe(options))
    const { value, error } = result
    return { id, value, error, time }
  }

  private async _exportManifest(exporter: AbstractExporter | null): Promise<Manifest['OctopusManifest']> {
    const { time, result: manifest } = await benchmarkAsync(() => this.octopusManifest.convert())
    await exporter?.exportManifest?.({ manifest, time })
    return manifest
  }

  async convertDesign(options?: ConvertDesignOptions): Promise<ConvertDesignResult> {
    const exporter = isObject(options?.exporter) ? (options?.exporter as AbstractExporter) : null

    this.octopusManifest.registerBasePath(await exporter?.getBasePath?.())

    /** First Manifest save  */
    this._exportManifest(exporter)

    /** Images */
    const images = await Promise.all(
      this._sourceDesign.images.map(async (image) => {
        const imageId = path.basename(image.path)
        const imagePath = await exporter?.exportImage?.(image.name, image.path)
        if (typeof imagePath === 'string') {
          this.octopusManifest.setExportedImage(imageId, imagePath)
        }
        return image
      })
    )

    /** Artboard */
    const artboardResult = await this._convertArtboard({ sourceDesign: this._sourceDesign })
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
