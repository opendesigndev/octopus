import { isObject } from '@avocode/octopus-common/dist/utils/common'
import path from 'path'
import { performance } from 'perf_hooks'
import type { NormalizedReadResult } from 'read-pkg-up'
import readPackageUpAsync from 'read-pkg-up'
import { v4 as uuidv4 } from 'uuid'

import { OctopusManifest } from './entities/octopus/octopus-manifest'
import type { SourceDesign, SourceImage } from './entities/source/source-design'
import { ArtboardConversionOptions, ArtboardConverter } from './services/conversion/artboard-converter'
import { AbstractExporter } from './services/exporters/abstract-exporter'
import { LocalExporter } from './services/exporters/local-exporter'
import { TempExporter } from './services/exporters/temp-exporter'
import { createEnvironment } from './services/general/environment'
import { createSentry } from './services/general/sentry'
import { logger, set as setLogger } from './services/instances/logger'
import { logError } from './services/instances/misc'
import { set as setSentry } from './services/instances/sentry'
import { PSDFileReader } from './services/readers/psd-file-reader'
import type { Logger } from './typings'
import { OctopusManifestReport } from './typings/manifest'
import type { Octopus } from './typings/octopus'

export { LocalExporter }
export { TempExporter }

export { PSDFileReader }

type ConvertDesignOptions = {
  exporter?: AbstractExporter
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
  manifest: OctopusManifestReport
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
    const timeStart = performance.now()
    const { value, error } = await this._convertArtboardSafe(options)
    const time = performance.now() - timeStart
    return { id, value, error, time }
  }

  async convertDesign(
    options?: ConvertDesignOptions
  ): Promise<{ manifest: OctopusManifestReport; artboards: ArtboardConversionResult[]; images: SourceImage[] }> {
    const exporter = isObject(options?.exporter) ? (options?.exporter as AbstractExporter) : null

    this.octopusManifest.registerBasePath(await exporter?.getBasePath?.())

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
    const artboard = await this._convertArtboard({ sourceDesign: this._sourceDesign })
    if (!artboard.error) {
      const artboardPath = await exporter?.exportArtboard?.(artboard)
      if (typeof artboardPath === 'string') {
        this.octopusManifest.setExportedArtboard(artboard.id, artboardPath)
      }
    }

    /** Manifest */
    const timeStart = performance.now()
    const manifest = await this.octopusManifest.convert()
    const time = performance.now() - timeStart

    await exporter?.exportManifest?.({ manifest, time })

    return {
      manifest,
      artboards: [artboard],
      images,
    }
  }
}
